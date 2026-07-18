import { useEffect, useMemo, useState } from "react";
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
import type { ServicePackage } from "@/types/domains/service";
import type { ClientStudioSummary } from "@/services/client/http/studios";

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
  const [studios, setStudios] = useState<ClientStudioSummary[]>([]);
  const [studioSlug, setStudioSlug] = useState<string>("");
  const [bookablePackages, setBookablePackages] = useState<ServicePackage[]>([]);
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

  useEffect(() => {
    void clientApi.studios.list().then((items) => {
      setStudios(items);
      if (items[0]) {
        setStudioSlug(items[0].slug);
      }
    });
  }, []);

  useEffect(() => {
    if (!studioSlug) return;

    void clientApi.services.listPublicByStudio(studioSlug).then((packages) => {
      const ordered = BOOK_SESSION_PACKAGE_ORDER.map((id) =>
        packages.find((pkg) => pkg.id === id),
      ).filter((pkg): pkg is ServicePackage => Boolean(pkg));

      const fallback = packages.filter((pkg) => !ordered.find((o) => o.id === pkg.id));
      const merged = [...ordered, ...fallback];

      setBookablePackages(merged);
      if (merged[0]) {
        setPackageId(merged[0].id);
      }
    });
  }, [studioSlug]);

  useEffect(() => {
    if (!user) return;

    void clientApi.settings.get().then((settings) => {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(settings.phone || user.phone || "");
      if (settings.address) {
        setLocation(settings.address);
      }
    });
  }, [user]);

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
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
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
