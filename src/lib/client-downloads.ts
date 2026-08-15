import type { GalleryPhoto } from "@/types/domains/gallery";
import { downloadGalleryPhoto } from "@/features/photographer-gallery-detail/lib/download-gallery-photo";

export async function downloadGalleryPhotos(photos: GalleryPhoto[]) {
  for (const photo of photos) {
    await downloadGalleryPhoto(photo);
  }
}

export function exportPaymentHistoryCsv(
  rows: {
    bookingTitle: string;
    studioName: string;
    amount: number;
    date: string;
    status: string;
  }[],
) {
  const header = "Booking,Studio,Amount,Date,Status";
  const body = rows
    .map((row) =>
      [
        row.bookingTitle,
        row.studioName,
        row.amount,
        row.date,
        row.status,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "shutterdesk-payment-history.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
