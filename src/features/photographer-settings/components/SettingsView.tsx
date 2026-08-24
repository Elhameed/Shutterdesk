import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/AuthProvider";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { SETTINGS_COPY, type SettingsTab } from "@/constants/photographer-settings";
import { BillingSettingsPanel } from "@/features/photographer-settings/components/BillingSettingsPanel";
import { BookingPreferencesPanel } from "@/features/photographer-settings/components/BookingPreferencesPanel";
import { GallerySettingsPanel } from "@/features/photographer-settings/components/GallerySettingsPanel";
import { NotificationSettingsPanel } from "@/features/photographer-settings/components/NotificationSettingsPanel";
import { PaymentSettingsPanel } from "@/features/photographer-settings/components/PaymentSettingsPanel";
import { ProfileSettingsPanel } from "@/features/photographer-settings/components/ProfileSettingsPanel";
import { SecuritySettingsPanel } from "@/features/photographer-settings/components/SecuritySettingsPanel";
import { SettingsBreadcrumbs } from "@/features/photographer-settings/components/SettingsBreadcrumbs";
import { SettingsFooter } from "@/features/photographer-settings/components/SettingsFooter";
import { SettingsNav } from "@/features/photographer-settings/components/SettingsNav";
import { StudioSettingsPanel } from "@/features/photographer-settings/components/StudioSettingsPanel";
import { photographerApi } from "@/services/photographer";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import type {
  BookingSettings,
  GallerySettings,
  NotificationSettings,
  PaymentSettings,
  ProfileSettings,
  SecuritySettings,
  StudioSettings,
} from "@/types/domains/settings";
import type { BillingInvoice } from "@/types/domains/settings";

type SavedSettings = {
  profile: ProfileSettings;
  studio: StudioSettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  gallery: GallerySettings;
  booking: BookingSettings;
  security: SecuritySettings;
};

const EMPTY_SECURITY: SecuritySettings = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: false,
};

