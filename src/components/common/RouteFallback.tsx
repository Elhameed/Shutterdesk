import { AppShellSkeleton } from "@/components/skeletons";

/**
 * Shown by the router's <Suspense> while a lazy page chunk loads. Renders an
 * app-shell skeleton (sidebar + content) so route transitions feel like the
 * page materializing rather than a blank/text flash.
 */
export function RouteFallback() {
  return <AppShellSkeleton />;
}
