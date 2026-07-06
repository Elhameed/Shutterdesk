import type { Booking, Gallery, PaymentRequest, StudioClient } from "@prisma/client";
import { prisma } from "./prisma.js";
import { formatDisplayDate } from "./date-format.js";
import { readStoredGallerySettings } from "./gallery-settings.js";
import type { ClientMetrics } from "./client-metrics.js";

export type ClientTimelineType =
  | "upcoming"
  | "gallery"
  | "payment"
  | "feedback"
  | "onboarded";

export type ClientTimelineEvent = {
  id: string;
  type: ClientTimelineType;
  title: string;
  subtitle?: string;
  date: string;
  highlighted?: boolean;
  linkText?: string;
  quote?: string;
  rating?: number;
};

export type ClientProject = {
  id: string;
  bookingId: string;
  status: "completed" | "upcoming";
  category: string;
  title: string;
  date: string;
  photoCount?: number;
  time?: string;
  coverImage: string;
};

export type ClientInvoice = {
  id: string;
  number: string;
  description: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
};

export type ClientGallery = {
  id: string;
  title: string;
  itemCount: number;
  privacy: "private" | "public";
  coverImage: string;
};

export type ClientInsights = {
  retention: string;
  favType: string;
  avgValue: number;
};

export type ClientProfileActivity = {
  timeline: ClientTimelineEvent[];
  projects: ClientProject[];
  invoices: ClientInvoice[];
  galleries: ClientGallery[];
  insights: ClientInsights;
  rating: "excellent" | "good";
  reliability: number;
};

type TimelineEntry = ClientTimelineEvent & { at: Date };

type BookingWithRelations = Booking & {
  gallery: Pick<Gallery, "id" | "coverAssetKey" | "photoCount"> | null;
  servicePackage: { category: string; coverAssetKey: string | null } | null;
};

