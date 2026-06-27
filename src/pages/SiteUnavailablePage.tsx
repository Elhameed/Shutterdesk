import { Logo } from "@/components/common/Logo";
import { PageContainer } from "@/components/layout/PageContainer";

export function SiteUnavailablePage() {
  return (
    <PageContainer className="flex min-h-screen flex-col items-center justify-center py-20 text-center">
      <Logo size="lg" className="mb-10" />
      <h1 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
        The page you are looking for does not exist or is temporarily unavailable.
      </p>
    </PageContainer>
  );
}
