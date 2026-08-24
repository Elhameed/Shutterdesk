import { useRef, type ChangeEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FileUploadDropzoneProps = {
  icon: ReactNode;
  title: ReactNode;
  hint: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
  className?: string;
};

export function FileUploadDropzone({
  icon,
  title,
  hint,
  accept,
  onFileSelect,
  className,
}: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileSelect?.(file);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-xl",
        "border border-dashed border-border bg-gray-50/80 px-4 py-10 text-center",
        "transition-colors hover:border-muted hover:bg-gray-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20",
        className,
      )}
    >
      <span className="text-muted">{icon}</span>
      <p className="mt-3 text-sm text-charcoal">{title}</p>
      <p className="mt-1 text-[10px] font-medium tracking-wider text-muted-light uppercase">
        {hint}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />
    </button>
  );
}
