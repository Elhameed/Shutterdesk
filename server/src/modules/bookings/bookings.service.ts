import type {
  BookingPaymentStatus,
  BookingStatus,
  PaymentRequestType,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  bookingAvatarInclude,
  resolveBookingClientAvatar,
  type BookingWithClientAvatars,
} from "../../lib/client-avatar.js";
import { bookingPackageInclude } from "../../lib/package-cover.js";
import {
  buildLifecycleContext,
  canPhotographerCancelBooking,
} from "../../lib/booking-lifecycle.js";
import {
  createNotification,
  findClientUserForBooking,
  findStudioOwnerUserId,
} from "../../lib/notification-dispatch.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import {
  buildPaginatedResult,
  type PaginationParams,
} from "../../lib/pagination.js";
import {
  addMinutes,
  buildSessionDateTime,
  parseDurationMinutes,
} from "../../lib/session-datetime.js";
import { assertBookingSlotAvailable } from "../availability/availability.service.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  toApiBooking,
  toApiBookingDetail,
  toApiPaymentRequest,
} from "./bookings.mapper.js";
import {
  defaultInsights,
  defaultPreferences,
} from "../clients/clients.mapper.js";

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

const DEFAULT_DEPOSIT_PERCENT = 50;

async function resolveDepositPercentForStudioPackage(
  studioId: string,
  input: Pick<
    CreatePhotographerBookingInput,
    "servicePackageId" | "packageName"
  >,
) {
  if (input.servicePackageId) {
    const pkg = await prisma.servicePackage.findFirst({
      where: { id: input.servicePackageId, studioId, isActive: true },
      select: { depositPercent: true },
    });
    if (pkg) {
      return pkg.depositPercent;
    }
  }

  const pkgByName = await prisma.servicePackage.findFirst({
    where: {
      studioId,
      isActive: true,
      title: { equals: input.packageName.trim(), mode: "insensitive" },
    },
    select: { depositPercent: true },
    orderBy: { updatedAt: "desc" },
  });

  return pkgByName?.depositPercent ?? DEFAULT_DEPOSIT_PERCENT;
}

type CreateClientBookingInput = {
  servicePackageId: string;
  date: string;
  time: string;
  locationNotes: string;
};

function parseSessionDate(dateLabel: string, timeLabel?: string): Date {
  if (timeLabel) {
    return buildSessionDateTime(dateLabel, timeLabel);
  }

  const parsed = new Date(dateLabel);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date();
}

async function resolveBookingDurationMinutes(
  studioId: string,
  servicePackageId?: string | null,
) {
  if (!servicePackageId) {
    return 60;
  }

  const pkg = await prisma.servicePackage.findFirst({
    where: { id: servicePackageId, studioId },
    select: { duration: true },
  });

  return parseDurationMinutes(pkg?.duration);
}

async function nextBookingReference() {
  const bookings = await prisma.booking.findMany({
    select: { reference: true },
  });

  let max = 7740;
  for (const { reference } of bookings) {
    const match = reference.match(/^BK-(\d+)$/);
    if (match) {
      max = Math.max(max, Number.parseInt(match[1], 10));
    }
  }

  return `BK-${max + 1}`;
}

function defaultTimeline(_title: string, dateLabel: string, time: string) {
  return [
    {
      id: "1",
      title: "Booking Requested",
      timestamp: `${dateLabel} • ${time}`,
      state: "completed",
    },
    {
      id: "2",
      title: "Package Selected",
      timestamp: `${dateLabel} • ${time}`,
      state: "completed",
    },
    {
      id: "3",
      title: "Deposit Due",
      timestamp: "Current Status",
      state: "current",
      note: "Upload your MoMo receipt after paying the studio.",
    },
  ];
}

async function listPaymentRequestsForBooking(bookingId: string) {
  return prisma.paymentRequest.findMany({
    where: { bookingId },
    select: { id: true, amount: true, type: true, status: true },
  });
}

async function createDepositRequest(
  bookingId: string,
  studioId: string,
  reference: string,
  title: string,
  amount: number,
  dueDate: Date,
) {
  return prisma.paymentRequest.create({
    data: {
      bookingId,
      studioId,
      type: "deposit",
      amount,
      status: "unpaid",
      dueDate,
      invoiceRef: `INV-2026-${bookingId.slice(0, 8).toUpperCase()}`,
      bookingReference: reference,
      bookingTitle: title,
    },
  });
}

