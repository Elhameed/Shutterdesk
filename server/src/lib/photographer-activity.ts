import { formatRelativeTime } from "./date-format.js";

export const PHOTOGRAPHER_ACTIVITY_TYPES = [
  "booking",
  "payment",
  "gallery",
  "client",
  "service",
] as const;

export type PhotographerActivityType = (typeof PHOTOGRAPHER_ACTIVITY_TYPES)[number];

export type PhotographerActivityRecord = {
  id: string;
  type: PhotographerActivityType;
  title: string;
  description: string;
  occurredAt: Date;
  href?: string;
};

export type PhotographerActivityItem = {
  id: string;
  type: PhotographerActivityType;
  title: string;
  description: string;
  occurredAt: string;
  time: string;
  href?: string;
};

export function toPhotographerActivityItem(
  record: PhotographerActivityRecord,
  now = new Date(),
): PhotographerActivityItem {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    description: record.description,
    occurredAt: record.occurredAt.toISOString(),
    time: formatRelativeTime(record.occurredAt, now),
    href: record.href,
  };
}

type BookingActivitySource = {
  id: string;
  clientName: string;
  packageName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type VerificationActivitySource = {
  id: string;
  bookingId: string;
  clientName: string;
  bookingTitle: string;
  transactionId: string;
  status: string;
  submittedAt: Date;
  verifiedAt: Date | null;
  updatedAt: Date;
};

type GalleryActivitySource = {
  id: string;
  title: string;
  clientName: string;
  workflowStatus: string;
  uploadedAt: Date;
  updatedAt: Date;
};

type ClientActivitySource = {
  id: string;
  name: string;
  createdAt: Date;
};

type ServiceActivitySource = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export function buildPhotographerActivityRecords(input: {
  bookings: BookingActivitySource[];
  verifications: VerificationActivitySource[];
  galleries: GalleryActivitySource[];
  clients: ClientActivitySource[];
  services: ServiceActivitySource[];
}): PhotographerActivityRecord[] {
  const activities: PhotographerActivityRecord[] = [];

  for (const booking of input.bookings) {
    activities.push({
      id: `booking-created-${booking.id}`,
      type: "booking",
      title: "New Booking",
      description: `${booking.clientName} requested ${booking.packageName}`,
      occurredAt: booking.createdAt,
      href: `/photographer/bookings/${booking.id}`,
    });

    if (booking.status === "cancelled") {
      activities.push({
        id: `booking-cancelled-${booking.id}`,
        type: "booking",
        title: "Booking Cancelled",
        description: `${booking.clientName}'s ${booking.packageName} session was cancelled`,
        occurredAt: booking.updatedAt,
        href: `/photographer/bookings/${booking.id}`,
      });
    }

    if (booking.status === "completed") {
      activities.push({
        id: `booking-completed-${booking.id}`,
        type: "booking",
        title: "Session Completed",
        description: `${booking.packageName} with ${booking.clientName} marked complete`,
        occurredAt: booking.updatedAt,
        href: `/photographer/bookings/${booking.id}`,
      });
    }
  }

  for (const verification of input.verifications) {
    activities.push({
      id: `payment-submitted-${verification.id}`,
      type: "payment",
      title: "Receipt Submitted",
      description: `${verification.clientName} uploaded a receipt for ${verification.bookingTitle}`,
      occurredAt: verification.submittedAt,
      href: `/photographer/payments?verification=${verification.id}&booking=${verification.bookingId}`,
    });

    if (verification.status === "approved" && verification.verifiedAt) {
      activities.push({
        id: `payment-approved-${verification.id}`,
        type: "payment",
        title: "Payment Verified",
        description: `${verification.clientName} paid ${verification.bookingTitle} (ref ${verification.transactionId.slice(-6)})`,
        occurredAt: verification.verifiedAt,
        href: `/photographer/payments?verification=${verification.id}&booking=${verification.bookingId}`,
      });
    }

    if (verification.status === "rejected") {
      activities.push({
        id: `payment-rejected-${verification.id}`,
        type: "payment",
        title: "Receipt Rejected",
        description: `Receipt for ${verification.bookingTitle} from ${verification.clientName} was rejected`,
        occurredAt: verification.verifiedAt ?? verification.updatedAt,
        href: `/photographer/payments?verification=${verification.id}&booking=${verification.bookingId}`,
      });
    }
  }

  for (const gallery of input.galleries) {
    activities.push({
      id: `gallery-created-${gallery.id}`,
      type: "gallery",
      title: "Gallery Created",
      description: `${gallery.title} started for ${gallery.clientName}`,
      occurredAt: gallery.uploadedAt,
      href: `/photographer/galleries/${gallery.id}`,
    });

    if (gallery.workflowStatus === "delivered") {
      activities.push({
        id: `gallery-delivered-${gallery.id}`,
        type: "gallery",
        title: "Gallery Delivered",
        description: `${gallery.clientName} received ${gallery.title}`,
        occurredAt: gallery.updatedAt,
        href: `/photographer/galleries/${gallery.id}`,
      });
    }
  }

  for (const client of input.clients) {
    activities.push({
      id: `client-added-${client.id}`,
      type: "client",
      title: "Client Added",
      description: `${client.name} joined your client list`,
      occurredAt: client.createdAt,
      href: `/photographer/clients/${client.id}`,
    });
  }

  for (const service of input.services) {
    activities.push({
      id: `service-created-${service.id}`,
      type: "service",
      title: "Service Package Created",
      description: `${service.title} is now available for booking`,
      occurredAt: service.createdAt,
      href: `/photographer/services/${service.id}/edit`,
    });

    const updatedLater =
      service.updatedAt.getTime() - service.createdAt.getTime() > 60_000;

    if (updatedLater) {
      activities.push({
        id: `service-updated-${service.id}`,
        type: "service",
        title: "Service Package Updated",
        description: `${service.title} settings were updated`,
        occurredAt: service.updatedAt,
        href: `/photographer/services/${service.id}/edit`,
      });
    }
  }

  return activities.sort(
    (left, right) => right.occurredAt.getTime() - left.occurredAt.getTime(),
  );
}

export function filterPhotographerActivities(
  activities: PhotographerActivityRecord[],
  options: {
    type?: PhotographerActivityType;
    since?: Date;
  } = {},
): PhotographerActivityRecord[] {
  return activities.filter((activity) => {
    if (options.type && activity.type !== options.type) {
      return false;
    }

    if (options.since && activity.occurredAt < options.since) {
      return false;
    }

    return true;
  });
}

export function paginatePhotographerActivities<T>(
  activities: T[],
  skip: number,
  limit: number,
) {
  return activities.slice(skip, skip + limit);
}
