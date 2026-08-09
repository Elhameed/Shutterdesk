import { useRef, useState, type ChangeEvent } from "react";
import { CloudUpload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GALLERY_CREATE_COPY } from "@/constants/photographer-gallery-create";
import { uploadGalleryPhotoToCloudinary } from "@/lib/cloudinary-upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type PendingGalleryPhoto = {
  id: string;
  url: string;
  name: string;
};

type GalleryPendingPhotosFieldProps = {
  photos: PendingGalleryPhoto[];
  onChange: (photos: PendingGalleryPhoto[]) => void;
  disabled?: boolean;
};

function createPendingId() {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GalleryPendingPhotosField({
  photos,
  onChange,
  disabled = false,
}: GalleryPendingPhotosFieldProps) {
  const copy = GALLERY_CREATE_COPY;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || disabled || isUploading) return;

    const validFiles = files.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please upload JPG, PNG, or WebP images.");
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be 15MB or smaller.");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadingCount(validFiles.length);

    try {
      const uploaded: PendingGalleryPhoto[] = [];
      for (const file of validFiles) {
        const url = await uploadGalleryPhotoToCloudinary(file);
        uploaded.push({
          id: createPendingId(),
          url,
          name: file.name,
        });
      }
      onChange([...photos, ...uploaded]);
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Unable to upload photos."));
    } finally {
      setIsUploading(false);
      setUploadingCount(0);
    }
  }

  function removePhoto(id: string) {
    onChange(photos.filter((photo) => photo.id !== id));
  }

  return (
    <div>
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-gray-50/50 px-4 py-8 text-center",
          disabled && "opacity-60",
        )}
      >
        {isUploading ? (
          <Loader2 className="mx-auto size-8 animate-spin text-gold" aria-hidden />
        ) : (
          <CloudUpload className="mx-auto size-8 text-muted" aria-hidden />
        )}
        <p className="mt-3 text-sm font-semibold text-charcoal">
          {isUploading
            ? `Uploading ${uploadingCount} photo${uploadingCount === 1 ? "" : "s"}…`
            : copy.photoDropTitle}
        </p>
        <p className="mt-1 text-xs text-muted">{copy.photoDropHint}</p>
        <Button
          type="button"
          size="sm"
          className="mt-4 gap-1.5"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {copy.uploadPhotos}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={disabled || isUploading}
          onChange={handleFiles}
        />
      </div>

      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-gray-100"
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="size-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full bg-charcoal/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                aria-label={`Remove ${photo.name}`}
                onClick={() => removePhoto(photo.id)}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
