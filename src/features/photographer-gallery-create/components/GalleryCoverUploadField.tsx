import { useRef, useState, type ChangeEvent } from "react";
import { CloudUpload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GALLERY_CREATE_COPY } from "@/constants/photographer-gallery-create";
import { uploadGalleryPhotoToCloudinary } from "@/lib/cloudinary-upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type GalleryCoverUploadFieldProps = {
  value: string | null;
  fallbackPreview: string;
  onChange: (secureUrl: string | null) => void;
  disabled?: boolean;
};

export function GalleryCoverUploadField({
  value,
  fallbackPreview,
  onChange,
  disabled = false,
}: GalleryCoverUploadFieldProps) {
  const copy = GALLERY_CREATE_COPY;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled || isUploading) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP cover image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Cover image must be 5MB or smaller.");
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const secureUrl = await uploadGalleryPhotoToCloudinary(file);
      onChange(secureUrl);
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Unable to upload cover image."));
    } finally {
      setIsUploading(false);
    }
  }

  const preview = value ?? fallbackPreview;

  return (
    <div>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed border-border bg-gray-50/80 px-4 py-10 text-center",
          disabled && "opacity-60",
        )}
      >
        <img
          src={preview}
          alt=""
          className={cn(
            "pointer-events-none absolute inset-0 size-full object-cover",
            value ? "opacity-90" : "opacity-20",
          )}
          aria-hidden
        />
        <div className="relative">
          {isUploading ? (
            <Loader2 className="mx-auto size-8 animate-spin text-gold" aria-hidden />
          ) : (
            <CloudUpload className="mx-auto size-8 text-muted" aria-hidden />
          )}
          <p className="mt-3 text-sm font-semibold text-charcoal">
            {value ? copy.coverReplaceTitle : copy.coverDropTitle}
          </p>
          <p className="mt-1 text-xs text-muted">{copy.coverDropHint}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? "Uploading…" : copy.uploadCover}
            </Button>
            {value ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || isUploading}
                onClick={() => onChange(null)}
              >
                <X className="size-4" aria-hidden />
                {copy.removeCover}
              </Button>
            ) : null}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={handleFile}
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
