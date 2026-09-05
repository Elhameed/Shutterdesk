import { landingAssets } from "@/constants/assets";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { ShieldCheck } from "lucide-react";

export function PaymentsPromoCards() {
  const copy = CLIENT_PAYMENTS_COPY.promo;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="relative overflow-hidden rounded-md border border-border bg-panel">
        <img
          src={landingAssets.experience.architecturePhoto}
          alt=""
          className="h-36 w-full object-cover"
        />
        <div className="p-5">
          <h3 className="text-sm font-bold text-ink">{copy.premium.title}</h3>
          <p className="mt-1 text-xs text-ink-soft">{copy.premium.body}</p>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-md border border-border bg-panel">
        <img
          src={landingAssets.experience.crmMobile}
          alt=""
          className="h-36 w-full object-cover"
        />
        <div className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" aria-hidden />
            <h3 className="text-sm font-bold text-ink">{copy.secure.title}</h3>
          </div>
          <p className="mt-1 text-xs text-ink-soft">{copy.secure.body}</p>
        </div>
      </article>
    </div>
  );
}
