import { ArrowLeft, ArrowRight, CalendarDays, Camera, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CLIENT_BOOK_SESSION_COPY,
  formatBookSessionDate,
  formatRwfPrice,
} from "@/constants/client-book-session";
import type { ServicePackage } from "@/types/domains/service";
import { serviceCoverDisplayUrl } from "@/services/service-mapper";
import { cn } from "@/lib/utils";

type BookSessionDetailsStepProps = {
  packageInfo: ServicePackage;
  selectedDate: Date;
  selectedTime: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  onLocationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function BookSessionDetailsStep({
  packageInfo,
  selectedDate,
  selectedTime,
  fullName,
  email,
  phone,
  location,
  notes,
  onLocationChange,
  onNotesChange,
  onBack,
  onSubmit,
}: BookSessionDetailsStepProps) {
  const copy = CLIENT_BOOK_SESSION_COPY.detailsStep;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-charcoal">{copy.heading}</h2>
        <p className="mt-2 text-sm text-muted">{copy.subheading}</p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-gray-50/80 p-4">
            <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
              {copy.contactHeading}
            </p>
            <p className="mt-1 text-xs text-muted">{copy.contactHint}</p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">{copy.fullName}</dt>
                <dd className="font-medium text-charcoal">{fullName}</dd>
              </div>
              <div>
                <dt className="text-muted">{copy.phone}</dt>
                <dd className="font-medium text-charcoal">{phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted">{copy.email}</dt>
                <dd className="font-medium text-charcoal">{email}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{copy.location}</Label>
            <Input
              id="location"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              placeholder={copy.locationPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{copy.notes}</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder={copy.notesPlaceholder}
              rows={4}
              className={cn(
                "w-full rounded-lg border border-border bg-gray-50 px-3 py-2.5 text-sm",
                "placeholder:text-muted-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20",
              )}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden />
            {CLIENT_BOOK_SESSION_COPY.back}
          </Button>
          <Button type="button" onClick={onSubmit}>
            {copy.reviewSubmit}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <aside className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <div className="relative aspect-[16/10]">
          <img
            src={serviceCoverDisplayUrl(packageInfo.coverImage)}
            alt=""
            className="size-full object-cover"
          />
          <span className="absolute top-3 right-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold tracking-wide text-charcoal uppercase">
            {copy.confirmedSlot}
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-base font-bold text-charcoal">
            {CLIENT_BOOK_SESSION_COPY.detailsStep.bookingSummary}
          </h3>

          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <Camera className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {packageInfo.title}
                </p>
                <p className="text-xs text-muted">
                  {packageInfo.details[0].label} · {packageInfo.editedPhotos}{" "}
                  retouched images
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {formatBookSessionDate(selectedDate)}
                </p>
                <p className="text-xs text-muted">{selectedTime}</p>
              </div>
            </div>
          </div>

          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <dt>{copy.sessionFee}</dt>
              <dd>{formatRwfPrice(packageInfo.price)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>{copy.locationFee}</dt>
              <dd>{formatRwfPrice(0)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold text-charcoal">
              <dt>{copy.total}</dt>
              <dd>{formatRwfPrice(packageInfo.price)}</dd>
            </div>
          </dl>

          <p className="mt-4 flex gap-2 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {copy.reserveNote}
          </p>
        </div>
      </aside>
    </div>
  );
}
