import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  MapPin,
  Plus,
  User,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NEW_BOOKING_COPY } from "@/constants/photographer-booking-create";
import { ROUTES } from "@/constants/routes";
import { AddClientModal } from "@/features/photographer-clients/components/AddClientModal";
import { BookingSummarySidebar } from "@/features/photographer-booking-create/components/BookingSummarySidebar";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/booking-calculations";
import { photographerApi } from "@/services/photographer";
import { queryKeys } from "@/lib/query-keys";
import type { Client } from "@/types/domains/photographer-client";
import {
  isBookableServicePackage,
  type ServicePackage,
} from "@/types/domains/service";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatRwf } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function NewBookingView() {
  const copy = NEW_BOOKING_COPY;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const presetClientId = searchParams.get("client") ?? "";

  const [clientId, setClientId] = useState(presetClientId);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [shootDate, setShootDate] = useState("2026-07-15");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [basePrice, setBasePrice] = useState("50000");
  const [deposit, setDeposit] = useState("15000");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [applyTax, setApplyTax] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [crmClients, setCrmClients] = useState<Client[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    void photographerApi.clients.list().then((clients) => {
      setCrmClients(clients);
      if (presetClientId && clients.some((client) => client.id === presetClientId)) {
        setClientId(presetClientId);
      }
    });
    void photographerApi.services.list().then((packages) => {
      const bookable = packages.filter(isBookableServicePackage);
      setServicePackages(bookable);
      if (bookable[0]) {
        setSelectedPackageId(bookable[0].id);
        setBasePrice(String(bookable[0].price));
        setDeposit(
          String(Math.round(bookable[0].price * (bookable[0].depositPercent / 100))),
        );
      }
    });
  }, [presetClientId]);

  const selectedPackage =
    servicePackages.find((pkg) => pkg.id === selectedPackageId) ??
    servicePackages[0];

  const clientLabel = useMemo(() => {
    const client = crmClients.find((item) => item.id === clientId);
    return client?.name ?? copy.noClientSelected;
  }, [clientId, crmClients, copy.noClientSelected]);

  const dateLabel = useMemo(() => {
    if (!shootDate) return copy.notSpecified;
    const date = new Date(`${shootDate}T12:00:00`);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [shootDate, copy.notSpecified]);

  const locationLabel = locationName.trim() || copy.notSpecified;

  const handlePackageSelect = (pkg: ServicePackage) => {
    setSelectedPackageId(pkg.id);
    setBasePrice(String(pkg.price));
    setDeposit(String(Math.round(pkg.price * (pkg.depositPercent / 100))));
  };

  const handleCreateBooking = async () => {
    const client = crmClients.find((item) => item.id === clientId);
    if (!client || !selectedPackage) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await photographerApi.bookings.create({
        clientId: client.id,
        clientName: client.name,
        email: client.email,
        servicePackageId: selectedPackage.id,
        packageName: selectedPackage.title,
        packageDetail: selectedPackage.description,
        date: dateLabel,
        time: startTime,
        packagePrice: Number(basePrice) || undefined,
        venue: locationName.trim() || undefined,
        locationNotes: sessionNotes.trim() || address.trim() || undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.bookings,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.notifications,
      });
      navigate(ROUTES.photographer.bookingDetail(booking.id));
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to create booking. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted"
      >
        <Link
          to={ROUTES.photographer.bookings}
          className="transition-colors hover:text-charcoal"
        >
          {copy.breadcrumbBookings}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="font-medium text-charcoal">{copy.breadcrumbCurrent}</span>
      </nav>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
          {submitError ? (
            <p className="mt-2 text-sm font-medium text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.photographer.bookings)}
          >
            {copy.saveDraft}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => void handleCreateBooking()}
            disabled={!clientId || isSubmitting || !selectedPackage}
          >
            {copy.createBooking}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FormSection icon={User} title={copy.clientInformation}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{copy.selectExistingClient}</Label>
                <Select
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                >
                  <option value="">{copy.noClientSelected}</option>
                  {crmClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </div>

              <button
                type="button"
                onClick={() => setAddClientOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-gray-50/50 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-gray-50"
              >
                <Plus className="size-4" />
                {copy.addNewClient}
              </button>
            </div>
          </FormSection>

          <FormSection icon={Camera} title={copy.serviceDetails}>
            <div className="space-y-2">
              <Label>{copy.shootPackage}</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {servicePackages.length === 0 ? (
                  <p className="col-span-full text-sm text-muted">
                    Create a service package first to attach it to this booking.
                  </p>
                ) : null}
                {servicePackages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handlePackageSelect(pkg)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        isSelected
                          ? "border-gold bg-gold-light/30"
                          : "border-border bg-white hover:bg-gray-50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-charcoal">
                          {pkg.title}
                        </p>
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border",
                            isSelected
                              ? "border-gold bg-gold text-white"
                              : "border-border bg-white",
                          )}
                        >
                          {isSelected && (
                            <Check className="size-3" strokeWidth={3} />
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{pkg.description}</p>
                      <p className="mt-3 text-sm font-bold text-charcoal">
                        {formatRwf(pkg.price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </FormSection>

          <FormSection icon={Calendar} title={copy.schedulingLocation}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.shootDate}</Label>
                <Input
                  type="date"
                  value={shootDate}
                  onChange={(event) => setShootDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.startTime}</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.endTime}</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.locationName}</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                  <Input
                    value={locationName}
                    onChange={(event) => setLocationName(event.target.value)}
                    placeholder={copy.locationPlaceholder}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{copy.address}</Label>
                <Input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={copy.addressPlaceholder}
                />
              </div>
            </div>
          </FormSection>

          <FormSection icon={CreditCard} title={copy.paymentSettings}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{copy.basePrice}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted">
                    RWF
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={basePrice}
                    onChange={(event) => setBasePrice(event.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{copy.depositRequired}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted">
                    RWF
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={deposit}
                    onChange={(event) => setDeposit(event.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.paymentMethod}</Label>
                <Select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <label className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  checked={applyTax}
                  onChange={(event) => setApplyTax(event.target.checked)}
                  className="accent-gold"
                />
                <span className="text-sm text-charcoal">{copy.autoApplyTax}</span>
              </label>
            </div>
          </FormSection>

          <FormSection icon={FileText} title={copy.additionalDetails}>
            <div className="space-y-2">
              <Label>{copy.sessionNotes}</Label>
              <Textarea
                value={sessionNotes}
                onChange={(event) => setSessionNotes(event.target.value)}
                placeholder={copy.sessionNotesPlaceholder}
              />
            </div>
          </FormSection>
        </div>

        <BookingSummarySidebar
          clientLabel={clientLabel}
          packageName={selectedPackage?.title ?? copy.notSpecified}
          dateLabel={dateLabel}
          locationLabel={locationLabel}
          basePrice={Number(basePrice) || 0}
          deposit={Number(deposit) || 0}
          applyTax={applyTax}
          onCreate={handleCreateBooking}
        />
      </div>

      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        onCreated={async (client) => {
          const created = await photographerApi.clients.add(client);
          setClientId(created.id);
        }}
      />
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-gold" aria-hidden />
        <h2 className="text-sm font-bold text-charcoal">{title}</h2>
      </div>
      {children}
    </section>
  );
}
