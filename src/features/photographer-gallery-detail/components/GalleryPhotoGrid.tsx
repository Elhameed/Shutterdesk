import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip } from "@/components/ui/tooltip";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { GalleryPhotoLightbox } from "@/features/photographer-gallery-detail/components/GalleryPhotoLightbox";
import { downloadGalleryPhoto } from "@/features/photographer-gallery-detail/lib/download-gallery-photo";
import { uploadGalleryPhotoToCloudinary } from "@/lib/cloudinary-upload";
import type { GalleryPhoto } from "@/types/domains/gallery";

type GalleryPhotoGridProps = {
  photos: GalleryPhoto[];
  allPhotos: GalleryPhoto[];
  disabled?: boolean;
  onDeletePhoto?: (photoId: string) => Promise<void>;
  onUpdatePhoto?: (
    photoId: string,
    input: { alt?: string; assetKey?: string },
  ) => Promise<void>;
  onReorderPhotos?: (photoIds: string[]) => Promise<void>;
};

export function GalleryPhotoGrid({
  photos,
  allPhotos,
  disabled = false,
  onDeletePhoto,
  onUpdatePhoto,
  onReorderPhotos,
}: GalleryPhotoGridProps) {
  const copy = GALLERIES_COPY.detail;
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        {copy.noPhotosFound}
      </div>
    );
  }

  const openEditor = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditAlt(photo.alt);
  };

  const handleSaveDetails = async () => {
    if (!editingPhoto || !onUpdatePhoto) return;

    setIsSaving(true);
    try {
      await onUpdatePhoto(editingPhoto.id, { alt: editAlt.trim() });
      setEditingPhoto(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (photoId: string) => {
    if (!onDeletePhoto) return;
    setDeletePhotoId(photoId);
  };

  const confirmDelete = async () => {
    if (!onDeletePhoto || !deletePhotoId) return;

    setIsDeleting(true);
    try {
      await onDeletePhoto(deletePhotoId);
      setDeletePhotoId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (photoId: string, direction: "up" | "down") => {
    if (!onReorderPhotos) return;

    const ids = allPhotos.map((photo) => photo.id);
    const index = ids.indexOf(photoId);
    if (index < 0) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ids.length) return;

    const reordered = [...ids];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    await onReorderPhotos(reordered);
  };

  const handleReplaceFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !replacingPhotoId || !onUpdatePhoto) return;

    setIsSaving(true);
    try {
      const assetKey = await uploadGalleryPhotoToCloudinary(file);
      await onUpdatePhoto(replacingPhotoId, { assetKey });
    } finally {
      setReplacingPhotoId(null);
      setIsSaving(false);
    }
  };

  return (
    <>
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleReplaceFile(event)}
      />

      <div className="columns-2 gap-3 sm:gap-4">
        {photos.map((photo, index) => {
          const globalIndex = allPhotos.findIndex((item) => item.id === photo.id);

          return (
            <article
              key={photo.id}
              className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl ring-1 ring-gold/60 sm:mb-4"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover"
                loading="lazy"
              />

              <div className="absolute inset-0 flex flex-wrap items-end justify-end gap-2 rounded-xl bg-linear-to-t from-charcoal/70 via-charcoal/10 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <PhotoOverlayAction label={copy.downloadPhoto}>
                  <button
                    type="button"
                    onClick={() => downloadGalleryPhoto(photo)}
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white"
                    aria-label={copy.downloadPhoto}
                  >
                    <Download className="size-4" />
                  </button>
                </PhotoOverlayAction>
                <PhotoOverlayAction label={copy.viewPhoto}>
                  <button
                    type="button"
                    onClick={() => setViewerIndex(index)}
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white"
                    aria-label={copy.viewPhoto}
                  >
                    <Eye className="size-4" />
                  </button>
                </PhotoOverlayAction>
                <PhotoOverlayAction label={copy.editPhoto}>
                  <button
                    type="button"
                    disabled={disabled || isSaving}
                    onClick={() => openEditor(photo)}
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white disabled:opacity-50"
                    aria-label={copy.editPhoto}
                  >
                    <Pencil className="size-4" />
                  </button>
                </PhotoOverlayAction>
                <PhotoOverlayAction label={copy.moveEarlier}>
                  <button
                    type="button"
                    disabled={disabled || isSaving || globalIndex <= 0}
                    onClick={() => void handleMove(photo.id, "up")}
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white disabled:opacity-50"
                    aria-label={copy.moveEarlier}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                </PhotoOverlayAction>
                <PhotoOverlayAction label={copy.moveLater}>
                  <button
                    type="button"
                    disabled={
                      disabled || isSaving || globalIndex >= allPhotos.length - 1
                    }
                    onClick={() => void handleMove(photo.id, "down")}
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white disabled:opacity-50"
                    aria-label={copy.moveLater}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </PhotoOverlayAction>
                <PhotoOverlayAction label={copy.replacePhoto}>
                  <button
                    type="button"
                    disabled={disabled || isSaving}
                    onClick={() => {
                      setReplacingPhotoId(photo.id);
                      replaceInputRef.current?.click();
                    }}
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition-colors hover:bg-white disabled:opacity-50"
                    aria-label={copy.replacePhoto}
                  >
                    <RefreshCw className="size-4" />
                  </button>
                </PhotoOverlayAction>
                <PhotoOverlayAction label={copy.deletePhoto}>
                  <button
                    type="button"
                    disabled={disabled || isSaving}
                    onClick={() => handleDelete(photo.id)}
                    className="flex size-9 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition-colors hover:bg-white disabled:opacity-50"
                    aria-label={copy.deletePhoto}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </PhotoOverlayAction>
              </div>
            </article>
          );
        })}
      </div>

      {editingPhoto ? (
        <div className="mt-5 rounded-xl border border-border bg-white p-5 shadow-card">
          <div className="space-y-3">
            <Label htmlFor="photo-alt">{copy.photoAltLabel}</Label>
            <Input
              id="photo-alt"
              value={editAlt}
              onChange={(event) => setEditAlt(event.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={isSaving}
                onClick={() => void handleSaveDetails()}
              >
                {copy.savePhotoDetails}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingPhoto(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {viewerIndex !== null && (
        <GalleryPhotoLightbox
          photos={photos}
          activeIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}

      <AlertDialog
        open={deletePhotoId !== null}
        title={copy.deletePhoto}
        description={copy.deletePhotoConfirm}
        confirmLabel={copy.deletePhoto}
        destructive
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeletePhotoId(null)}
      />
    </>
  );
}

function PhotoOverlayAction({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip label={label} side="top">
      {children}
    </Tooltip>
  );
}
