import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { formatRwf } from "../../lib/currency-format.js";
import { getClientOutstandingSummary } from "../bookings/bookings.service.js";

async function getClientUser(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  return user;
}

export async function getClientDashboard(clientUserId: string) {
  const user = await getClientUser(clientUserId);
  const email = user.email.toLowerCase();
  const clientBookingFilter = {
    OR: [{ clientUserId: user.id }, { clientEmail: email }],
  };

  const [bookings, galleries, outstanding] = await Promise.all([
    prisma.booking.findMany({
      where: clientBookingFilter,
      orderBy: { sessionAt: "desc" },
    }),
    prisma.gallery.findMany({
      where: {
        OR: [{ clientUserId: user.id }, { clientEmail: email }],
        status: "published",
        workflowStatus: { in: ["ready", "delivered"] },
      },
      orderBy: { uploadedAt: "desc" },
    }),
    getClientOutstandingSummary(clientUserId),
  ]);

  const activeBookings = bookings.filter((b) => b.status !== "completed").length;
  const upcomingSessions = bookings.filter((b) => b.status === "confirmed").length;

  const upcoming = bookings
    .filter((b) => b.status !== "completed" && b.status !== "cancelled")
    .sort((a, b) => a.sessionAt.getTime() - b.sessionAt.getTime())[0];

  const readyGallery = galleries.find((g) => g.workflowStatus === "delivered");

  return {
    stats: {
      activeBookings,
      upcomingSessions,
      galleriesAvailable: galleries.length,
      pendingPayments: outstanding.totalBalance,
      pendingPaymentsFormatted: formatRwf(outstanding.totalBalance),
    },
    upcomingBookingId: upcoming?.id ?? null,
    readyGalleryId: readyGallery?.id ?? null,
    obligations: outstanding.obligations.map((request) => ({
      id: request.id,
      bookingId: request.bookingId,
      type: request.type,
      amount: request.amount,
      status: request.status,
      dueDate: request.dueDate,
      invoiceRef: request.invoiceRef,
      bookingReference: request.bookingReference,
      bookingTitle: request.bookingTitle,
      studioId: request.studioId,
      studioSlug: request.studioSlug,
      studioName: request.studioName,
    })),
  };
}
