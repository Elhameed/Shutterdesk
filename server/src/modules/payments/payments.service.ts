import type { VerificationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  createNotification,
  findClientUserForBooking,
  findStudioOwnerUserId,
} from "../../lib/notification-dispatch.js";
import { loadEnv } from "../../config/env.js";
import {
  isAllowedCloudinaryUrl,
  isCloudinaryConfigured,
} from "../../lib/cloudinary.js";
import { formatDisplayDate } from "../../lib/date-format.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  bookingAvatarInclude,
  resolveClientAvatarKey,
} from "../../lib/client-avatar.js";
import {
  getClientOutstandingSummary,
  listClientPaymentRequests,
} from "../bookings/bookings.service.js";
import {
  parseStudioPaymentProfile,
  toApiClientPaymentRecord,
  toApiPaymentVerification,
  verificationToClientRecord,
} from "./payments.mapper.js";

type UploadReceiptInput = {
  bookingId: string;
  paymentRequestId?: string;
  amount: number;
  receiptImage: string;
  paymentOption?: "deposit" | "full";
};

function normalizeReceiptAssetKey(receiptImage: string) {
  const trimmed = receiptImage.trim();
  if (!trimmed) {
    throw new AppError("A receipt image is required", 400);
  }

  const env = loadEnv();

  if (trimmed.startsWith("blob:")) {
    throw new AppError("Upload the receipt file before submitting", 400);
  }

  if (isCloudinaryConfigured(env)) {
    if (!trimmed.startsWith("http")) {
      throw new AppError("Upload your receipt through the file picker", 400);
    }
    if (!isAllowedCloudinaryUrl(env, trimmed)) {
      throw new AppError("Invalid receipt upload source", 400);
    }
    return trimmed;
  }

  if (trimmed.startsWith("data:") || trimmed.startsWith("http")) {
    return trimmed;
  }
  return trimmed.replace(/^\//, "");
}

function nextTransactionId() {
  return `TXN-${Date.now().toString().slice(-6)}-CL`;
}

async function getClientUser(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  return user;
}

async function assertClientOwnsBooking(
  client: { userId: string; email: string },
  bookingId: string,
) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { clientUserId: client.userId },
        { clientEmail: client.email.toLowerCase() },
      ],
    },
    include: { studio: true },
  });
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }
  return booking;
}

