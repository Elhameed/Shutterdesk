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
    <section className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-3">
        <img
          src={studioAvatar}
          alt=""
          className="size-12 shrink-0 rounded-full object-cover ring-2 ring-white"
        />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.payingLabel}
          </p>
          <p className="mt-1 text-lg font-bold text-charcoal">{studioName}</p>
          <p className="mt-3 text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.forLabel}
          </p>
          <p className="mt-1 text-sm font-medium text-charcoal">
            {bookingTitle}{" "}
            <span className="text-muted">· {bookingReference}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
