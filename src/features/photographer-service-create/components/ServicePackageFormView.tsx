import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Banknote,
  ChevronRight,
  Clock,
  CloudUpload,
  Eye,
  FileText,
  Image,
  Info,
  Plus,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_CREATE_COPY } from "@/constants/photographer-service-create";
import { ROUTES } from "@/constants/routes";
import { PackagePreviewSidebar } from "@/features/photographer-service-create/components/PackagePreviewSidebar";
import { photographerApi } from "@/services/photographer";
import { uploadServiceCoverToCloudinary } from "@/lib/cloudinary-upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolveMediaUrl } from "@/lib/media-url";
import type {
  ServiceBadgeType,
  ServiceCategory,
  ServiceDurationKey,
  ServiceLocationType,
  ServicePackageFormValues,
} from "@/types/domains/service";
import { cn } from "@/lib/utils";

type ServicePackageFormViewProps = {
  mode: "create" | "edit";
  serviceId?: string;
  initialValues: ServicePackageFormValues;
  coverImage?: string;
  isDraftPackage?: boolean;
};

export function ServicePackageFormView({
  mode,
  serviceId,
  initialValues,
  coverImage,
  isDraftPackage = false,
}: ServicePackageFormViewProps) {
  const copy = SERVICE_CREATE_COPY;
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [packageName, setPackageName] = useState(initialValues.packageName);
  const [category, setCategory] = useState(initialValues.category);
  const [isActive, setIsActive] = useState(initialValues.isActive);
  const [price, setPrice] = useState(initialValues.price);
  const [depositPercent, setDepositPercent] = useState(initialValues.depositPercent);
  const [currency, setCurrency] = useState(initialValues.currency);
  const [duration, setDuration] = useState(initialValues.duration);
  const [photographers, setPhotographers] = useState(initialValues.photographers);
  const [locationType, setLocationType] = useState(initialValues.locationType);
  const [editedPhotos, setEditedPhotos] = useState(initialValues.editedPhotos);
  const [revisions, setRevisions] = useState(initialValues.revisions);
  const [onlineGallery, setOnlineGallery] = useState(initialValues.onlineGallery);
  const [printDelivery, setPrintDelivery] = useState(initialValues.printDelivery);
  const [commercialLicense, setCommercialLicense] = useState(
    initialValues.commercialLicense,
  );
  const [description, setDescription] = useState(initialValues.description);
  const [additionalNotes, setAdditionalNotes] = useState(
    initialValues.additionalNotes,
  );
  const [includes, setIncludes] = useState<string[]>(initialValues.includes);
  const [newInclude, setNewInclude] = useState("");
  const [isAddingInclude, setIsAddingInclude] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    coverImage ? resolveMediaUrl(coverImage) : null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const durationLabel =
    copy.durations[duration as keyof typeof copy.durations] ??
    copy.durations["1hr"];

  const previewCoverImage = coverPreview;

  const handleCoverSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSubmitError("Please upload a JPG, PNG, or WebP cover image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setSubmitError("Cover image must be 15MB or smaller.");
      return;
    }
    setSubmitError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const addInclude = () => {
    const value = newInclude.trim();
    if (!value || includes.includes(value)) {
      setNewInclude("");
      setIsAddingInclude(false);
      return;
    }
    setIncludes((items) => [...items, value]);
    setNewInclude("");
    setIsAddingInclude(false);
  };

  const startAddingInclude = () => {
    setIsAddingInclude(true);
  };

  const cancelAddingInclude = () => {
    setNewInclude("");
    setIsAddingInclude(false);
  };

  const removeInclude = (item: string) => {
    setIncludes((items) => items.filter((entry) => entry !== item));
  };

  const buildPayload = (
    coverAssetKey?: string,
    options?: { asDraft?: boolean; publishing?: boolean },
  ) => {
    const asDraft = options?.asDraft ?? false;
    const publishing = options?.publishing ?? false;
    const active = asDraft ? false : publishing ? true : isActive;

    return {
      title: packageName.trim() || copy.untitledPackageName,
      description: description.trim(),
      price: Number(price) || 0,
      depositPercent,
      category,
      duration,
      isActive: active,
      isDraft: asDraft ? true : publishing ? false : undefined,
      photographers: Number(photographers) || 1,
      locationType,
      editedPhotos: Number(editedPhotos) || 0,
      revisions: Number(revisions) || 0,
      onlineGallery,
      printDelivery,
      commercialLicense,
      includes,
      additionalNotes: additionalNotes.trim(),
      badges: (asDraft
        ? ["draft"]
        : active
          ? ["public"]
          : []) as ServiceBadgeType[],
      ...(coverAssetKey ? { coverAssetKey } : {}),
    };
  };

  const persistPackage = async (options: { asDraft?: boolean; publishing?: boolean }) => {
    let coverAssetKey: string | undefined;
    if (coverFile) {
      coverAssetKey = await uploadServiceCoverToCloudinary(coverFile);
    }

    const payload = buildPayload(coverAssetKey, options);

    if (isEdit && serviceId) {
      await photographerApi.services.update(serviceId, payload);
    } else {
      await photographerApi.services.create(payload);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await persistPackage({ asDraft: true });
      navigate(ROUTES.photographer.services);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to save draft."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!packageName.trim()) {
      setSubmitError(copy.publishNameRequired);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await persistPackage({ publishing: true });
      navigate(ROUTES.photographer.services);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to publish service package."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!packageName.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await persistPackage({ asDraft: isDraftPackage });
      navigate(ROUTES.photographer.services);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to save service package."));
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
          to={ROUTES.photographer.services}
          className="transition-colors hover:text-charcoal"
        >
          {copy.breadcrumbServices}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="font-medium text-charcoal">
          {isEdit ? copy.editBreadcrumbCurrent : copy.breadcrumbCurrent}
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
          {isEdit && !isDraftPackage ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={ROUTES.photographer.services}>{copy.cancel}</Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handleSaveChanges()}
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
                {copy.saveAsDraft}
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void handlePublish()}
              >
                {copy.publishPackage}
              </Button>
            </>
          )}
        </div>
      </div>

      {submitError ? (
        <p className="mt-4 text-sm text-red-600">{submitError}</p>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <FormSection icon={Info} title={copy.packageInformation}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.packageName}</Label>
                <Input
                  value={packageName}
                  onChange={(event) => setPackageName(event.target.value)}
                  placeholder={copy.packageNamePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.category}</Label>
                <Select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as ServiceCategory)
                  }
                >
                  {Object.entries(copy.categories).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-gray-50/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-gold-light text-gold">
                  <Eye className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {copy.status}
                  </p>
                  <p className="text-xs text-muted">{copy.statusDescription}</p>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <span className="text-xs font-semibold text-charcoal">
                  {copy.active}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive((value) => !value)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    isActive ? "bg-gold" : "bg-gray-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                      isActive && "translate-x-5",
                    )}
                  />
                </button>
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <Label>{copy.coverImage}</Label>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isSubmitting}
                className="relative w-full overflow-hidden rounded-xl border border-dashed border-border bg-gray-50/80 px-4 py-10 text-center transition-colors hover:border-gold/60 disabled:opacity-60"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt=""
                    className={cn(
                      "pointer-events-none absolute inset-0 size-full object-cover",
                      isEdit ? "opacity-30" : "opacity-20",
                    )}
                    aria-hidden
                  />
                ) : null}
                <CloudUpload className="relative mx-auto size-8 text-muted" />
                <p className="relative mt-3 text-sm font-semibold text-charcoal">
                  {copy.coverDropTitle}
                </p>
                <p className="relative mt-1 text-xs text-muted">
                  {coverFile ? coverFile.name : copy.coverDropHint}
                </p>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isSubmitting}
                  onChange={handleCoverSelect}
                />
              </button>
            </div>
          </FormSection>

          <div className="grid gap-5 lg:grid-cols-2">
            <FormSection icon={Banknote} title={copy.pricing}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{copy.packagePrice}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted">
                      RWF
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      placeholder="0"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{copy.depositPercentage}</Label>
                    <span className="text-sm font-bold text-charcoal">
                      {depositPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={depositPercent}
                    onChange={(event) =>
                      setDepositPercent(Number(event.target.value))
                    }
                    className="h-2 w-full cursor-pointer accent-gold"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{copy.currency}</Label>
                  <Select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                  >
                    {Object.entries(copy.currencies).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </FormSection>

            <FormSection icon={Clock} title={copy.sessionDetails}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{copy.sessionDuration}</Label>
                  <Select
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value as ServiceDurationKey)
                    }
                  >
                    {Object.entries(copy.durations).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{copy.numberOfPhotographers}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={photographers}
                    onChange={(event) => setPhotographers(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{copy.locationType}</Label>
                  <Select
                    value={locationType}
                    onChange={(event) =>
                      setLocationType(event.target.value as ServiceLocationType)
                    }
                  >
                    {Object.entries(copy.locationTypes).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </FormSection>
          </div>

          <FormSection icon={Image} title={copy.deliverables}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{copy.editedPhotos}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editedPhotos}
                    onChange={(event) => setEditedPhotos(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{copy.revisions}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={revisions}
                    onChange={(event) => setRevisions(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={onlineGallery}
                    onChange={(event) => setOnlineGallery(event.target.checked)}
                  />
                  <span className="text-sm text-charcoal">{copy.onlineGallery}</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={printDelivery}
                    onChange={(event) => setPrintDelivery(event.target.checked)}
                  />
                  <span className="text-sm text-charcoal">{copy.printDelivery}</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={commercialLicense}
                    onChange={(event) =>
                      setCommercialLicense(event.target.checked)
                    }
                  />
                  <span className="text-sm text-charcoal">
                    {copy.commercialLicense}
                  </span>
                </label>
              </div>
            </div>
          </FormSection>

          <FormSection icon={FileText} title={copy.description}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{copy.packageDescription}</Label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={copy.packageDescriptionPlaceholder}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="normal-case">{copy.whatsIncluded}</Label>
                  <button
                    type="button"
                    onClick={startAddingInclude}
                    className="text-xs font-semibold text-gold hover:text-gold-hover"
                  >
                    {copy.addCustom}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {includes.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-light/40 px-3 py-1 text-xs font-medium text-charcoal"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeInclude(item)}
                        className="text-muted hover:text-charcoal"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}

                  {isAddingInclude ? (
                    <span className="inline-flex items-center rounded-full border border-charcoal/20 bg-white px-2 py-1">
                      <input
                        autoFocus
                        value={newInclude}
                        onChange={(event) => setNewInclude(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addInclude();
                          }
                          if (event.key === "Escape") {
                            cancelAddingInclude();
                          }
                        }}
                        onBlur={addInclude}
                        placeholder="Item name"
                        className="w-28 border-0 bg-transparent text-xs text-charcoal outline-none placeholder:text-muted"
                      />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={startAddingInclude}
                      className="inline-flex items-center gap-1 rounded-full border border-charcoal/15 bg-charcoal/5 px-3 py-1 text-xs font-medium text-charcoal transition-colors hover:bg-charcoal/10"
                    >
                      <Plus className="size-3" />
                      {copy.addItem}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{copy.additionalNotes}</Label>
                <Textarea
                  value={additionalNotes}
                  onChange={(event) => setAdditionalNotes(event.target.value)}
                  placeholder={copy.additionalNotesPlaceholder}
                  className="min-h-24"
                />
              </div>
            </div>
          </FormSection>
        </div>

        <PackagePreviewSidebar
          packageName={packageName}
          price={Number(price) || 0}
          durationLabel={durationLabel}
          editedPhotos={Number(editedPhotos) || 0}
          includes={includes}
          coverImage={previewCoverImage}
          hasCoverImage={coverPreview !== null}
          footerNote={isEdit ? copy.lastUpdated : copy.autoSaved}
        />
      </div>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
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
