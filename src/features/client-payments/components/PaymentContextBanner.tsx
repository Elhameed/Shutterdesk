import { appAssets } from "@/constants/assets";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";

type PaymentContextBannerProps = {
  studioName: string;
  bookingTitle: string;
  bookingReference: string;
  studioAvatar?: string;
};

export function PaymentContextBanner({
  studioName,
  bookingTitle,
  bookingReference,
  studioAvatar = appAssets.userAvatar,
}: PaymentContextBannerProps) {
  const copy = CLIENT_PAYMENTS_COPY.upload;

  return (
    <section className="mt-6 rounded-md border border-accent/30 bg-accent-hover/5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <img
          src={studioAvatar}
          alt=""
          className="size-12 shrink-0 rounded-full object-cover ring-2 ring-white"
        />
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-ink-faint">
            {copy.payingLabel}
          </p>
          <p className="mt-1 text-lg font-bold text-ink">{studioName}</p>
          <p className="mt-3 text-[10px] font-medium text-ink-faint">
            {copy.forLabel}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">
            {bookingTitle}{" "}
            <span className="text-ink-soft">· {bookingReference}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
