export function downloadGalleryReportFile(
  galleryTitle: string,
  report: Record<string, unknown>,
) {
  const safeName = galleryTitle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "gallery";

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeName}-report.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
