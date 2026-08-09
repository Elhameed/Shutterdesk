import { useRef, useState, type ChangeEvent } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { uploadGalleryPhotoToCloudinary } from "@/lib/cloudinary-upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type GalleryPhotoUploadPanelProps = {
  onUpload: (secureUrls: string[]) => Promise<void>;
  disabled?: boolean;
  className?: string;
};

export function GalleryPhotoUploadPanel({
  onUpload,
  disabled = false,
  className,
}: GalleryPhotoUploadPanelProps) {
  const copy = GALLERIES_COPY.detail;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

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
    setSelectedCount(validFiles.length);
    setIsUploading(true);

    try {
      const secureUrls: string[] = [];
      for (const file of validFiles) {
        const url = await uploadGalleryPhotoToCloudinary(file);
        secureUrls.push(url);
      }
      await onUpload(secureUrls);
      setSelectedCount(0);
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Unable to upload photos."));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-dashed border-border bg-white p-5 shadow-card",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <CloudUpload className="size-5" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-charcoal">{copy.uploadPhotos}</h3>
          <p className="mt-1 text-sm text-muted">
            {isUploading
              ? `Uploading ${selectedCount} photo${selectedCount === 1 ? "" : "s"}…`
              : "JPG, PNG, or WebP up to 15MB each"}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : copy.uploadPhotos}
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
      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
    </section>
  );
}
