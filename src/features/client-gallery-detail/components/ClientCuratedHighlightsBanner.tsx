import { CLIENT_GALLERIES_COPY } from "@/constants/client-galleries";

type ClientCuratedHighlightsBannerProps = {
  coverImage: string;
  showNewBadge?: boolean;
};

export function ClientCuratedHighlightsBanner({
  coverImage,
  showNewBadge = true,
}: ClientCuratedHighlightsBannerProps) {
  const copy = CLIENT_GALLERIES_COPY.detail;

  return (
    <section className="relative min-h-[180px] overflow-hidden rounded-xl shadow-card sm:min-h-[220px]">
      <img
        src={coverImage}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />

      <div className="absolute inset-0 bg-charcoal/35" />

      {showNewBadge ? (
        <span className="absolute top-4 right-4 rounded-full bg-gold px-3 py-1 text-[10px] font-bold tracking-wide text-charcoal uppercase">
          {copy.newContent}
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-charcoal/90 via-charcoal/50 to-transparent px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {copy.curatedHighlights}
        </h2>
        <p className="mt-1 text-sm text-white/80">{copy.curatedSubtitle}</p>
      </div>
    </section>
  );
}
