import { useRef, useState, type DragEvent } from "react";
import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

type ReceiptUploadZoneProps = {
  file: File | null;
  previewUrl: string;
  onFileSelect: (file: File | null, previewUrl: string) => void;
  disabled?: boolean;
};

export function ReceiptUploadZone({
  file,
  previewUrl,
  onFileSelect,
  disabled = false,
}: ReceiptUploadZoneProps) {
  const copy = CLIENT_PAYMENTS_COPY.upload;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateFile(nextFile: File) {
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError("Please upload a PDF, JPG, or PNG file.");
      return false;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setError("File must be 10MB or smaller.");
      return false;
    }
    setError(null);
    return true;
  }

  function handleFile(nextFile: File) {
    if (!validateFile(nextFile)) return;

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const preview =
      nextFile.type.startsWith("image/")
        ? URL.createObjectURL(nextFile)
        : "";

    onFileSelect(nextFile, preview);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const nextFile = event.dataTransfer.files[0];
    if (nextFile) handleFile(nextFile);
  }

  function handleBrowse() {
    if (!disabled) inputRef.current?.click();
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-2">
        <CloudUpload className="size-5 text-gold" aria-hidden />
        <h2 className="text-base font-bold text-charcoal">{copy.receiptLabel}</h2>
      </div>

      <div
        className={cn(
          "mt-4 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-gold bg-gold/5"
            : "border-border bg-gray-50",
          disabled && "pointer-events-none opacity-60",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="mx-auto max-h-44 rounded-lg object-contain"
          />
        ) : file?.type === "application/pdf" ? (
          <p className="text-sm font-medium text-charcoal">{file.name}</p>
        ) : (
          <CloudUpload className="mx-auto size-10 text-muted-light" aria-hidden />
        )}
        <p className="mt-3 text-sm text-muted">
          {file ? file.name : copy.receiptHint}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={handleBrowse}
          disabled={disabled}
        >
          {copy.browseFiles}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) handleFile(nextFile);
          }}
        />
      </div>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </section>
  );
}
