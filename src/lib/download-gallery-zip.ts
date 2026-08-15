import JSZip from "jszip";
import type { GalleryPhoto } from "@/types/domains/gallery";

function sanitizeFilename(value: string) {
  const trimmed = value
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return trimmed || "gallery";
}

function resolveExtension(src: string, blobType?: string) {
  const fromUrl = src.split(".").pop()?.split("?")[0]?.toLowerCase();
  if (fromUrl && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromUrl)) {
    return fromUrl === "jpeg" ? "jpg" : fromUrl;
  }

  if (blobType?.includes("png")) return "png";
  if (blobType?.includes("webp")) return "webp";
  if (blobType?.includes("gif")) return "gif";
  return "jpg";
}

function photoEntryName(photo: GalleryPhoto, index: number, blobType?: string) {
  const base = sanitizeFilename(photo.alt) || `photo-${index + 1}`;
  const ext = resolveExtension(photo.src, blobType);
  return `${String(index + 1).padStart(3, "0")}-${base}.${ext}`;
}

async function fetchPhotoBlob(photo: GalleryPhoto) {
  const response = await fetch(photo.src);
  if (!response.ok) {
    throw new Error(`Unable to download ${photo.alt}`);
  }
  return response.blob();
}

export async function downloadGalleryAsZip(
  galleryTitle: string,
  photos: GalleryPhoto[],
  onProgress?: (completed: number, total: number) => void,
) {
  if (photos.length === 0) {
    return;
  }

  const zip = new JSZip();
  const folderName = sanitizeFilename(galleryTitle);
  const folder = zip.folder(folderName) ?? zip;

  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    const blob = await fetchPhotoBlob(photo);
    folder.file(photoEntryName(photo, index, blob.type), blob);
    onProgress?.(index + 1, photos.length);
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "STORE",
  });

  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
