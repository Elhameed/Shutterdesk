import type {
  Prisma,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  toApiPaymentRequest,
} from "./bookings.mapper.js";
import {
  type ClientBookingScope,
  resolveClientBookingScope,
} from "./bookings.shared.js";

/**
 * Takes a client so it can run inside the same transaction as the booking
 * insert. A booking created without its deposit request is unpayable —
 * uploadClientReceipt has no obligation to attach the receipt to — so the two
 * must never be able to come apart.
 */
export async function createDepositRequest(
  db: Prisma.TransactionClient,
  bookingId: string,
  studioId: string,
  reference: string,
  title: string,
  amount: number,
  dueDate: Date,
) {
  return db.paymentRequest.create({
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
  await syncPaymentObligationsForScope(await resolveClientBookingScope(clientUserId));
}

export async function syncPaymentObligationsForScope(scope: ClientBookingScope) {
  const bookings = await prisma.booking.findMany({
    where: { ...scope.where, status: "completed" },
    select: { id: true },
  });

  await Promise.all(
    bookings.map((booking) => ensureBalancePaymentRequest(booking.id)),
  );
}

export async function getClientOutstandingSummary(clientUserId: string) {
  const scope = await resolveClientBookingScope(clientUserId);
  await syncPaymentObligationsForScope(scope);

  const [bookings, obligations] = await Promise.all([
    prisma.booking.findMany({
      where: { ...scope.where, status: { notIn: ["cancelled"] } },
      include: { studio: true },
    }),
    listPaymentRequestsForScope(scope),
  ]);

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
  return listPaymentRequestsForScope(await resolveClientBookingScope(clientUserId));
}

async function listPaymentRequestsForScope(scope: ClientBookingScope) {
  const bookingIds = (
    await prisma.booking.findMany({
      where: scope.where,
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