export async function ensureBalancePaymentRequest(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { paymentRequests: true },
  });

  if (!booking) {
    return;
  }

  if (booking.status === "cancelled") {
    return;
  }

  const remaining = booking.packagePrice - booking.amountPaid;
  if (remaining <= 0) {
    return;
  }

  const openRequests = booking.paymentRequests.filter(
    (request) => request.status === "unpaid" || request.status === "pending",
  );
  const openTotal = openRequests.reduce((total, request) => total + request.amount, 0);

  if (openTotal >= remaining) {
    return;
  }

  const balanceAmount = remaining - openTotal;
  const existingBalance = openRequests.find((request) => request.type === "balance");

  if (existingBalance) {
    if (existingBalance.amount !== balanceAmount) {
      await prisma.paymentRequest.update({
        where: { id: existingBalance.id },
        data: { amount: balanceAmount },
      });
    }
    return;
  }

  await prisma.paymentRequest.create({
    data: {
      bookingId: booking.id,
      studioId: booking.studioId,
      type: "balance",
      amount: balanceAmount,
      status: "unpaid",
      dueDate: booking.sessionAt,
      invoiceRef: `INV-BAL-${booking.id.slice(0, 8).toUpperCase()}`,
      bookingReference: booking.reference,
      bookingTitle: booking.packageName,
    },
  });
}

