import type {
  BookingStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  bookingAvatarInclude,
  resolveBookingClientAvatar,
  type BookingWithClientAvatars,
} from "../../format/client-avatar.js";
import { bookingPackageInclude } from "../../format/package-cover.js";
import {
  buildLifecycleContext,
  canPhotographerCancelBooking,
} from "../../domain/booking-lifecycle.js";
import {
  createNotification,
  findClientUserForBooking,
} from "../../domain/notification-dispatch.js";
import {
  notifyClientFinalBalanceDue,
  notifyClientOfBookingEvent,
} from "../../domain/booking-notifications.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import {
  buildPaginatedResult,
  type PaginationParams,
} from "../../lib/pagination.js";
import {
  addMinutes,
} from "../../format/session-datetime.js";
import { assertBookingSlotAvailable } from "../availability/availability.service.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  toApiBooking,
  toApiBookingDetail,
} from "./bookings.mapper.js";
import {
  defaultTimeline,
  listPaymentRequestsForBooking,
  nextBookingReference,
  parseSessionDate,
  resolveBookingDurationMinutes,
  resolveDepositPercentForStudioPackage,
} from "./bookings.shared.js";
import {
  createDepositRequest,
  ensureBalancePaymentRequest,
} from "./booking-obligations.service.js";

type CreatePhotographerBookingInput = {
  clientId?: string;
  clientName: string;
  email: string;
  avatarAssetKey?: string;
  servicePackageId?: string;
  packageName: string;
  packageDetail: string;
  date: string;
  time: string;
  packagePrice?: number;
  venue?: string;
  locationNotes?: string;
};

export async function listPhotographerBookings(
  photographerUserId: string,
  pagination?: PaginationParams,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const where = { studioId: studio.id };

  const query = {
    where,
    orderBy: { sessionAt: "desc" as const },
    include: bookingAvatarInclude,
  };

  if (!pagination) {
    const bookings = await prisma.booking.findMany(query);
    return bookings.map((booking) =>
      toApiBooking(
        booking,
        studio.slug,
        resolveBookingClientAvatar(booking as BookingWithClientAvatars),
      ),
    );
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      ...query,
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return buildPaginatedResult(
    bookings.map((booking) =>
      toApiBooking(
        booking,
        studio.slug,
        resolveBookingClientAvatar(booking as BookingWithClientAvatars),
      ),
    ),
    total,
    pagination,
  );
}

export async function getPhotographerBooking(
  photographerUserId: string,
  bookingId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, studioId: studio.id },
    include: { ...bookingAvatarInclude, ...bookingPackageInclude, client: true },
  });
  if (!booking) return null;
  const avatar = resolveBookingClientAvatar(booking as BookingWithClientAvatars);
  return toApiBooking(booking, studio.slug, avatar);
}

export async function getPhotographerBookingDetail(
  photographerUserId: string,
  bookingId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, studioId: studio.id },
    include: {
      ...bookingAvatarInclude,
      ...bookingPackageInclude,
      client: true,
      gallery: {
        select: {
          workflowStatus: true,
          photoCount: true,
        },
      },
      clientUser: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
  });
  if (!booking) return null;
  const avatar = resolveBookingClientAvatar(booking as BookingWithClientAvatars);
  const unpaidRequests = await listPaymentRequestsForBooking(booking.id);
  const pendingVerification = await prisma.paymentVerification.findFirst({
    where: { bookingId: booking.id, status: "pending" },
    orderBy: { submittedAt: "desc" },
    select: { id: true },
  });
  return toApiBookingDetail(
    booking,
    avatar,
    unpaidRequests,
    pendingVerification?.id ?? null,
    "photographer",
    {
      crmClient: booking.client,
      linkedUser: booking.clientUser,
    },
  );
}

