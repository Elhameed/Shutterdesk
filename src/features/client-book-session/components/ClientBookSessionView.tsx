import { useEffect, useMemo, useState } from "react";
import { InlineAlert } from "@/components/common/InlineAlert";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/AuthProvider";
import {
  BOOK_SESSION_PACKAGE_ORDER,
} from "@/constants/client-book-session";
import { ROUTES } from "@/constants/routes";
import { BookSessionDetailsStep } from "@/features/client-book-session/components/BookSessionDetailsStep";
import { BookSessionPackageStep } from "@/features/client-book-session/components/BookSessionPackageStep";
import { BookSessionScheduleStep } from "@/features/client-book-session/components/BookSessionScheduleStep";
import { BookSessionStepper } from "@/features/client-book-session/components/BookSessionStepper";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { clientApi } from "@/services/client";
import {
  useClientSettings,
  useClientStudioServices,
  useClientStudios,
} from "@/hooks/queries/client";
import type { ServicePackage } from "@/types/domains/service";

type Step = "package" | "schedule" | "details";

function formatDateForApi(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClientBookSessionView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("package");
  const [studioSlug, setStudioSlug] = useState<string>("");
  const [packageId, setPackageId] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Studios, their packages and the client's saved contact details are all
  // reference data for this form; the answers the client gives stay local.
  const { data: studios = [] } = useClientStudios();
  const { data: studioPackages = [] } = useClientStudioServices(studioSlug);
  const { data: settings } = useClientSettings();

  // A studio's packages have a preferred display order, with anything
  // unrecognised appended.
  const bookablePackages = useMemo(() => {
    const ordered = BOOK_SESSION_PACKAGE_ORDER.map((id) =>
      studioPackages.find((pkg) => pkg.id === id),
    ).filter((pkg): pkg is ServicePackage => Boolean(pkg));

    const fallback = studioPackages.filter(
      (pkg) => !ordered.some((item) => item.id === pkg.id),
    );
    return [...ordered, ...fallback];
  }, [studioPackages]);

  // Each of these only fills a field the client has not set, so a refetch
  // cannot overwrite something they typed.
  useEffect(() => {
    if (studios[0]) {
      setStudioSlug((current) => current || studios[0].slug);
    }
  }, [studios]);

  useEffect(() => {
    if (bookablePackages[0]) {
      setPackageId((current) => current || bookablePackages[0].id);
    }
  }, [bookablePackages]);

  useEffect(() => {
    if (!user) return;
    setFullName((current) => current || user.fullName);
    setEmail((current) => current || user.email);
    setPhone((current) => current || settings?.phone || user.phone || "");
    setLocation((current) => current || settings?.address || "");
  }, [settings, user]);

  const selected = useMemo(
    () => bookablePackages.find((pkg) => pkg.id === packageId),
    [bookablePackages, packageId],
  );

  async function handleSubmit() {
    if (!selected || !selectedDate) return;

    setSubmitError(null);
    try {
      const booking = await clientApi.bookings.create({
        servicePackageId: selected.id,
        date: formatDateForApi(selectedDate),
        time: selectedTime,
        locationNotes: location || notes,
      });

      await queryClient.invalidateQueries({ queryKey: queryKeys.client.dashboard });
      await queryClient.invalidateQueries({ queryKey: queryKeys.client.bookings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.client.notifications });

      navigate(ROUTES.client.bookingDetail(booking.id));
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Unable to book session. Please try again."),
      );
    }
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <BookSessionStepper current={step} />
      {submitError ? (
        <InlineAlert className="mb-4">
          {submitError}
        </InlineAlert>
      ) : null}

      <div className="overflow-hidden rounded-md border border-border bg-panel">
        {step === "package" && (
          <BookSessionPackageStep
            studios={studios}
            studioSlug={studioSlug}
            onStudioChange={setStudioSlug}
            packages={bookablePackages}
            selectedId={packageId}
            onSelect={setPackageId}
            onContinue={() => setStep("schedule")}
            onBack={() => navigate(ROUTES.client.dashboard)}
          />
        )}

        {step === "schedule" && selected && (
          <BookSessionScheduleStep
            studioSlug={studioSlug}
            packageInfo={selected}
            month={calendarMonth}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onMonthChange={setCalendarMonth}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            onBack={() => setStep("package")}
            onContinue={() => setStep("details")}
          />
        )}

        {step === "details" && selected && selectedDate && (
          <div className="p-5 sm:p-6">
            <BookSessionDetailsStep
              packageInfo={selected}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              fullName={fullName}
              email={email}
              phone={phone}
              location={location}
              notes={notes}
              onLocationChange={setLocation}
              onNotesChange={setNotes}
              onBack={() => setStep("schedule")}
              onSubmit={() => void handleSubmit()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
