import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronRight,
  FolderOpen,
  Image,
  Info,
  Send,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GALLERY_CREATE_COPY } from "@/constants/photographer-gallery-create";
import { ROUTES } from "@/constants/routes";
import { landingAssets } from "@/constants/assets";
import { GalleryFormSidebar } from "@/features/photographer-gallery-create/components/GalleryFormSidebar";
import { GalleryCoverUploadField } from "@/features/photographer-gallery-create/components/GalleryCoverUploadField";
import {
  GalleryPendingPhotosField,
  type PendingGalleryPhoto,
} from "@/features/photographer-gallery-create/components/GalleryPendingPhotosField";
import {
  ToggleSwitch,
} from "@/features/photographer-gallery-detail/components/GalleryTabShared";
import { photographerApi } from "@/services/photographer";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking } from "@/types/domains/booking";
import type { Client } from "@/types/domains/photographer-client";
import {
  type GalleryCategory,
  type GalleryFormValues,
  type GalleryStatusSegment,
  type GalleryVisibility,
} from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type GalleryFormViewProps = {
  mode: "create" | "edit";
  galleryId?: string;
  initialValues: GalleryFormValues;
  coverImage?: string;
};

const statusSegments: GalleryStatusSegment[] = ["draft", "editing", "ready"];

