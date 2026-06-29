import { useRef } from "react";
import { Camera, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfilePhotoUploadProps = {
  preview: string | null;
  onChange: (file: File) => void;
  title?: string;
  hint?: string;
  className?: string;
};

export function ProfilePhotoUpload({
  preview,
  onChange,
  title = "Profile Photo",
  hint = "Recommended: Square JPG or PNG, max 5MB",
  className,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-[#f7f7f5] transition-colors hover:border-muted sm:size-32"
          aria-label="Upload profile photo"
        >
          {preview ? (
            <img
              src={preview}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="relative text-muted-light">
              <Camera className="size-10" strokeWidth={1.25} />
              <Plus className="absolute -right-1 -top-1 size-4" strokeWidth={2.5} />
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-charcoal text-white shadow-md"
          aria-label="Edit profile photo"
        >
          <Pencil className="size-3.5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
        />
      </div>
      <p className="mt-4 text-sm font-bold text-charcoal">{title}</p>
      <p className="mt-1 text-xs text-muted-light">{hint}</p>
    </div>
  );
}
