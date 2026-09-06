import type {
  BookingStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  resolveBookingClientAvatar,
  type BookingWithClientAvatars,
} from "../../format/client-avatar.js";
import { bookingPackageInclude } from "../../format/package-cover.js";
import {
  createNotification,
  findStudioOwnerUserId,
} from "../../domain/notification-dispatch.js";
import {
  addMinutes,
  parseDurationMinutes,
} from "../../format/session-datetime.js";
import { assertBookingSlotAvailable } from "../availability/availability.service.js";
import { AppError } from "../../middleware/error-handler.js";
import { formatRwf } from "../../format/currency-format.js";
import {
  toApiBooking,
  toApiBookingDetail,
} from "./bookings.mapper.js";
import {
  defaultInsights,
  defaultPreferences,
} from "../clients/clients.mapper.js";
import {
  defaultTimeline,
  getClientUser,
  listPaymentRequestsForBooking,
  nextBookingReference,
  parseSessionDate,
} from "./bookings.shared.js";
import {
  createDepositRequest,
} from "./booking-obligations.service.js";

type CreateClientBookingInput = {
  servicePackageId: string;
  date: string;
  time: string;
  locationNotes: string;
};

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

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
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
          statusLabel: `Deposit Required (${formatRwf(depositAmount)})`,
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
      tx,
      created.id,
      studio.id,
      reference,
      pkg.title,
      depositAmount,
      sessionAt,
    );

    return created;
  });

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
