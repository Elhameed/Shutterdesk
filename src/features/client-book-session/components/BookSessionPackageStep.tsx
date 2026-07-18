import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookSessionPackageCard } from "@/features/client-book-session/components/BookSessionPackageCard";
import { CLIENT_BOOK_SESSION_COPY } from "@/constants/client-book-session";
import { CLIENT_SUPPORT_EMAIL } from "@/constants/support";
import type { ServicePackage } from "@/types/domains/service";

type StudioSummary = { slug: string; name: string; avatarAssetKey: string | null };
type BookSessionPackageStepProps = {
  studios: StudioSummary[];
  studioSlug: string;
  onStudioChange: (slug: string) => void;
  packages: ServicePackage[];
  selectedId: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function BookSessionPackageStep({
  studios,
  studioSlug,
  onStudioChange,
  packages,
  selectedId,
  onSelect,
  onContinue,
  onBack,
}: BookSessionPackageStepProps) {
  const copy = CLIENT_BOOK_SESSION_COPY;

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-charcoal sm:text-2xl">
            {copy.packageStep.heading}
          </h2>
          <p className="mt-1 text-sm text-muted">{copy.packageStep.subheading}</p>
        </div>

        <div className="w-full max-w-xs">
          <label className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            Studio
          </label>
          {studios.length === 0 ? (
            <p className="mt-2 rounded-lg border border-border bg-gray-50 px-3 py-3 text-sm text-muted">
              {copy.packageStep.noStudios}
            </p>
          ) : (
            <select
              value={studioSlug}
              onChange={(event) => onStudioChange(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-gray-50 px-3 text-sm text-charcoal"
            >
              {studios.map((studio) => (
                <option key={studio.slug} value={studio.slug}>
                  {studio.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {studios.length > 0 && packages.length === 0 ? (
        <div className="p-5 sm:p-6">
          <p className="rounded-lg border border-border bg-gray-50 px-4 py-6 text-sm text-muted">
            {copy.packageStep.noPackages}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {packages.map((pkg) => (
          <BookSessionPackageCard
            key={pkg.id}
            pkg={pkg}
            isSelected={pkg.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <footer className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted">
          {copy.packageStep.customQuote}{" "}
          <a
            href={`mailto:${CLIENT_SUPPORT_EMAIL}?subject=Custom%20session%20quote`}
            className="font-semibold text-charcoal hover:text-gold"
          >
            {copy.packageStep.contactStudio}
          </a>
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            {copy.back}
          </Button>
          <Button type="button" onClick={onContinue} disabled={!selectedId || studios.length === 0}>
            {copy.continue}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </footer>
    </>
  );
}
