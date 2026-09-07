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
import {
  useDeliverGallery,
  useUpdateGalleryDelivery,
} from "@/hooks/queries/photographer-mutations";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  GalleryDeliveryData,
  PhotographerGallery,
} from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type GalleryDeliveryTabProps = {
  gallery: PhotographerGallery;
  delivery: GalleryDeliveryData;
};

export function GalleryDeliveryTab({
  gallery,
  delivery: initialDelivery,
}: GalleryDeliveryTabProps) {
  const copy = GALLERIES_COPY;
  const panel = GALLERIES_COPY.detail.tabPanels.delivery;

  const [delivery, setDelivery] = useState(initialDelivery);
  const [copied, setCopied] = useState(false);
  const deliverGallery = useDeliverGallery();
  const saveDelivery = useUpdateGalleryDelivery();
  const isDelivering = deliverGallery.isPending;
  const isSaving = saveDelivery.isPending;
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
    // Delivering invalidates the gallery, so the panel re-renders from the
    // refreshed detail rather than this tab pushing a copy back up.
    await deliverGallery.mutateAsync(gallery.id);
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
    setSaveError(null);

    try {
      await saveDelivery.mutateAsync({
        galleryId: gallery.id,
        input: {
          allowDownloads: delivery.downloadEnabled,
          highResDownloads: delivery.highResDownloads,
          watermarkEnabled: delivery.watermarkEnabled,
          clientNotified: delivery.clientNotified,
          deliveryNotes: delivery.deliveryNotes,
          accessPin: delivery.accessPin,
          expiresAt: delivery.expiresAt,
        },
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Unable to save delivery settings."));
    }
  };

  const canDeliver =
    gallery.workflowStatus !== "delivered" && gallery.photoCount > 0;

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-medium text-ink-faint">
              {panel.statusTitle}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              {delivery.deliveryNotes}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium",
              GALLERY_WORKFLOW_BADGE_STYLES[gallery.workflowStatus],
            )}
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
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
                          ? "border border-border bg-panel"
                          : step.status === "current"
                            ? "bg-accent text-on-accent"
                            : "bg-ink text-panel",
                      )}
                    >
                      {step.status === "current" ? (
                        <Hourglass className="size-2.5" strokeWidth={3} />
                      ) : step.status === "completed" ? (
                        <Check className="size-2.5" strokeWidth={3} />
                      ) : (
                        <span className="size-1.5 rounded-full bg-ink-faint" />
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-5",
                        step.status === "upcoming"
                          ? "text-ink-soft"
                          : "text-ink",
                      )}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="mt-0.5 text-xs text-ink-soft">{step.date}</p>
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
              <p className="text-[10px] font-medium text-ink-faint">
                {panel.privateLink}
              </p>
              <div className="mt-2 flex gap-2">
                <div className="min-w-0 flex-1 rounded-sm border border-border bg-paper-dim px-3 py-2 text-sm text-ink">
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
                <p className="text-[10px] font-medium text-ink-faint">
                  {panel.expiresAt}
                </p>
                <p className="mt-1 text-sm font-bold text-ink">
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

      <section className="rounded-md border border-border border-l-4 border-l-gold bg-paper-dim p-4">
        <div className="flex gap-3">
          <Lightbulb className="size-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-sm font-bold text-ink">{panel.proTipTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              {panel.proTipBody}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-soft">
          {saveError ? (
            <span className="text-bad-fg" role="alert">
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
