import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLIENT_GALLERIES_COPY } from "@/constants/client-galleries";
import { getApiErrorMessage } from "@/lib/api-error";
import { clientApi } from "@/services/client";

type ClientGalleryPinGateProps = {
  galleryId: string;
  galleryTitle: string;
  onVerified: (pin: string) => void;
};

export function ClientGalleryPinGate({
  galleryId,
  galleryTitle,
  onVerified,
}: ClientGalleryPinGateProps) {
  const copy = CLIENT_GALLERIES_COPY.detail;
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await clientApi.galleries.verifyPin(galleryId, pin);
      onVerified(pin);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, copy.incorrectPin));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-border bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-gold-light text-gold">
            <LockKeyhole className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold text-charcoal">{copy.pinProtectedTitle}</h1>
            <p className="text-sm text-muted">{galleryTitle}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted">{copy.pinProtectedBody}</p>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="gallery-access-pin">{copy.enterPin}</Label>
            <Input
              id="gallery-access-pin"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                setError(null);
              }}
              placeholder={copy.pinPlaceholder}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
            />
          </div>

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="gold"
            className="w-full"
            disabled={isSubmitting || !pin.trim()}
          >
            {isSubmitting ? copy.verifyingPin : copy.unlockGallery}
          </Button>
        </form>
      </div>
    </div>
  );
}