function capitalizeCategory(value: string) {
  if (!value) return "Portrait";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function resolveProjectStatus(
  booking: Pick<Booking, "status" | "sessionAt">,
  now: Date,
): ClientProject["status"] {
  if (booking.status === "completed") {
    return "completed";
  }

  return booking.sessionAt > now ? "upcoming" : "completed";
}

export function buildProjects(bookings: BookingWithRelations[], client: StudioClient) {
  const now = new Date();

  return bookings.map((booking) => ({
    id: booking.id,
    bookingId: booking.id,
    status: resolveProjectStatus(booking, now),
    category: capitalizeCategory(
      booking.servicePackage?.category ?? client.category,
    ),
    title: booking.packageName,
    date: booking.sessionDateLabel,
    time: booking.sessionTime,
    photoCount: booking.gallery?.photoCount ?? undefined,
    coverImage:
      booking.gallery?.coverAssetKey ??
      booking.servicePackage?.coverAssetKey ??
      "",
  }));
}

export function buildInvoices(paymentRequests: PaymentRequest[]) {
  return paymentRequests.map((request) => ({
    id: request.id,
    number:
      request.invoiceRef ??
      `INV-${request.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
    description:
      request.bookingTitle ??
      `${request.type.charAt(0).toUpperCase()}${request.type.slice(1)} payment`,
    date: formatDisplayDate(request.createdAt),
    amount: request.amount,
    status:
      request.status === "approved"
        ? ("paid" as const)
        : ("pending" as const),
  }));
}

export function buildGalleries(galleries: Gallery[]) {
  return galleries.map((gallery) => {
    const settings = readStoredGallerySettings(gallery);

    return {
      id: gallery.id,
      title: gallery.title,
      itemCount: gallery.photoCount,
      privacy:
        settings.visibility === "public"
          ? ("public" as const)
          : ("private" as const),
      coverImage: gallery.coverAssetKey ?? "",
    };
  });
}

export function buildTimeline(
  client: StudioClient,
  bookings: BookingWithRelations[],
  galleries: Gallery[],
  paymentRecords: Array<{
    id: string;
    amount: number;
    bookingTitle: string;
    paidAt: Date;
  }>,
) {
  const now = new Date();
  const entries: TimelineEntry[] = [];

  entries.push({
    id: `onboarded-${client.id}`,
    type: "onboarded",
    title: "Client Onboarded",
    subtitle: `${client.name} was added to your CRM.`,
    date: formatDisplayDate(client.createdAt),
    at: client.createdAt,
  });

  for (const booking of bookings) {
    const isUpcoming =
      booking.sessionAt > now && booking.status !== "completed";

    if (isUpcoming) {
      entries.push({
        id: `upcoming-${booking.id}`,
        type: "upcoming",
        title: booking.packageName,
        subtitle: `${booking.sessionDateLabel} · ${booking.sessionTime}`,
        date: formatDisplayDate(booking.sessionAt),
        highlighted: true,
        at: booking.sessionAt,
      });
      continue;
    }

    entries.push({
      id: `session-${booking.id}`,
      type: "feedback",
      title: `${booking.packageName} session`,
      subtitle:
        booking.status === "completed"
          ? "Session completed"
          : `Booking ${booking.status}`,
      date: formatDisplayDate(booking.sessionAt),
      at: booking.sessionAt,
    });
  }

  for (const record of paymentRecords) {
    entries.push({
      id: `payment-${record.id}`,
      type: "payment",
      title: `Payment received — RWF ${record.amount.toLocaleString("en-US")}`,
      subtitle: record.bookingTitle,
      date: formatDisplayDate(record.paidAt),
      at: record.paidAt,
    });
  }

  for (const gallery of galleries) {
    if (gallery.workflowStatus !== "delivered") {
      continue;
    }

    entries.push({
      id: `gallery-${gallery.id}`,
      type: "gallery",
      title: `Gallery delivered — ${gallery.title}`,
      date: formatDisplayDate(gallery.updatedAt),
      at: gallery.updatedAt,
    });
  }

  return entries
    .sort((left, right) => right.at.getTime() - left.at.getTime())
    .map((entry) => {
      const { at, ...event } = entry;
      void at;
      return event;
    });
}

export function buildInsights(
  client: StudioClient,
  bookings: BookingWithRelations[],
  metrics: ClientMetrics,
): ClientInsights {
  const categoryCounts = new Map<string, number>();

  for (const booking of bookings) {
    const category = booking.servicePackage?.category ?? client.category;
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  let favType = client.category;
  let highestCount = 0;

  for (const [category, count] of categoryCounts) {
    if (count > highestCount) {
      highestCount = count;
      favType = category as StudioClient["category"];
    }
  }

  const retention =
    metrics.sessions >= 3
      ? "High"
      : metrics.sessions >= 2
        ? "Returning"
        : "New";

  return {
    retention,
    favType: capitalizeCategory(favType),
    avgValue:
      metrics.sessions > 0
        ? Math.round(metrics.revenue / metrics.sessions)
        : 0,
  };
}

function computeReliability(
  metrics: ClientMetrics,
  paymentRequests: PaymentRequest[],
) {
  if (paymentRequests.length === 0) {
    return metrics.balance === 0 ? 100 : 90;
  }

  const approved = paymentRequests.filter(
    (request) => request.status === "approved",
  ).length;

  const paymentScore = Math.round((approved / paymentRequests.length) * 100);
  const balancePenalty = metrics.balance > 0 ? 10 : 0;

  return Math.max(0, Math.min(100, paymentScore - balancePenalty));
}

function computeRating(
  metrics: ClientMetrics,
  reliability: number,
): "excellent" | "good" {
  if (metrics.sessions >= 3 && metrics.balance === 0 && reliability >= 90) {
    return "excellent";
  }

  return "good";
}

export async function loadClientProfileActivity(
  studioId: string,
  client: StudioClient,
  metrics: ClientMetrics,
): Promise<ClientProfileActivity> {
  const email = client.email.toLowerCase();

  const [bookings, galleries, paymentRequests] = await Promise.all([
    prisma.booking.findMany({
      where: {
        studioId,
        status: { not: "cancelled" },
        OR: [{ clientId: client.id }, { clientEmail: email }],
      },
      include: {
        gallery: {
          select: { id: true, coverAssetKey: true, photoCount: true },
        },
        servicePackage: {
          select: { category: true, coverAssetKey: true },
        },
      },
      orderBy: { sessionAt: "desc" },
    }),
    prisma.gallery.findMany({
      where: { studioId, clientId: client.id },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.paymentRequest.findMany({
      where: {
        studioId,
        booking: {
          OR: [{ clientId: client.id }, { clientEmail: email }],
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const bookingIds = bookings.map((booking) => booking.id);

  const paymentRecords =
    bookingIds.length === 0
      ? []
      : await prisma.paymentRecord.findMany({
          where: {
            studioId,
            bookingId: { in: bookingIds },
            status: "approved",
          },
          orderBy: { paidAt: "desc" },
        });

  const reliability = computeReliability(metrics, paymentRequests);
  const insights = buildInsights(client, bookings, metrics);

  return {
    timeline: buildTimeline(client, bookings, galleries, paymentRecords),
    projects: buildProjects(bookings, client),
    invoices: buildInvoices(paymentRequests),
    galleries: buildGalleries(galleries),
    insights,
    reliability,
    rating: computeRating(metrics, reliability),
  };
}
