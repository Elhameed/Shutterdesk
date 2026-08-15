import { prisma } from "./prisma.js";
import { buildBookingProgressUpdate } from "./booking-progress.js";

export async function syncBookingProgressForGallery(galleryId: string) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: {
      workflowStatus: true,
      photoCount: true,
    },
  });

  if (!gallery) {
    return;
  }

  const bookings = await prisma.booking.findMany({
    where: { galleryId },
    select: {
      id: true,
      progressStep: true,
      galleryStep: true,
    },
  });

  await Promise.all(
    bookings.map((booking) =>
      prisma.booking.update({
        where: { id: booking.id },
        data: buildBookingProgressUpdate(booking, gallery),
      }),
    ),
  );
}
