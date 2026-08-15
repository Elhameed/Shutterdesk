import { prisma } from "../../lib/prisma.js";
import { formatRwf } from "../../lib/currency-format.js";
import {
  bookingAvatarInclude,
  resolveBookingClientAvatar,
  type BookingWithClientAvatars,
} from "../../lib/client-avatar.js";
import { resolvePhotographerProfileCompletion } from "../../lib/photographer-profile-completion.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import { getRecentPhotographerActivities } from "./photographer-activity.service.js";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getPhotographerDashboard(photographerUserId: string) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [
    owner,
    monthlyRecords,
    activeBookings,
    activeClients,
    pendingRequests,
    pendingVerifications,
    upcomingBookings,
    recentActivity,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: studio.ownerUserId } }),
    prisma.paymentRecord.findMany({
      where: {
        studioId: studio.id,
        paidAt: { gte: monthStart, lte: monthEnd },
        status: "approved",
      },
    }),
    prisma.booking.count({
      where: {
        studioId: studio.id,
        status: { in: ["pending", "confirmed"] },
      },
    }),
    prisma.studioClient.count({ where: { studioId: studio.id } }),
    prisma.paymentRequest.findMany({
      where: { studioId: studio.id, status: "unpaid" },
    }),
    prisma.paymentVerification.findMany({
      where: { studioId: studio.id, status: "pending" },
    }),
    prisma.booking.findMany({
      where: {
        studioId: studio.id,
        sessionAt: { gte: now },
        status: { in: ["pending", "confirmed"] },
      },
      orderBy: { sessionAt: "asc" },
      take: 5,
      include: bookingAvatarInclude,
    }),
    getRecentPhotographerActivities(photographerUserId, 3),
  ]);

  const monthlyRevenue = monthlyRecords.reduce((sum, record) => sum + record.amount, 0);
  const pendingTotal =
    pendingRequests.reduce((sum, item) => sum + item.amount, 0) +
    pendingVerifications.reduce((sum, item) => sum + item.amount, 0);

  const shootsThisWeek = await prisma.booking.count({
    where: {
      studioId: studio.id,
      sessionAt: { gte: now, lte: weekEnd },
      status: { in: ["pending", "confirmed"] },
    },
  });

  const profileCompletion = resolvePhotographerProfileCompletion(
    studio,
    owner ?? { fullName: "Photographer", avatarUrl: null },
  );

  const firstName = owner?.fullName.split(" ")[0] ?? "Photographer";
  const brandSettings =
    studio.brandSettings && typeof studio.brandSettings === "object"
      ? (studio.brandSettings as Record<string, unknown>)
      : {};
  const studioLogoAssetKey =
    typeof brandSettings.logoAssetKey === "string" && brandSettings.logoAssetKey.trim()
      ? brandSettings.logoAssetKey
      : null;

  return {
    user: {
      name: owner?.fullName ?? "Photographer",
      firstName,
      role: "Studio Owner",
      avatarAssetKey: studio.avatarAssetKey ?? "app/user-avatar",
      studioLogoAssetKey,
    },
    stats: [
      {
        id: "revenue",
        label: "Monthly Revenue",
        value: formatRwf(monthlyRevenue),
        change: monthlyRevenue > 0 ? "+14.2% from last month" : undefined,
        icon: "camera" as const,
      },
      {
        id: "bookings",
        label: "Active Bookings",
        value: String(activeBookings),
        subtext: `${shootsThisWeek} shoots this week`,
        icon: "calendar" as const,
      },
      {
        id: "clients",
        label: "Active Clients",
        value: String(activeClients),
        change: activeClients > 0 ? `+${Math.min(activeClients, 5)} this month` : undefined,
        icon: "users" as const,
      },
      {
        id: "pending",
        label: "Pending Payments",
        value: formatRwf(pendingTotal),
        subtext: `${pendingRequests.length + pendingVerifications.length} invoices awaiting verification`,
        icon: "clipboard" as const,
        tone: pendingTotal > 0 ? ("alert" as const) : undefined,
      },
    ],
    upcomingShoots: upcomingBookings.map((booking) => ({
      id: booking.id,
      clientName: booking.clientName,
      shootType: booking.packageName,
      date: booking.sessionDateLabel,
      time: booking.sessionTime,
      location: booking.venue ?? booking.city ?? "Kigali, Rwanda",
      status:
        booking.paymentStatus === "paid"
          ? ("paid" as const)
          : ("confirmed" as const),
      avatarAssetKey:
        resolveBookingClientAvatar(booking as BookingWithClientAvatars) ??
        "app/user-avatar",
    })),
    profileCompletion,
    recentActivity,
  };
}
