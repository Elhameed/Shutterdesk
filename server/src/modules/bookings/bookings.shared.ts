import { prisma } from "../../lib/prisma.js";
import {
  buildSessionDateTime,
  parseDurationMinutes,
} from "../../format/session-datetime.js";
import { AppError } from "../../middleware/error-handler.js";

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

export async function resolveDepositPercentForStudioPackage(
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


export function parseSessionDate(dateLabel: string, timeLabel?: string): Date {
  if (timeLabel) {
    return buildSessionDateTime(dateLabel, timeLabel);
  }

  const parsed = new Date(dateLabel);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date();
}

export async function resolveBookingDurationMinutes(
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

export async function nextBookingReference() {
  // Backed by a sequence (see the booking_reference_sequence migration) rather
  // than scanning `bookings` for the highest reference: that was a full table
  // scan on every create, and two concurrent creates would read the same max.
  const rows = await prisma.$queryRaw<Array<{ nextval: bigint }>>`
    SELECT nextval('booking_reference_seq')
  `;

  return `BK-${rows[0].nextval}`;
}

export function defaultTimeline(_title: string, dateLabel: string, time: string) {
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

export async function listPaymentRequestsForBooking(bookingId: string) {
  return prisma.paymentRequest.findMany({
    where: { bookingId },
    select: { id: true, amount: true, type: true, status: true },
  });
}

export async function getClientUser(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  return user;
}

/**
 * A client's identity plus the predicate that finds their bookings.
 *
 * Bookings are matched by linked user id *or* email, because a booking can
 * predate the client having an account. Resolving that once per request and
 * passing it down avoids re-fetching the same user and booking set repeatedly.
 */
export type ClientBookingScope = {
  user: Awaited<ReturnType<typeof getClientUser>>;
  where: { OR: Array<{ clientUserId: string } | { clientEmail: string }> };
};

export async function resolveClientBookingScope(
  clientUserId: string,
): Promise<ClientBookingScope> {
  const user = await getClientUser(clientUserId);
  return {
    user,
    where: {
      OR: [{ clientUserId: user.id }, { clientEmail: user.email.toLowerCase() }],
    },
  };
}