export async function syncClientPaymentObligations(clientUserId: string) {
  const user = await getClientUser(clientUserId);
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
      status: "completed",
    },
    select: { id: true },
  });

  await Promise.all(
    bookings.map((booking) => ensureBalancePaymentRequest(booking.id)),
  );
}

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

  const booking = await prisma.booking.create({
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
    booking.id,
    studio.id,
    reference,
    input.packageName,
    depositAmount,
    sessionAt,
  );

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
    await notifyClientBookingCancelled(booking, studio.name);
  }

  if (status === "confirmed" && booking.status !== "confirmed") {
    await notifyClientBookingConfirmed(updated, studio.name);
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

async function notifyClientFinalBalanceDue(
  booking: {
    id: string;
    clientUserId: string | null;
    clientEmail: string;
    packageName: string;
    packagePrice: number;
    amountPaid: number;
  },
  studioName: string,
) {
  const remaining = booking.packagePrice - booking.amountPaid;
  if (remaining <= 0) {
    return;
  }

  const clientUser = await findClientUserForBooking(booking);
  if (!clientUser) {
    return;
  }

  await createNotification({
    userId: clientUser.id,
    category: "payment",
    title: "Final balance due",
    description: `${studioName} marked your ${booking.packageName} session complete. Pay the remaining RWF ${remaining.toLocaleString("en-US")} to unlock your gallery.`,
    actionHref: `/client/bookings/${booking.id}`,
    metadata: {
      icon: "payment",
      priority: "high",
      actionLabel: "viewDetails",
    },
  });
}

async function notifyClientBookingCancelled(
  booking: {
    id: string;
    clientUserId: string | null;
    clientEmail: string;
    packageName: string;
    sessionDateLabel: string;
    sessionTime: string;
    venue: string | null;
  },
  studioName: string,
) {
  const clientUser = await findClientUserForBooking(booking);

  if (!clientUser) {
    return;
  }

  await createNotification({
    userId: clientUser.id,
    category: "booking",
    title: "Booking cancelled",
    description: `${studioName} cancelled your ${booking.packageName} session scheduled for ${booking.sessionDateLabel} at ${booking.sessionTime}.`,
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

async function notifyClientBookingConfirmed(
  booking: {
    id: string;
    clientUserId: string | null;
    clientEmail: string;
    packageName: string;
    sessionDateLabel: string;
    sessionTime: string;
  },
  studioName: string,
) {
  const clientUser = await findClientUserForBooking(booking);
  if (!clientUser) {
    return;
  }

  await createNotification({
    userId: clientUser.id,
    category: "booking",
    title: "Booking confirmed",
    description: `${studioName} confirmed your ${booking.packageName} session on ${booking.sessionDateLabel} at ${booking.sessionTime}.`,
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

async function notifyClientBookingRescheduled(
  booking: {
    id: string;
    clientUserId: string | null;
    clientEmail: string;
    packageName: string;
    sessionDateLabel: string;
    sessionTime: string;
  },
  studioName: string,
) {
  const clientUser = await findClientUserForBooking(booking);
  if (!clientUser) {
    return;
  }

  await createNotification({
    userId: clientUser.id,
    category: "booking",
    title: "Session rescheduled",
    description: `${studioName} moved your ${booking.packageName} session to ${booking.sessionDateLabel} at ${booking.sessionTime}.`,
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

  await notifyClientBookingRescheduled(updated, studio.name);

  return toApiBooking(updated, studio.slug);
}

async function getClientUser(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  return user;
}

export async function listClientBookings(clientUserId: string) {
  const user = await getClientUser(clientUserId);
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
    },
    include: { studio: true },
    orderBy: { sessionAt: "desc" },
  });
  return bookings.map((booking) => toApiBooking(booking, booking.studio.slug));
}

export async function getClientBooking(clientUserId: string, bookingId: string) {
  const user = await getClientUser(clientUserId);
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
    },
    include: { studio: true, client: true },
  });
  if (!booking) return null;
  return toApiBooking(booking, booking.studio.slug);
}

export async function getClientBookingDetail(
  clientUserId: string,
  bookingId: string,
) {
  const user = await getClientUser(clientUserId);
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
    },
    include: {
      studio: true,
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
      ...bookingPackageInclude,
    },
  });
  if (!booking) return null;
  const paymentRequests = await listPaymentRequestsForBooking(booking.id);
  const pendingVerification = await prisma.paymentVerification.findFirst({
    where: { bookingId: booking.id, status: "pending" },
    orderBy: { submittedAt: "desc" },
    select: { id: true },
  });
  const avatar = resolveBookingClientAvatar(booking as BookingWithClientAvatars);
  return toApiBookingDetail(
    booking,
    avatar,
    paymentRequests,
    pendingVerification?.id ?? null,
    "client",
    {
      crmClient: booking.client,
      linkedUser: booking.clientUser ?? {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    },
  );
}

export async function getUpcomingClientBooking(clientUserId: string) {
  const bookings = await listClientBookings(clientUserId);
  const priority = (booking: { status: BookingStatus }) => {
    if (booking.status === "confirmed") return 0;
    if (booking.status === "pending") return 1;
    return 2;
  };

  return (
    [...bookings]
      .filter(
        (booking) =>
          booking.status !== "completed" && booking.status !== "cancelled",
      )
      .sort((a, b) => priority(a) - priority(b) || a.date.localeCompare(b.date))[0] ??
    null
  );
}

export async function createClientBooking(
  clientUserId: string,
  input: CreateClientBookingInput,
) {
  const user = await getClientUser(clientUserId);
  const pkg = await prisma.servicePackage.findFirst({
    where: { id: input.servicePackageId, isActive: true },
    include: { studio: true },
  });

  if (!pkg) {
    throw new AppError("Service package not available for booking", 404);
  }

  const meta = (pkg.metadata ?? {}) as Record<string, unknown>;
  const badges = Array.isArray(meta.badges)
    ? meta.badges.filter((item): item is string => typeof item === "string")
    : [];

  if (!badges.includes("public")) {
    throw new AppError("This package is not publicly bookable", 403);
  }

  const studio = pkg.studio;

  const crmClient = await prisma.studioClient.findFirst({
    where: {
      studioId: studio.id,
      email: user.email.toLowerCase(),
    },
  });

  if (crmClient && !crmClient.linkedUserId) {
    await prisma.studioClient.update({
      where: { id: crmClient.id },
      data: {
        linkedUserId: user.id,
        ...(user.avatarUrl ? { avatarAssetKey: user.avatarUrl } : {}),
      },
    });
  }

  const linkedCrmClient = crmClient
    ? await prisma.studioClient.findFirst({
        where: { id: crmClient.id },
        include: { linkedUser: { select: { avatarUrl: true } } },
      })
    : null;

  const reference = await nextBookingReference();
  const sessionAt = parseSessionDate(input.date, input.time);
  const durationMinutes = parseDurationMinutes(pkg.duration);
  const sessionEndAt = addMinutes(sessionAt, durationMinutes);

  await assertBookingSlotAvailable(
    studio.id,
    pkg.id,
    sessionAt,
    durationMinutes,
  );

  const depositAmount = Math.round(pkg.price * (pkg.depositPercent / 100));
  const venue = input.locationNotes.trim() || "Location to be confirmed";

  const upsertedClient = linkedCrmClient
    ? linkedCrmClient
    : await prisma.studioClient.create({
        data: {
          studioId: studio.id,
          name: user.fullName,
          email: user.email.toLowerCase(),
          phone: user.phone ?? "",
          category: pkg.category,
          tier: "new",
          avatarAssetKey: user.avatarUrl ?? null,
          sessions: 0,
          revenue: 0,
          balance: 0,
          reliability: 100,
          rating: "good",
          location: "Kigali, Rwanda",
          memberSince: new Date(),
          lastBookingAt: new Date(),
          preferences: defaultPreferences,
          insights: defaultInsights,
          timeline: [],
          projects: [],
          invoices: [],
          galleries: [],
          linkedUserId: user.id,
        },
      });

  const booking = await prisma.booking.create({
    data: {
      studioId: studio.id,
      clientId: upsertedClient.id,
      clientUserId: user.id,
      reference,
      clientName: user.fullName,
      clientEmail: user.email.toLowerCase(),
      clientAvatarAssetKey:
        user.avatarUrl ??
        upsertedClient.avatarAssetKey ??
        null,
      packageName: pkg.title,
      packageDetail: pkg.description.slice(0, 60) || pkg.title,
      packagePrice: pkg.price,
      packageIncludes: [
        "Professionally edited digital files",
        pkg.description || pkg.title,
        "Private online gallery",
        "Studio coordination via Shutterdesk",
      ],
      servicePackageId: pkg.id,
      sessionAt,
      sessionEndAt,
      durationMinutes,
      sessionDateLabel: input.date,
      sessionTime: input.time,
      timeWindow: `${input.time} (Session)`,
      venue,
      city: "Kigali, Rwanda",
      locationNotes: input.locationNotes,
      status: "pending",
      paymentStatus: "unpaid",
      detailStatus: "pending",
      depositPercent: pkg.depositPercent,
      timeline: defaultTimeline(pkg.title, input.date, input.time),
      progressStep: 0,
      galleryStep: 0,
      paymentMeta: {
        statusLabel: `Deposit Required (RWF ${depositAmount.toLocaleString("en-US")})`,
        amountPaid: 0,
        transactionRef: "—",
        paymentDate: "—",
        verificationStatus: "pending",
        note: "Pay your deposit via MoMo to confirm your session slot.",
      },
      clientMeta: {
        phone: user.phone ?? upsertedClient.phone,
        preferredSince: upsertedClient.memberSince.getFullYear(),
      },
    },
  });

  await createDepositRequest(
    booking.id,
    studio.id,
    reference,
    pkg.title,
    depositAmount,
    sessionAt,
  );

  const ownerUserId = await findStudioOwnerUserId(studio.id);
  if (ownerUserId) {
    await createNotification({
      userId: ownerUserId,
      category: "booking",
      title: "New Booking Request",
      description: `${user.fullName} requested a ${pkg.title} session for ${input.date} at ${venue}.`,
      actionHref: `/photographer/bookings/${booking.id}`,
      metadata: {
        icon: "calendar",
        priority: "high",
        primaryAction: {
          label: "View Booking",
          href: `/photographer/bookings/${booking.id}`,
        },
        secondaryAction: { label: "Decline", variant: "link" },
      },
    });
  }

  await createNotification({
    userId: clientUserId,
    category: "booking",
    title: "Booking request submitted",
    description: `Your ${pkg.title} session on ${input.date} at ${input.time} is pending studio confirmation.`,
    actionHref: `/client/bookings/${booking.id}`,
    metadata: {
      icon: "calendar",
      priority: "medium",
      primaryAction: {
        label: "View booking",
        href: `/client/bookings/${booking.id}`,
      },
    },
  });

  return toApiBooking(booking, studio.slug);
}

export async function getClientGalleryIdForBooking(
  clientUserId: string,
  bookingId: string,
) {
  const user = await getClientUser(clientUserId);
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
    },
  });
  return booking?.galleryId ?? undefined;
}