export async function listClientPaymentHistory(clientUserId: string) {
  const user = await getClientUser(clientUserId);

  const [records, pendingVerifications] = await Promise.all([
    prisma.paymentRecord.findMany({
      where: {
        booking: {
          OR: [
            { clientUserId: user.id },
            { clientEmail: user.email.toLowerCase() },
          ],
        },
      },
      include: { studio: true },
      orderBy: { paidAt: "desc" },
    }),
    prisma.paymentVerification.findMany({
      where: {
        booking: {
          OR: [
            { clientUserId: user.id },
            { clientEmail: user.email.toLowerCase() },
          ],
        },
        status: "pending",
      },
      include: { studio: true },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const recordVerificationIds = new Set(
    records
      .map((record) => record.paymentVerificationId)
      .filter((id): id is string => Boolean(id)),
  );

  const pendingItems = pendingVerifications
    .filter((verification) => !recordVerificationIds.has(verification.id))
    .map((verification) =>
      verificationToClientRecord(verification, verification.studio),
    );

  const historyItems = records.map((record) =>
    toApiClientPaymentRecord(record, record.studio.slug),
  );

  return [...pendingItems, ...historyItems];
}

export async function getClientPaymentRequest(
  clientUserId: string,
  requestId: string,
) {
  const requests = await listClientPaymentRequests(clientUserId);
  return requests.find((request) => request.id === requestId) ?? null;
}

export async function getStudioPaymentProfileBySlug(slug: string) {
  const studio = await prisma.studio.findUnique({ where: { slug } });
  if (!studio) {
    throw new AppError("Studio not found", 404);
  }
  return parseStudioPaymentProfile(studio.paymentProfile);
}

export async function uploadClientReceipt(
  clientUserId: string,
  input: UploadReceiptInput,
) {
  const user = await getClientUser(clientUserId);
  const booking = await assertClientOwnsBooking(
    { userId: user.id, email: user.email },
    input.bookingId,
  );

  const paymentRequest = input.paymentRequestId
    ? await prisma.paymentRequest.findFirst({
        where: {
          id: input.paymentRequestId,
          bookingId: booking.id,
        },
      })
    : await prisma.paymentRequest.findFirst({
        where: {
          bookingId: booking.id,
          status: { in: ["unpaid", "rejected"] },
        },
        orderBy: { createdAt: "desc" },
      });

  if (!paymentRequest) {
    throw new AppError("No payable obligation found for this booking", 404);
  }

  if (paymentRequest.status === "pending") {
    throw new AppError("A receipt is already pending verification", 409);
  }

  if (paymentRequest.status === "approved") {
    throw new AppError("This payment has already been approved", 409);
  }

  const receiptAssetKey = normalizeReceiptAssetKey(input.receiptImage);

  const payFull = input.paymentOption === "full";
  const fullRemaining = Math.max(0, booking.packagePrice - booking.amountPaid);
  const amount = payFull ? fullRemaining : paymentRequest.amount;

  if (amount <= 0) {
    throw new AppError("This booking is already paid in full", 409);
  }

  if (input.amount !== undefined && input.amount !== amount) {
    throw new AppError("Receipt amount must match the payment obligation", 400);
  }

  // When the client opts to settle the whole booking, upgrade the obligation so
  // downstream records, labels and revenue reflect a full payment (no balance left).
  if (payFull && (paymentRequest.type !== "full" || paymentRequest.amount !== amount)) {
    await prisma.paymentRequest.update({
      where: { id: paymentRequest.id },
      data: { type: "full", amount },
    });
  }

  const verification = await prisma.paymentVerification.create({
    data: {
      paymentRequestId: paymentRequest.id,
      bookingId: booking.id,
      studioId: booking.studioId,
      clientName: user.fullName,
      clientEmail: user.email.toLowerCase(),
      clientAvatarAssetKey: user.avatarUrl ?? booking.clientAvatarAssetKey,
      transactionId: nextTransactionId(),
      bookingTitle: paymentRequest.bookingTitle ?? booking.packageName,
      packageName: booking.packageName,
      bookingDate: booking.sessionDateLabel,
      amount,
      receiptAssetKey,
      status: "pending",
      highPriority: amount >= 300_000,
    },
    include: { studio: true },
  });

  await prisma.paymentRequest.update({
    where: { id: paymentRequest.id },
    data: { status: "pending" },
  });

  const existingMeta = (booking.paymentMeta ?? {}) as Record<string, unknown>;
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      showVerifyPayment: true,
      detailStatus: "pendingVerification",
      paymentMeta: {
        ...existingMeta,
        paymentOption: payFull ? "full" : "deposit",
        statusLabel: `Receipt submitted (RWF ${amount.toLocaleString("en-US")})`,
        receiptAssetKey,
        transactionRef: verification.transactionId,
        paymentDate: formatDisplayDate(new Date()),
        verificationStatus: "pending",
        note: payFull
          ? "Full payment receipt uploaded — awaiting studio verification."
          : "MoMo receipt uploaded — awaiting studio verification.",
      },
      progressStep: Math.max(booking.progressStep, 1),
    },
  });

  const ownerUserId = await findStudioOwnerUserId(booking.studioId);
  if (ownerUserId) {
    await createNotification({
      userId: ownerUserId,
      category: "payment",
      title: "Payment receipt submitted",
      description: `${user.fullName} submitted a receipt of RWF ${amount.toLocaleString("en-US")} for ${paymentRequest.bookingTitle ?? booking.packageName}.`,
      actionHref: "/photographer/payments",
      metadata: {
        icon: "payment",
        priority: amount >= 300_000 ? "high" : "medium",
        primaryAction: { label: "Review Payment", href: "/photographer/payments" },
      },
    });
  }

  await createNotification({
    userId: user.id,
    category: "payment",
    title: "Payment verification in progress",
    description: `RWF ${amount.toLocaleString("en-US")} for ${paymentRequest.bookingTitle ?? booking.packageName} — awaiting studio verification.`,
    actionHref: `/client/bookings/${booking.id}`,
    metadata: { actionLabel: "viewDetails" },
  });

  return toApiPaymentVerification(verification, verification.studio.slug);
}

export async function listPhotographerVerifications(photographerUserId: string) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const verifications = await prisma.paymentVerification.findMany({
    where: { studioId: studio.id },
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    include: {
      booking: { include: bookingAvatarInclude },
    },
  });

  return verifications.map((verification) =>
    toApiPaymentVerification(
      verification,
      studio.slug,
      resolveClientAvatarKey({
        userAvatarUrl:
          verification.booking.clientUser?.avatarUrl ??
          verification.booking.client?.linkedUser?.avatarUrl,
        studioClientAvatar: verification.booking.client?.avatarAssetKey,
        bookingAvatar:
          verification.clientAvatarAssetKey ??
          verification.booking.clientAvatarAssetKey,
      }),
    ),
  );
}