export function GalleryFormView({
  mode,
  galleryId,
  initialValues,
  coverImage,
}: GalleryFormViewProps) {
  const copy = GALLERY_CREATE_COPY;
  const navigate = useNavigate();
  const location = useLocation();
  const draftSavedMessage =
    (location.state as { draftSaved?: boolean } | null)?.draftSaved === true
      ? copy.draftSaved
      : null;
  const isEdit = mode === "edit";

  const [galleryName, setGalleryName] = useState(initialValues.galleryName);
  const [category, setCategory] = useState(initialValues.category);
  const [description, setDescription] = useState(initialValues.description);
  const [clientId, setClientId] = useState(initialValues.clientId);
  const [relatedBookingId, setRelatedBookingId] = useState(
    initialValues.relatedBookingId,
  );
  const [visibility, setVisibility] = useState(initialValues.visibility);
  const [allowDownloads, setAllowDownloads] = useState(
    initialValues.allowDownloads,
  );
  const [allowFavorites, setAllowFavorites] = useState(
    initialValues.allowFavorites,
  );
  const [socialSharing, setSocialSharing] = useState(initialValues.socialSharing);
  const [statusSegment, setStatusSegment] = useState(initialValues.statusSegment);
  const [accessPin, setAccessPin] = useState(initialValues.accessPin ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(coverImage ?? null);
  const [pendingPhotos, setPendingPhotos] = useState<PendingGalleryPhoto[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedGalleryId, setSavedGalleryId] = useState<string | undefined>(galleryId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isApplyingBooking, setIsApplyingBooking] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const totalPhotoCount = isEdit
    ? initialValues.photoCount + pendingPhotos.length
    : pendingPhotos.length;
  const storageUsedGb = Number((totalPhotoCount * 0.025).toFixed(1));

  useEffect(() => {
    void Promise.all([
      photographerApi.clients.list(),
      photographerApi.bookings.list(),
    ]).then(([clientList, bookingList]) => {
      setClients(clientList);
      setBookings(bookingList);
      if (!initialValues.clientId && clientList[0]) {
        setClientId(clientList[0].id);
      }
    });
  }, [initialValues.clientId]);

  useEffect(() => {
    if (!relatedBookingId) return;

    let cancelled = false;
    setIsApplyingBooking(true);

    void photographerApi.bookings.getDetail(relatedBookingId).then((detail) => {
      if (cancelled || !detail) {
        if (!cancelled) setIsApplyingBooking(false);
        return;
      }

      setGalleryName(`${detail.package.title} — ${detail.event.date}`);
      if (detail.clientId) {
        setClientId(detail.clientId);
      }
      if (!description.trim() && detail.package.subtitle) {
        setDescription(detail.package.subtitle);
      }
      setIsApplyingBooking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [relatedBookingId]);

  const storageTotalGb = initialValues.storageTotalGb;

  const selectedClient = clients.find((client) => client.id === clientId);

  const bookingOptions = useMemo(() => {
    if (!selectedClient) return [];
    return bookings
      .filter(
        (booking) =>
          booking.email.toLowerCase() === selectedClient.email.toLowerCase() &&
          (booking.status === "confirmed" || booking.status === "completed"),
      )
      .map((booking) => ({
        id: booking.id,
        label: `${booking.packageName} — ${booking.date}`,
      }));
  }, [bookings, selectedClient]);

  const previewCoverImage = coverUrl ?? coverImage ?? landingAssets.hero.studioMockup;

  const storagePercent = Math.min(
    100,
    Math.round((storageUsedGb / storageTotalGb) * 100),
  );

  const sidebarValues = {
    galleryName,
    category,
    clientId,
    photoCount: totalPhotoCount,
    storageUsedGb,
    storageTotalGb,
    statusSegment,
  };

  const effectiveGalleryId = galleryId ?? savedGalleryId;
  const isStatusLocked =
    initialValues.workflowStatus === "delivered" ||
    initialValues.galleryStatus === "archived";

  const buildPayload = (segment: GalleryStatusSegment) => ({
    title: galleryName.trim(),
    description: description.trim() || undefined,
    category,
    clientId,
    bookingId: relatedBookingId || undefined,
    visibility,
    allowDownloads,
    allowFavorites,
    socialSharing,
    statusSegment: isStatusLocked ? undefined : segment,
    coverAssetKey: coverUrl ?? undefined,
    ...(visibility === "password" && accessPin.trim()
      ? { accessPin: accessPin.trim() }
      : {}),
  });

  const uploadPendingPhotos = async (targetGalleryId: string) => {
    if (pendingPhotos.length === 0) return;

    await photographerApi.galleries.uploadPhotos(
      targetGalleryId,
      pendingPhotos.map((photo, index) => ({
        assetKey: photo.url,
        alt: photo.name || `Gallery photo ${index + 1}`,
      })),
    );
    setPendingPhotos([]);
  };

  const persistGallery = async (segment: GalleryStatusSegment) => {
    const payload = buildPayload(segment);
    const targetGalleryId =
      isEdit && galleryId
        ? galleryId
        : savedGalleryId
          ? savedGalleryId
          : null;

    if (targetGalleryId) {
      await photographerApi.galleries.update(targetGalleryId, payload);
      await uploadPendingPhotos(targetGalleryId);
      return targetGalleryId;
    }

    const created = await photographerApi.galleries.create(payload);
    setSavedGalleryId(created.id);
    await uploadPendingPhotos(created.id);
    return created.id;
  };

  const handleSaveDraft = async () => {
    if (!galleryName.trim()) {
      setSubmitError(copy.draftNameRequired);
      return;
    }
    if (!clientId) {
      setSubmitError(copy.draftClientRequired);
      return;
    }
    if (visibility === "password" && !accessPin.trim()) {
      setSubmitError(copy.accessPinRequired);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const targetGalleryId = await persistGallery("draft");
      if (!isEdit) {
        navigate(ROUTES.photographer.galleryEdit(targetGalleryId), {
          state: { draftSaved: true },
        });
      }
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to save draft."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!galleryName.trim() || !clientId) return;
    if (visibility === "password" && !accessPin.trim()) {
      setSubmitError(copy.accessPinRequired);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const targetGalleryId = await persistGallery(statusSegment);
      navigate(ROUTES.photographer.galleryDetail(targetGalleryId));
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to save gallery."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewGallery = () => {
    if (!effectiveGalleryId) return;

    window.open(
      `${window.location.origin}${ROUTES.photographer.galleryDetail(effectiveGalleryId)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareLink = async () => {
    if (!effectiveGalleryId) return;

    const shareUrl = `${window.location.origin}${ROUTES.client.galleryDetail(effectiveGalleryId)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setSubmitError("Unable to copy gallery link. Please try again.");
    }
  };

  return (
    <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted"
      >
        <Link
          to={ROUTES.photographer.galleries}
          className="transition-colors hover:text-charcoal"
        >
          {copy.breadcrumbGalleries}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="font-medium text-charcoal">
          {isEdit ? copy.breadcrumbEdit : copy.breadcrumbCreate}
        </span>
      </nav>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
            {isEdit ? copy.editTitle : copy.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {isEdit ? copy.editSubtitle : copy.subtitle}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {isEdit ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={ROUTES.photographer.galleries}>{copy.cancel}</Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
              >
                {copy.saveChanges}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleSaveDraft()}
              >
                {copy.saveDraft}
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
              >
                {copy.createGallery}
              </Button>
            </>
          )}
        </div>
      </div>

      {draftSavedMessage ? (
        <p
          className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {draftSavedMessage}
        </p>
      ) : null}

      {submitError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FormSection icon={Info} title={copy.galleryInformation}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.galleryName}</Label>
                <Input
                  value={galleryName}
                  onChange={(event) => setGalleryName(event.target.value)}
                  placeholder={copy.galleryNamePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.category}</Label>
                <Select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as GalleryCategory)
                  }
                >
                  {Object.entries(copy.categories).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.galleryDescription}</Label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={copy.galleryDescriptionPlaceholder}
                  className="min-h-24"
                />
              </div>
            </div>
          </FormSection>

          <FormSection icon={User} title={copy.clientAssignment}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{copy.selectClient}</Label>
                  <Select
                    value={clientId}
                    onChange={(event) => {
                      setClientId(event.target.value);
                      setRelatedBookingId("");
                    }}
                  >
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{copy.relatedBooking}</Label>
                  <Select
                    value={relatedBookingId}
                    onChange={(event) => setRelatedBookingId(event.target.value)}
                    disabled={isApplyingBooking}
                  >
                    <option value="">{copy.noBooking}</option>
                    {bookingOptions.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.label}
                      </option>
                    ))}
                  </Select>
                  {isApplyingBooking ? (
                    <p className="text-xs text-muted">Applying session details…</p>
                  ) : null}
                </div>
              </div>

              {selectedClient && (
                <div className="rounded-xl border border-border bg-gray-50/80 p-4">
                  <img
                    src={selectedClient.avatar}
                    alt=""
                    className="size-12 rounded-full object-cover"
                  />
                  <p className="mt-3 text-sm font-bold text-charcoal">
                    {selectedClient.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {selectedClient.email}
                  </p>
                  {selectedClient.tier === "vip" && (
                    <span className="mt-2 inline-flex rounded-full bg-charcoal px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                      {copy.eliteClient}
                    </span>
                  )}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection icon={Image} title={copy.coverImage}>
            <GalleryCoverUploadField
              value={coverUrl}
              fallbackPreview={previewCoverImage}
              onChange={setCoverUrl}
              disabled={isSubmitting}
            />
          </FormSection>

          <FormSection icon={FolderOpen} title={copy.photoUpload}>
            <GalleryPendingPhotosField
              photos={pendingPhotos}
              onChange={setPendingPhotos}
              disabled={isSubmitting}
            />

            {totalPhotoCount > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-charcoal">
                    {copy.uploadProgress(
                      totalPhotoCount,
                      storageUsedGb,
                      storageTotalGb,
                    )}
                  </span>
                  <span className="font-bold text-charcoal">{storagePercent}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gold transition-all"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>
            )}
          </FormSection>

          <div className="grid gap-5 lg:grid-cols-2">
            <FormSection icon={Send} title={copy.deliverySettings}>
              <div className="space-y-4">
                <div>
                  <p className="mb-3 text-xs font-semibold text-charcoal">
                    {copy.visibility}
                  </p>
                  <div className="space-y-2">
                    {(
                      Object.entries(copy.visibilityOptions) as [
                        GalleryVisibility,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2.5"
                      >
                        <input
                          type="radio"
                          name="visibility"
                          checked={visibility === value}
                          onChange={() => setVisibility(value)}
                          className="size-4 accent-charcoal"
                        />
                        <span className="text-sm text-charcoal">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {visibility === "password" ? (
                  <div className="space-y-2 border-t border-border pt-4">
                    <Label>{copy.accessPin}</Label>
                    <Input
                      value={accessPin}
                      onChange={(event) => setAccessPin(event.target.value)}
                      placeholder={copy.accessPinPlaceholder}
                      inputMode="numeric"
                    />
                    <p className="text-xs text-muted">{copy.accessPinHint}</p>
                  </div>
                ) : null}

                <div className="border-t border-border pt-4">
                  <p className="mb-4 text-xs font-semibold text-charcoal">
                    {copy.permissions}
                  </p>
                  <div className="space-y-4">
                    <ToggleSwitch
                      checked={allowDownloads}
                      onChange={setAllowDownloads}
                      label={copy.allowDownloads}
                    />
                    <ToggleSwitch
                      checked={allowFavorites}
                      onChange={setAllowFavorites}
                      label={copy.allowFavorites}
                    />
                    <ToggleSwitch
                      checked={socialSharing}
                      onChange={setSocialSharing}
                      label={copy.socialSharing}
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection icon={Info} title={copy.galleryStatus}>
              {isStatusLocked ? (
                <div className="space-y-3">
                  <div className="inline-flex rounded-full bg-charcoal px-3 py-1.5 text-xs font-bold tracking-wide text-white uppercase">
                    {initialValues.workflowStatus === "delivered"
                      ? copy.lockedStatus.delivered
                      : copy.lockedStatus.archived}
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    {initialValues.workflowStatus === "delivered"
                      ? copy.lockedStatusHints.delivered
                      : copy.lockedStatusHints.archived}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex rounded-lg border border-border bg-gray-100 p-1">
                    {statusSegments.map((segment) => (
                      <button
                        key={segment}
                        type="button"
                        onClick={() => setStatusSegment(segment)}
                        className={cn(
                          "flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
                          statusSegment === segment
                            ? "bg-white text-charcoal shadow-sm"
                            : "text-muted hover:text-charcoal",
                        )}
                      >
                        {copy.statusSegments[segment]}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    {copy.statusDescriptions[statusSegment]}
                  </p>
                </>
              )}
            </FormSection>
          </div>
        </div>

        <GalleryFormSidebar
          values={sidebarValues}
          clientName={selectedClient?.name}
          galleryId={effectiveGalleryId}
          linkCopied={linkCopied}
          onPreviewGallery={handlePreviewGallery}
          onShareLink={() => void handleShareLink()}
        />
      </div>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: typeof Info;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-gold" aria-hidden />
          <h2 className="text-sm font-bold text-charcoal">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
