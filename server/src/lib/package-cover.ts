import type { Booking } from "@prisma/client";

export type BookingWithPackageCover = Booking & {
  servicePackage?: { coverAssetKey: string | null; category: string } | null;
};

export function packageCoverFallback(
  category: string | undefined,
  packageName: string,
): string {
  const label = (category ?? packageName).toLowerCase();
  if (label.includes("wedding")) {
    return "landing/gallery/wedding/gallery-wedding-couple";
  }
  if (label.includes("portrait") || label.includes("headshot")) {
    return "landing/gallery/portrait/gallery-portrait-studio";
  }
  if (label.includes("commercial") || label.includes("product")) {
    return "landing/experience/experience-architecture-photo";
  }
  if (label.includes("editorial")) {
    return "landing/gallery/portrait/gallery-portrait-creative";
  }
  return "landing/gallery/portrait/gallery-portrait-studio";
}

export function resolvePackageCoverImage(booking: BookingWithPackageCover): string {
  const cover = booking.servicePackage?.coverAssetKey?.trim();
  if (cover) return cover;

  return packageCoverFallback(
    booking.servicePackage?.category,
    booking.packageName,
  );
}

export const bookingPackageInclude = {
  servicePackage: { select: { coverAssetKey: true, category: true } },
} as const;