export async function createPhotographerBooking(
  photographerUserId: string,
  input: CreatePhotographerBookingInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const email = input.email.trim().toLowerCase();

  const crmClient = input.clientId
    ? await prisma.studioClient.findFirst({
        where: { id: input.clientId, studioId: studio.id },
      })
    : await prisma.studioClient.findFirst({
        where: { studioId: studio.id, email },
      });

  const reference = await nextBookingReference();
  const sessionAt = parseSessionDate(input.date, input.time);
  const durationMinutes = await resolveBookingDurationMinutes(
    studio.id,
    input.servicePackageId,
  );
  const sessionEndAt = addMinutes(sessionAt, durationMinutes);

  await assertBookingSlotAvailable(
    studio.id,
    input.servicePackageId,
    sessionAt,
    durationMinutes,
  );

  const packagePrice = input.packagePrice ?? 650_000;
  const depositPercent = await resolveDepositPercentForStudioPackage(studio.id, input);
  const depositAmount = Math.round(packagePrice * (depositPercent / 100));

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        studioId: studio.id,
        clientId: crmClient?.id,
        reference,
        clientName: input.clientName.trim(),
        clientEmail: email,
        clientAvatarAssetKey: input.avatarAssetKey ?? crmClient?.avatarAssetKey,
        packageName: input.packageName,
        packageDetail: input.packageDetail,
        packagePrice,
        depositPercent,
        packageIncludes: [
          "Professional photographer",
          input.packageDetail,
          "Edited digital gallery",
          "Online delivery",
        ],
        servicePackageId: input.servicePackageId,
        sessionAt,
        sessionEndAt,
        durationMinutes,
        sessionDateLabel: input.date,
        sessionTime: input.time,
        timeWindow: `${input.time} (Session)`,
        venue: input.venue ?? input.locationNotes ?? "Studio Location TBD",
        city: "Kigali, Rwanda",
        locationNotes: input.locationNotes,
        status: "pending",
        paymentStatus: "unpaid",
        detailStatus: "pending",
        timeline: defaultTimeline(input.packageName, input.date, input.time),
        progressStep: 0,
        galleryStep: 0,
        paymentMeta: {
          statusLabel: "Deposit Required",
          amountPaid: 0,
          transactionRef: "—",
          paymentDate: "—",
          verificationStatus: "pending",
          note: "Pay your deposit via MoMo to confirm your session slot.",
        },
        clientMeta: {
          phone: crmClient?.phone,
          preferredSince: crmClient?.memberSince.getFullYear() ?? 2024,
        },
      },
    });

    await createDepositRequest(
      tx,
      created.id,
      studio.id,
      reference,
      input.packageName,
      depositAmount,
      sessionAt,
    );

    return created;
  });

  const clientUser = await findClientUserForBooking({
    clientUserId: crmClient?.linkedUserId ?? null,
    clientEmail: email,
  });

  if (clientUser) {
    if (!booking.clientUserId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { clientUserId: clientUser.id },
      });
    }

    await createNotification({
      userId: clientUser.id,
      category: "booking",
      title: "New booking from studio",
      description: `${studio.name} scheduled a ${input.packageName} session for ${input.date} at ${input.time}. Pay your deposit to confirm your slot.`,
      actionHref: `/client/bookings/${booking.id}`,
      metadata: {
        icon: "calendar",
        priority: "high",
        primaryAction: {
          label: "View booking",
          href: `/client/bookings/${booking.id}`,
        },
        actionLabel: "viewDetails",
      },
    });
  }

  return toApiBooking(booking, studio.slug);
}

export async function updatePhotographerBookingStatus(
  photographerUserId: string,
  bookingId: string,
  status: BookingStatus,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, studioId: studio.id },
  });
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (status === "cancelled") {
    const pendingVerification = await prisma.paymentVerification.findFirst({
      where: { bookingId, status: "pending" },
      select: { id: true },
    });
    const lifecycleContext = buildLifecycleContext(pendingVerification?.id ?? null);

    if (!canPhotographerCancelBooking(booking, lifecycleContext)) {
      throw new AppError(
        "This booking cannot be cancelled after a deposit has been submitted or verified. Use the refund process if needed.",
        409,
      );
    }
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      ...(status === "confirmed"
        ? {
            detailStatus: "confirmed",
            progressStep: Math.max(booking.progressStep, 3),
          }
        : {}),
      ...(status === "cancelled" ? { detailStatus: "cancelled" } : {}),
      ...(status === "completed"
        ? {
            detailStatus: "completed",
            progressStep: Math.max(booking.progressStep, 4),
            paymentMeta: {
              ...((booking.paymentMeta ?? {}) as Record<string, unknown>),
              statusLabel: "Final balance due",
              note: "Your session is complete. Pay the remaining balance to unlock gallery delivery.",
              sessionCompletedAt: new Date().toISOString(),
            },
          }
        : {}),
    },
  });

  if (status === "cancelled") {
    await notifyClientOfBookingEvent("cancelled", booking, studio.name);
  }

  if (status === "confirmed" && booking.status !== "confirmed") {
    await notifyClientOfBookingEvent("confirmed", updated, studio.name);
  }

  if (status === "completed") {
    await ensureBalancePaymentRequest(bookingId);
    await notifyClientFinalBalanceDue(updated, studio.name);
  }

  return toApiBooking(updated, studio.slug);
}

export async function setGalleryReleaseOverride(
  photographerUserId: string,
  bookingId: string,
  enabled: boolean,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, studioId: studio.id },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const existingMeta = (booking.paymentMeta ?? {}) as Record<string, unknown>;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentMeta: {
        ...existingMeta,
        galleryReleaseOverride: enabled,
      },
    },
  });

  return getPhotographerBookingDetail(photographerUserId, bookingId);
}

export async function reschedulePhotographerBooking(
  photographerUserId: string,
  bookingId: string,
  input: { date: string; time: string },
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, studioId: studio.id },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status === "cancelled" || booking.status === "completed") {
    throw new AppError("This booking cannot be rescheduled", 409);
  }

  const sessionAt = parseSessionDate(input.date, input.time);
  const durationMinutes =
    booking.durationMinutes ||
    (await resolveBookingDurationMinutes(studio.id, booking.servicePackageId));
  const sessionEndAt = addMinutes(sessionAt, durationMinutes);

  await assertBookingSlotAvailable(
    studio.id,
    booking.servicePackageId,
    sessionAt,
    durationMinutes,
    booking.id,
  );

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      sessionAt,
      sessionEndAt,
      durationMinutes,
      sessionDateLabel: input.date,
      sessionTime: input.time,
      timeWindow: `${input.time} (Session)`,
    },
  });

  await notifyClientOfBookingEvent("rescheduled", updated, studio.name);

  return toApiBooking(updated, studio.slug);
}
