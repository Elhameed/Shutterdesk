import type { GalleryPhoto } from "@/types/domains/gallery";

export async function downloadGalleryPhotoFromUrl(photo: GalleryPhoto) {
  const filename = photo.alt.replace(/\s+/g, "-").toLowerCase();

  try {
    const response = await fetch(photo.src);
    const blob = await response.blob();
    const extension =
      photo.src.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "jpg";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch {
    const link = document.createElement("a");
    link.href = photo.src;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

export const downloadGalleryPhoto = downloadGalleryPhotoFromUrl;
