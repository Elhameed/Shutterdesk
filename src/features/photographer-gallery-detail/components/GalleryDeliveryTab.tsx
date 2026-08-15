import { useEffect, useState } from "react";
import { Check, Copy, Hourglass, Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import {
  GALLERY_WORKFLOW_BADGE_STYLES,
} from "@/constants/status-colors";
import {
  GalleryTabSection,
  ToggleSwitch,
} from "@/features/photographer-gallery-detail/components/GalleryTabShared";
import { photographerApi } from "@/services/photographer";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  GalleryDeliveryData,
  GalleryDetail,
  PhotographerGallery,
} from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type GalleryDeliveryTabProps = {
  gallery: PhotographerGallery;
  delivery: GalleryDeliveryData;
  onDelivered?: (gallery: PhotographerGallery) => void;
  onUpdated?: (detail: GalleryDetail) => void;
};

export function GalleryDeliveryTab({
  gallery,
  delivery: initialDelivery,
  onDelivered,
  onUpdated,
}: GalleryDeliveryTabProps) {
  const copy = GALLERIES_COPY;
  const panel = GALLERIES_COPY.detail.tabPanels.delivery;

  const [delivery, setDelivery] = useState(initialDelivery);
  const [copied, setCopied] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDelivery(initialDelivery);
  }, [initialDelivery]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${delivery.privateLink}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDeliver = async () => {
    setIsDelivering(true);
    try {
      await photographerApi.galleries.deliver(gallery.id);
      const detail = await photographerApi.galleries.getDetail(gallery.id);
      if (detail) {
        setDelivery(detail.meta.delivery);
        onUpdated?.(detail);
        onDelivered?.(detail.gallery);
      }
    } finally {
      setIsDelivering(false);
    }
  };

  const updateDelivery = <K extends keyof GalleryDeliveryData>(
    key: K,
    value: GalleryDeliveryData[K],
  ) => {
    setSaved(false);
    setSaveError(null);
    setDelivery((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const detail = await photographerApi.galleries.updateDelivery(gallery.id, {
        allowDownloads: delivery.downloadEnabled,
        highResDownloads: delivery.highResDownloads,
        watermarkEnabled: delivery.watermarkEnabled,
        clientNotified: delivery.clientNotified,
        deliveryNotes: delivery.deliveryNotes,
        accessPin: delivery.accessPin,
        expiresAt: delivery.expiresAt,
      });
      setDelivery(detail.meta.delivery);
      onUpdated?.(detail);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Unable to save delivery settings."));
    } finally {
      setIsSaving(false);
    }
  };

  const canDeliver =
    gallery.workflowStatus !== "delivered" && gallery.photoCount > 0;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
              {panel.statusTitle}
            </p>
            <p className="mt-2 text-sm text-muted">
              {delivery.deliveryNotes}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase",
              GALLERY_WORKFLOW_BADGE_STYLES[gallery.workflowStatus],
            )}
          >
            <span className="size-1.5 rounded-full bg-gold" aria-hidden />
            {copy.workflowStatus[gallery.workflowStatus]}
          </span>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <GalleryTabSection title={panel.timelineTitle}>
          <ol className="space-y-0">
            {delivery.steps.map((step, index) => {
              const isLast = index === delivery.steps.length - 1;

              return (
                <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute top-[19px] left-[8px] h-[calc(100%-19px)] w-px bg-border"
                      aria-hidden
                    />
                  )}

                  <div className="relative z-10 flex h-[2.375rem] w-[18px] shrink-0 items-center justify-center">
                    <span
                      className={cn(
                        "flex size-[18px] items-center justify-center rounded-full",
                        step.status === "upcoming"
                          ? "border border-border bg-white"
                          : step.status === "current"
                            ? "bg-gold text-white"
                            : "bg-charcoal text-white",
                      )}
                    >
                      {step.status === "current" ? (
                        <Hourglass className="size-2.5" strokeWidth={3} />
                      ) : step.status === "completed" ? (
                        <Check className="size-2.5" strokeWidth={3} />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-light" />
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-5",
                        step.status === "upcoming"
                          ? "text-muted"
                          : "text-charcoal",
                      )}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="mt-0.5 text-xs text-muted">{step.date}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </GalleryTabSection>

        <GalleryTabSection title={panel.accessTitle}>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {panel.privateLink}
              </p>
              <div className="mt-2 flex gap-2">
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm text-charcoal">
                  {delivery.privateLink}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={handleCopyLink}
                >
                  <Copy className="size-3.5" />
                  {copied ? panel.copied : panel.copyLink}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{panel.accessPin}</Label>
                <Input
                  value={delivery.accessPin ?? ""}
                  onChange={(event) => updateDelivery("accessPin", event.target.value)}
                  placeholder={panel.accessPinPlaceholder}
                  inputMode="numeric"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {panel.expiresAt}
                </p>
                <p className="mt-1 text-sm font-bold text-charcoal">
                  {delivery.expiresAt}
                </p>
              </div>
            </div>

            <Button
              variant="gold"
              size="sm"
              className="w-full gap-2"
              disabled={!canDeliver || isDelivering}
              onClick={() => void handleDeliver()}
            >
              <Send className="size-4" />
              {isDelivering ? "Delivering…" : panel.sendToClient}
            </Button>
          </div>
        </GalleryTabSection>
      </div>

      <GalleryTabSection title={panel.permissionsTitle}>
        <div className="space-y-5">
          <ToggleSwitch
            checked={delivery.downloadEnabled}
            onChange={(value) => updateDelivery("downloadEnabled", value)}
            label={panel.downloadEnabled}
            description={panel.downloadEnabledHint}
          />
          <ToggleSwitch
            checked={delivery.highResDownloads}
            onChange={(value) => updateDelivery("highResDownloads", value)}
            label={panel.highResDownloads}
            description={panel.highResDownloadsHint}
          />
          <ToggleSwitch
            checked={delivery.watermarkEnabled}
            onChange={(value) => updateDelivery("watermarkEnabled", value)}
            label={panel.watermarkEnabled}
            description={panel.watermarkEnabledHint}
          />
          <ToggleSwitch
            checked={delivery.clientNotified}
            onChange={(value) => updateDelivery("clientNotified", value)}
            label={panel.clientNotified}
            description={panel.clientNotifiedHint}
          />
        </div>
      </GalleryTabSection>

      <GalleryTabSection title={panel.notesTitle}>
        <Textarea
          value={delivery.deliveryNotes}
          onChange={(event) => updateDelivery("deliveryNotes", event.target.value)}
          className="min-h-24"
        />
      </GalleryTabSection>

      <section className="rounded-xl border border-border border-l-4 border-l-gold bg-gray-50 p-4">
        <div className="flex gap-3">
          <Lightbulb className="size-5 shrink-0 text-gold" aria-hidden />
          <div>
            <p className="text-sm font-bold text-charcoal">{panel.proTipTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {panel.proTipBody}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          {saveError ? (
            <span className="text-red-700" role="alert">
              {saveError}
            </span>
          ) : saved ? (
            panel.saved
          ) : (
            "\u00A0"
          )}
        </p>
        <Button
          variant="default"
          size="sm"
          disabled={isSaving || gallery.status === "archived"}
          onClick={() => void handleSave()}
        >
          {panel.saveChanges}
        </Button>
      </div>
    </div>
  );
}