export async function updateVerificationStatus(
  photographerUserId: string,
  verificationId: string,
  status: VerificationStatus,
) {
  const studio = await getStudioForPhotographer(photographerUserId);

  const verification = await prisma.paymentVerification.findFirst({
    where: { id: verificationId, studioId: studio.id },
    include: {
      booking: true,
      paymentRequest: true,
      studio: true,
    },
  });

  if (!verification) {
    throw new AppError("Verification not found", 404);
  }

  if (verification.status !== "pending") {
    throw new AppError("Only pending verifications can be updated", 409);
  }

  const now = new Date();
  const booking = verification.booking;
  const paymentRequest = verification.paymentRequest;

  if (status === "approved") {
    const newAmountPaid = Math.min(
      booking.packagePrice,
      booking.amountPaid + verification.amount,
    );
    const paymentStatus =
      newAmountPaid >= booking.packagePrice ? "paid" : "partial";
    // A deposit OR a full upfront payment both confirm a still-pending booking.
    const isBookingSecuringPayment =
      paymentRequest?.type === "deposit" || paymentRequest?.type === "full";
    const shouldAutoConfirmBooking =
      isBookingSecuringPayment && booking.status === "pending";

    await prisma.$transaction([
      prisma.paymentVerification.update({
        where: { id: verification.id },
        data: { status: "approved", verifiedAt: now },
      }),
      prisma.paymentRequest.updateMany({
        where: { id: paymentRequest?.id },
        data: { status: "approved" },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus,
          showVerifyPayment: false,
          ...(shouldAutoConfirmBooking
            ? { status: "confirmed", detailStatus: "confirmed" }
            : { detailStatus: "confirmed" }),
          paymentMeta: {
            statusLabel:
              paymentStatus === "paid"
                ? "Full Payment Received"
                : `Partial Payment Received (RWF ${newAmountPaid.toLocaleString("en-US")})`,
            receiptAssetKey: verification.receiptAssetKey,
            amountPaid: newAmountPaid,
            transactionRef: verification.transactionId,
            paymentDate: formatDisplayDate(now),
            verificationStatus: "verified",
            note: shouldAutoConfirmBooking
              ? paymentStatus === "paid"
                ? "Payment received in full — your booking is confirmed."
                : "Deposit verified — your booking is confirmed."
              : "Payment verified by studio.",
          },
          progressStep: Math.max(booking.progressStep, 3),
        },
      }),
      prisma.paymentRecord.create({
        data: {
          clientEmail: verification.clientEmail,
          bookingId: booking.id,
          studioId: studio.id,
          studioName: studio.name,
          paymentRequestId: paymentRequest?.id,
          paymentVerificationId: verification.id,
          bookingTitle: verification.bookingTitle,
          amount: verification.amount,
          paidAt: now,
          status: "approved",
          receiptAssetKey: verification.receiptAssetKey,
        },
      }),
    ]);

    const clientUser = await prisma.user.findUnique({
      where: { email: verification.clientEmail.toLowerCase() },
    });

    if (clientUser) {
      await createNotification({
        userId: clientUser.id,
        category: "payment",
        title: "Payment approved",
        description: `Your payment of RWF ${verification.amount.toLocaleString("en-US")} for ${verification.bookingTitle ?? booking.packageName} has been verified.`,
        actionHref: `/client/bookings/${booking.id}`,
        metadata: { actionLabel: "viewDetails" },
      });

      if (shouldAutoConfirmBooking) {
        await createNotification({
          userId: clientUser.id,
          category: "booking",
          title: "Booking confirmed",
          description: `Your ${booking.packageName} session on ${booking.sessionDateLabel} is confirmed. See you at ${booking.venue ?? "the venue"}!`,
          actionHref: `/client/bookings/${booking.id}`,
          metadata: {
            icon: "calendar",
            priority: "high",
            primaryAction: {
              label: "View booking",
              href: `/client/bookings/${booking.id}`,
            },
          },
        });
      }
    }
  } else if (status === "rejected") {
    await prisma.$transaction([
      prisma.paymentVerification.update({
        where: { id: verification.id },
        data: { status: "rejected", verifiedAt: now },
      }),
      prisma.paymentRequest.updateMany({
        where: { id: paymentRequest?.id },
        data: { status: "unpaid" },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          showVerifyPayment: false,
          detailStatus: "pending",
          paymentMeta: {
            statusLabel: "Payment rejected — please resubmit receipt",
            receiptAssetKey: verification.receiptAssetKey,
            amountPaid: booking.amountPaid,
            transactionRef: verification.transactionId,
            paymentDate: formatDisplayDate(now),
            verificationStatus: "pending",
            note: "Receipt could not be verified. Upload a clearer MoMo slip or contact the studio if you believe this is an error.",
          },
        },
      }),
      prisma.paymentRecord.create({
        data: {
          clientEmail: verification.clientEmail,
          bookingId: booking.id,
          studioId: studio.id,
          studioName: studio.name,
          paymentRequestId: paymentRequest?.id,
          paymentVerificationId: verification.id,
          bookingTitle: verification.bookingTitle,
          amount: verification.amount,
          paidAt: now,
          status: "rejected",
          receiptAssetKey: verification.receiptAssetKey,
        },
      }),
    ]);

    const clientUser = await findClientUserForBooking({
      clientUserId: booking.clientUserId,
      clientEmail: verification.clientEmail,
    });

    if (clientUser) {
      await createNotification({
        userId: clientUser.id,
        category: "payment",
        title: "Payment rejected",
        description: `Your payment of RWF ${verification.amount.toLocaleString("en-US")} for ${verification.bookingTitle ?? booking.packageName} could not be verified. Upload a clearer receipt to try again.`,
        actionHref: `/client/bookings/${booking.id}`,
        metadata: {
          icon: "payment",
          priority: "high",
          actionLabel: "viewDetails",
        },
      });
    }
  } else {
    throw new AppError("Invalid verification status", 400);
  }

  const updated = await prisma.paymentVerification.findUniqueOrThrow({
    where: { id: verification.id },
  });

  return toApiPaymentVerification(updated, studio.slug);
}