export function SettingsView() {
  const copy = SETTINGS_COPY;
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [studio, setStudio] = useState<StudioSettings | null>(null);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [notifications, setNotifications] =
    useState<NotificationSettings | null>(null);
  const [gallery, setGallery] = useState<GallerySettings | null>(null);
  const [booking, setBooking] = useState<BookingSettings | null>(null);
  const [security, setSecurity] = useState<SecuritySettings>(EMPTY_SECURITY);
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoice[]>([]);
  const [savedSettings, setSavedSettings] = useState<SavedSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const [
        profileData,
        studioData,
        paymentData,
        notificationData,
        galleryData,
        bookingData,
        securityData,
        billingData,
      ] = await Promise.all([
        photographerApi.settings.getPanel("profile"),
        photographerApi.settings.getPanel("studio"),
        photographerApi.settings.getPanel("payment"),
        photographerApi.settings.getPanel("notifications"),
        photographerApi.settings.getPanel("gallery"),
        photographerApi.settings.getPanel("booking"),
        photographerApi.settings.getPanel("security"),
        photographerApi.settings.getPanel("billing"),
      ]);

      setProfile(profileData);
      setStudio(studioData);
      setPayment(paymentData);
      setNotifications(notificationData);
      setGallery(galleryData);
      setBooking(bookingData);
      setSecurity(securityData);
      setBillingInvoices(billingData.invoices);
      setSavedSettings({
        profile: profileData,
        studio: studioData,
        payment: paymentData,
        notifications: notificationData,
        gallery: galleryData,
        booking: bookingData,
        security: { ...securityData, currentPassword: "", newPassword: "", confirmPassword: "" },
      });
      setLoading(false);
    }

    void loadSettings();
  }, []);

  const isDirty = useMemo(() => {
    if (!savedSettings) return false;
    if (activeTab === "profile" && profile) {
      return JSON.stringify(profile) !== JSON.stringify(savedSettings.profile);
    }
    if (activeTab === "studio" && studio) {
      return JSON.stringify(studio) !== JSON.stringify(savedSettings.studio);
    }
    if (activeTab === "payment" && payment) {
      return JSON.stringify(payment) !== JSON.stringify(savedSettings.payment);
    }
    if (activeTab === "notifications" && notifications) {
      return JSON.stringify(notifications) !== JSON.stringify(savedSettings.notifications);
    }
    if (activeTab === "gallery" && gallery) {
      return JSON.stringify(gallery) !== JSON.stringify(savedSettings.gallery);
    }
    if (activeTab === "booking" && booking) {
      return JSON.stringify(booking) !== JSON.stringify(savedSettings.booking);
    }
    if (activeTab === "security") {
      return (
        security.currentPassword.length > 0 ||
        security.newPassword.length > 0 ||
        security.confirmPassword.length > 0
      );
    }
    return false;
  }, [
    activeTab,
    booking,
    gallery,
    notifications,
    payment,
    profile,
    savedSettings,
    security,
    studio,
  ]);

  const markDirty = () => setSaved(false);

  const changeTab = (tab: SettingsTab) => {
    if (
      isDirty &&
      tab !== activeTab &&
      !window.confirm("You have unsaved changes. Switch tabs without saving?")
    ) {
      return;
    }
    setActiveTab(tab);
  };

  const updateProfile = <K extends keyof ProfileSettings>(
    key: K,
    value: ProfileSettings[K],
  ) => {
    markDirty();
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateStudio = <K extends keyof StudioSettings>(
    key: K,
    value: StudioSettings[K],
  ) => {
    markDirty();
    setStudio((current) => (current ? { ...current, [key]: value } : current));
  };

  const updatePayment = <K extends keyof PaymentSettings>(
    key: K,
    value: PaymentSettings[K],
  ) => {
    markDirty();
    setPayment((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateNotification = (
    eventKey: keyof NotificationSettings,
    channel: keyof NotificationSettings[keyof NotificationSettings],
    enabled: boolean,
  ) => {
    markDirty();
    setNotifications((current) =>
      current
        ? {
            ...current,
            [eventKey]: {
              ...current[eventKey],
              [channel]: enabled,
            },
          }
        : current,
    );
  };

  const updateGallery = <K extends keyof GallerySettings>(
    key: K,
    value: GallerySettings[K],
  ) => {
    markDirty();
    setGallery((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateBooking = <K extends keyof BookingSettings>(
    key: K,
    value: BookingSettings[K],
  ) => {
    markDirty();
    setBooking((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateSecurity = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K],
  ) => {
    markDirty();
    setSecurity((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    if (!savedSettings) return;

    setProfile(savedSettings.profile);
    setStudio(savedSettings.studio);
    setPayment(savedSettings.payment);
    setNotifications(savedSettings.notifications);
    setGallery(savedSettings.gallery);
    setBooking(savedSettings.booking);
    setSecurity({
      ...savedSettings.security,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setSaved(false);
  };

  const handleDeactivate = async () => {
    if (!window.confirm(SETTINGS_COPY.security.account.deactivateConfirm)) {
      return;
    }

    setIsDeactivating(true);
    try {
      await photographerApi.settings.deactivate();
      push({ variant: "success", title: "Your studio account has been deactivated." });
    } catch (error) {
      push({
        title: getApiErrorMessage(error, "Could not deactivate account"),
        variant: "error",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    if (
      activeTab === "security" &&
      security.newPassword &&
      security.newPassword !== security.confirmPassword
    ) {
      push({ title: "New passwords do not match.", variant: "error" });
      return;
    }

    setSaving(true);

    try {
      if (activeTab === "profile" && profile) {
        const updated = await photographerApi.settings.updatePanel("profile", profile);
        setProfile(updated);
        setSavedSettings((current) =>
          current ? { ...current, profile: updated } : current,
        );
        await refreshUser();
      } else if (activeTab === "studio" && studio) {
        const updated = await photographerApi.settings.updatePanel("studio", studio);
        setStudio(updated);
        setSavedSettings((current) =>
          current ? { ...current, studio: updated } : current,
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.photographer.dashboard,
        });
      } else if (activeTab === "payment" && payment) {
        const updated = await photographerApi.settings.updatePanel("payment", payment);
        setPayment(updated);
        setSavedSettings((current) =>
          current ? { ...current, payment: updated } : current,
        );
      } else if (activeTab === "notifications" && notifications) {
        const updated = await photographerApi.settings.updatePanel(
          "notifications",
          notifications,
        );
        setNotifications(updated);
        setSavedSettings((current) =>
          current ? { ...current, notifications: updated } : current,
        );
      } else if (activeTab === "gallery" && gallery) {
        const updated = await photographerApi.settings.updatePanel("gallery", gallery);
        setGallery(updated);
        setSavedSettings((current) =>
          current ? { ...current, gallery: updated } : current,
        );
      } else if (activeTab === "booking" && booking) {
        const updated = await photographerApi.settings.updatePanel("booking", booking);
        setBooking(updated);
        setSavedSettings((current) =>
          current ? { ...current, booking: updated } : current,
        );
      } else if (activeTab === "security") {
        const updated = await photographerApi.settings.updatePanel("security", security);
        const cleared = {
          ...updated,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
        setSecurity(cleared);
        setSavedSettings((current) =>
          current ? { ...current, security: cleared } : current,
        );
      }

      setSaved(true);
      push({ variant: "success", title: copy.saved });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.dashboard,
      });
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      push({
        title: getApiErrorMessage(error, "Could not save settings"),
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile || !studio || !payment || !notifications || !gallery || !booking) {
    return (
      <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <SettingsBreadcrumbs
        activeTab={activeTab}
        onNavigateRoot={() => changeTab("profile")}
      />

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-white shadow-card lg:sticky lg:top-6">
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
          <SettingsNav activeTab={activeTab} onTabChange={changeTab} />

          <section className="flex min-h-[560px] min-w-0 flex-col border-t border-border lg:border-t-0 lg:border-l">
            <div className="flex-1">
              {activeTab === "profile" && (
                <ProfileSettingsPanel values={profile} onChange={updateProfile} />
              )}

              {activeTab === "studio" && (
                <StudioSettingsPanel values={studio} onChange={updateStudio} />
              )}

              {activeTab === "payment" && (
                <PaymentSettingsPanel values={payment} onChange={updatePayment} />
              )}

              {activeTab === "notifications" && (
                <NotificationSettingsPanel
                  values={notifications}
                  onChange={updateNotification}
                />
              )}

              {activeTab === "gallery" && (
                <GallerySettingsPanel values={gallery} onChange={updateGallery} />
              )}

              {activeTab === "booking" && (
                <BookingPreferencesPanel values={booking} onChange={updateBooking} />
              )}

              {activeTab === "security" && (
                <SecuritySettingsPanel
                  values={security}
                  onChange={updateSecurity}
                  onDeactivate={() => void handleDeactivate()}
                  isDeactivating={isDeactivating}
                />
              )}

              {activeTab === "billing" && (
                <BillingSettingsPanel invoices={billingInvoices} />
              )}
            </div>

            {activeTab !== "billing" ? (
              <SettingsFooter
                saved={saved}
                saving={saving}
                onReset={handleReset}
                onSave={() => void handleSave()}
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