export async function getClientOutstandingSummary(clientUserId: string) {
  await syncClientPaymentObligations(clientUserId);

  const user = await getClientUser(clientUserId);
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
      status: { notIn: ["cancelled"] },
    },
    include: { studio: true },
  });

  const obligations = await listClientPaymentRequests(clientUserId);
  const totalBalance = bookings.reduce(
    (sum, booking) => sum + Math.max(0, booking.packagePrice - booking.amountPaid),
    0,
  );

  return {
    totalBalance,
    unpaidCount: bookings.filter(
      (booking) => booking.packagePrice > booking.amountPaid,
    ).length,
    obligations: obligations.filter((request) => request.status === "unpaid"),
  };
}

export async function listClientPaymentRequests(clientUserId: string) {
  const user = await getClientUser(clientUserId);
  const bookingIds = (
    await prisma.booking.findMany({
      where: {
        OR: [
          { clientUserId: user.id },
          { clientEmail: user.email.toLowerCase() },
        ],
      },
      select: { id: true },
    })
  ).map((item) => item.id);

  const requests = await prisma.paymentRequest.findMany({
    where: { bookingId: { in: bookingIds } },
    include: {
      studio: true,
      booking: { select: { packagePrice: true, amountPaid: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return requests.map((request) =>
    toApiPaymentRequest(request, request.studio.slug, request.studio.name, {
      packagePrice: request.booking.packagePrice,
      amountPaid: request.booking.amountPaid,
    }),
  );
}

export type {
  CreatePhotographerBookingInput,
  CreateClientBookingInput,
  BookingStatus,
  BookingPaymentStatus,
  PaymentRequestType,
};