export async function requestReceiptResubmission(
  photographerUserId: string,
  verificationId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);

  const verification = await prisma.paymentVerification.findFirst({
    where: { id: verificationId, studioId: studio.id },
    include: {
      booking: true,
      paymentRequest: true,
      studio: true,
    },
  });

  if (!verification) {
    throw new AppError("Verification not found", 404);
  }

  if (verification.status !== "pending") {
    throw new AppError("Only pending verifications can request a new receipt", 409);
  }

  const now = new Date();
  const booking = verification.booking;
  const paymentRequest = verification.paymentRequest;
  const existingMeta = (booking.paymentMeta ?? {}) as Record<string, unknown>;

  await prisma.$transaction([
    prisma.paymentVerification.update({
      where: { id: verification.id },
      data: { status: "rejected", verifiedAt: now },
    }),
    prisma.paymentRequest.updateMany({
      where: { id: paymentRequest?.id },
      data: { status: "unpaid" },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        showVerifyPayment: false,
        detailStatus: "pending",
        paymentMeta: {
          ...existingMeta,
          statusLabel: "New receipt requested",
          receiptAssetKey: verification.receiptAssetKey,
          amountPaid: booking.amountPaid,
          transactionRef: verification.transactionId,
          paymentDate: formatDisplayDate(now),
          verificationStatus: "pending",
          note: "The studio requested a compliant receipt. Upload a clear MoMo slip showing the transaction details.",
          resubmitRequestedAt: now.toISOString(),
          resubmitRequestedBy: studio.name,
        },
      },
    }),
    prisma.paymentRecord.create({
      data: {
        clientEmail: verification.clientEmail,
        bookingId: booking.id,
        studioId: studio.id,
        studioName: studio.name,
        paymentRequestId: paymentRequest?.id,
        paymentVerificationId: verification.id,
        bookingTitle: verification.bookingTitle,
        amount: verification.amount,
        paidAt: now,
        status: "rejected",
        receiptAssetKey: verification.receiptAssetKey,
      },
    }),
  ]);

  const clientUser = await findClientUserForBooking({
    clientUserId: booking.clientUserId,
    clientEmail: verification.clientEmail,
  });

  if (clientUser) {
    await createNotification({
      userId: clientUser.id,
      category: "payment",
      title: "New receipt required",
      description: `${studio.name} requested a compliant payment receipt for ${verification.bookingTitle ?? booking.packageName}. Upload a clearer MoMo slip to continue.`,
      actionHref: `/client/bookings/${booking.id}`,
      metadata: {
        icon: "payment",
        priority: "high",
        actionLabel: "viewDetails",
      },
    });
  }

  const updated = await prisma.paymentVerification.findUniqueOrThrow({
    where: { id: verification.id },
  });

  return toApiPaymentVerification(updated, studio.slug);
}

export { getClientOutstandingSummary, listClientPaymentRequests };
