import { useEffect, useRef, useState } from "react";

type UseDelayedLoadingOptions = {
  /** Wait this long (ms) before showing the skeleton — avoids flashing on fast loads. */
  delay?: number;
  /** Once shown, keep the skeleton visible at least this long (ms) — avoids flicker. */
  minDuration?: number;
};

/**
 * Smooths loading UX: returns whether a skeleton should be shown for a given
 * `isLoading` flag. The skeleton only appears once loading has lasted `delay`ms,
 * and once visible it stays for at least `minDuration`ms.
 *
 * Works with any boolean source (React Query `isLoading` or manual `useState`).
 */
export function useDelayedLoading(
  isLoading: boolean,
  { delay = 150, minDuration = 400 }: UseDelayedLoadingOptions = {},
): boolean {
  const [show, setShow] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    let delayTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      // Delay before revealing the skeleton.
      delayTimer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setShow(true);
      }, delay);
    } else if (shownAtRef.current !== null) {
      // Skeleton is (or was about to be) visible — honour the minimum duration.
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = Math.max(0, minDuration - elapsed);
      hideTimer = setTimeout(() => {
        shownAtRef.current = null;
        setShow(false);
      }, remaining);
    } else {
      // Loading finished before the delay elapsed — never show a skeleton.
      setShow(false);
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isLoading, delay, minDuration]);

  return show;
}
