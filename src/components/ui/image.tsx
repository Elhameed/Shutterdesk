import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AppImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Extra classes for the wrapper that reserves layout space. */
  wrapperClassName?: string;
};

/**
 * Image with a built-in skeleton placeholder. Reserves space via its wrapper
 * (give the wrapper an `aspect-[…]` or fixed size), shows a shimmer until the
 * image finishes loading, then fades it in — preventing layout shift and blank
 * frames. Drop-in for `<img>` inside existing aspect-ratio containers.
 */
export function AppImage({
  className,
  wrapperClassName,
  onLoad,
  onError,
  loading = "lazy",
  ...props
}: AppImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative size-full overflow-hidden bg-gray-100", wrapperClassName)}>
      {!loaded ? (
        <div
          className="skeleton-shimmer absolute inset-0 bg-gray-200/80"
          aria-hidden
        />
      ) : null}
      <img
        {...props}
        loading={loading}
        decoding="async"
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          // Reveal the (broken/fallback) image rather than shimmering forever.
          setLoaded(true);
          onError?.(event);
        }}
        className={cn(
          // `transition` (all) so a fade-in coexists with any hover transform
          // the caller adds (e.g. group-hover:scale-*).
          "size-full object-cover transition duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}
