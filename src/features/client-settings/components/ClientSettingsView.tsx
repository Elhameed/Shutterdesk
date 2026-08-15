import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Shield, User } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  CLIENT_SETTINGS_COPY,
  CLIENT_SETTINGS_TABS,
  normalizeClientNotificationSettings,
  type ClientSettingsTab,
} from "@/constants/client-settings";
import { ClientNotificationSettingsPanel } from "@/features/client-settings/components/ClientNotificationSettingsPanel";
import { ClientProfileSettingsPanel } from "@/features/client-settings/components/ClientProfileSettingsPanel";
import { ClientSecuritySettingsPanel } from "@/features/client-settings/components/ClientSecuritySettingsPanel";
import { getApiErrorMessage } from "@/lib/api-error";
import { uploadAvatarToCloudinary } from "@/lib/cloudinary-upload";
import { resolveMediaUrl } from "@/lib/media-url";
import { clientApi } from "@/services/client";
import type {
  ClientNotificationChannel,
  ClientNotificationEventKey,
} from "@/constants/client-settings";
import type { ClientSecuritySettings, ClientSettings } from "@/types/domains/settings";
import { cn } from "@/lib/utils";

const TAB_ICONS = {
  profile: User,
  notifications: Bell,
  security: Shield,
} as const;

const EMPTY_SECURITY: ClientSecuritySettings = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const RWANDA_PHONE_PATTERN = /^\+250\s?\d{3}\s?\d{3}\s?\d{3}$/;

type ClientSettingsViewProps = {
  onClose?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function validateProfile(settings: ClientSettings) {
  const errors: Partial<Record<"fullName" | "phone" | "address" | "interests", string>> =
    {};
  const copy = CLIENT_SETTINGS_COPY.validation;

  if (!settings.fullName.trim()) {
    errors.fullName = copy.fullName;
  }
  if (!settings.phone.trim() || !RWANDA_PHONE_PATTERN.test(settings.phone.trim())) {
    errors.phone = copy.phone;
  }
  if (!settings.address.trim()) {
    errors.address = copy.address;
  }
  if (settings.interests.length === 0) {
    errors.interests = copy.interests;
  }

  return errors;
}

export function ClientSettingsView({ onClose, onDirtyChange }: ClientSettingsViewProps) {
  const copy = CLIENT_SETTINGS_COPY;
  const { push } = useToast();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ClientSettingsTab>("profile");
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<ClientSettings | null>(null);
  const [security, setSecurity] = useState<ClientSecuritySettings>(EMPTY_SECURITY);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"fullName" | "phone" | "address" | "interests", string>>
  >({});

  const isDirty = useMemo(() => {
    if (!settings || !savedSettings) return false;
    if (profileFile) return true;
    if (activeTab === "security") {
      return (
        security.currentPassword.length > 0 ||
        security.newPassword.length > 0 ||
        security.confirmPassword.length > 0
      );
    }
    if (activeTab === "profile") {
      return JSON.stringify(settings) !== JSON.stringify(savedSettings);
    }
    if (activeTab === "notifications") {
      return (
        JSON.stringify(settings.notifications) !==
        JSON.stringify(savedSettings.notifications)
      );
    }
    return false;
  }, [
    activeTab,
    profileFile,
    savedSettings,
    security,
    settings,
  ]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientApi.settings.get();
      const normalized = {
        ...data,
        notifications: normalizeClientNotificationSettings(data.notifications),
      };
      setSettings(normalized);
      setSavedSettings(normalized);
      if (normalized.avatarUrl) {
        setProfilePreview(resolveMediaUrl(normalized.avatarUrl));
      }
      setError(null);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load your settings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function requestClose() {
    if (isDirty && !window.confirm("You have unsaved changes. Close without saving?")) {
      return;
    }
    onDirtyChange?.(false);
    onClose?.();
  }

  function updateProfileField<K extends keyof ClientSettings>(
    key: K,
    value: ClientSettings[K],
  ) {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as keyof typeof next];
      return next;
    });
    setError(null);
  }

  function updateNotificationPreference(
    eventKey: ClientNotificationEventKey,
    channel: ClientNotificationChannel,
    enabled: boolean,
  ) {
    setSettings((current) =>
      current
        ? {
            ...current,
            notifications: {
              ...normalizeClientNotificationSettings(current.notifications),
              [eventKey]: {
                ...normalizeClientNotificationSettings(current.notifications)[eventKey],
                [channel]: enabled,
              },
            },
          }
        : current,
    );
    setError(null);
  }

  async function handleSaveProfile() {
    if (!settings) return;

    const errors = validateProfile(settings);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors)[0] ?? "Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      let avatarUrl = settings.avatarUrl;
      if (profileFile) {
        avatarUrl = await uploadAvatarToCloudinary(profileFile, "client");
      }

      const updated = await clientApi.settings.update({
        fullName: settings.fullName,
        phone: settings.phone,
        address: settings.address,
        interests: settings.interests,
        ...(avatarUrl ? { avatarUrl } : {}),
      });

      const normalized = {
        ...updated,
        notifications: normalizeClientNotificationSettings(updated.notifications),
      };
      setSettings(normalized);
      setSavedSettings(normalized);
      setProfileFile(null);
      if (updated.avatarUrl) {
        setProfilePreview(resolveMediaUrl(updated.avatarUrl));
      }
      await refreshUser();
      push({ variant: "success", title: copy.saved });
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveNotifications() {
    if (!settings) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await clientApi.settings.updateNotifications(
        normalizeClientNotificationSettings(settings.notifications),
      );
      const normalized = {
        ...updated,
        notifications: normalizeClientNotificationSettings(updated.notifications),
      };
      setSettings(normalized);
      setSavedSettings(normalized);
      push({ variant: "success", title: copy.saved });
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save notification preferences."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSecurity() {
    if (security.newPassword !== security.confirmPassword) {
      setError(CLIENT_SETTINGS_COPY.security.passwordMismatch);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await clientApi.settings.updateSecurity(security);
      setSecurity(EMPTY_SECURITY);
      push({ variant: "success", title: copy.passwordUpdated });
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to update your password."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!window.confirm(CLIENT_SETTINGS_COPY.account.deactivateConfirm)) {
      return;
    }

    setIsDeactivating(true);
    try {
      await clientApi.settings.deactivate();
      push({ variant: "success", title: CLIENT_SETTINGS_COPY.account.deactivated });
      onClose?.();
    } catch (deactivateError) {
      setError(getApiErrorMessage(deactivateError, "Unable to deactivate your account."));
    } finally {
      setIsDeactivating(false);
    }
  }

  const saveAction =
    activeTab === "profile"
      ? handleSaveProfile
      : activeTab === "notifications"
        ? handleSaveNotifications
        : handleSaveSecurity;

  const saveLabel =
    activeTab === "security"
      ? copy.updatePassword
      : activeTab === "notifications"
        ? copy.saveNotifications
        : copy.saveChanges;

  const canSaveSecurity =
    security.currentPassword.length > 0 &&
    security.newPassword.length >= 8 &&
    security.confirmPassword.length > 0 &&
    security.newPassword === security.confirmPassword;

  return (
    <div className="space-y-5">
      <nav className="-mx-1 flex gap-2 overflow-x-auto border-b border-border px-1 pb-4">
        {CLIENT_SETTINGS_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab];
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (
                  isDirty &&
                  tab !== activeTab &&
                  !window.confirm("You have unsaved changes. Switch tabs without saving?")
                ) {
                  return;
                }
                setActiveTab(tab);
                setError(null);
                setFieldErrors({});
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-charcoal text-white"
                  : "text-muted hover:bg-gray-100 hover:text-charcoal",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {copy.tabs[tab]}
            </button>
          );
        })}
      </nav>

      {loading ? (
        <CardSkeleton />
      ) : !settings ? (
        <p className="text-sm text-red-700">{error ?? "Unable to load settings."}</p>
      ) : (
        <>
          {activeTab === "profile" ? (
            <div className="space-y-2">
              <ClientProfileSettingsPanel
                values={settings}
                onChange={updateProfileField}
                profilePreview={profilePreview}
                onPhotoSelected={(file) => {
                  setProfileFile(file);
                  setProfilePreview(URL.createObjectURL(file));
                }}
              />
              {fieldErrors.fullName ? (
                <p className="text-xs text-red-600">{fieldErrors.fullName}</p>
              ) : null}
              {fieldErrors.phone ? (
                <p className="text-xs text-red-600">{fieldErrors.phone}</p>
              ) : null}
              {fieldErrors.address ? (
                <p className="text-xs text-red-600">{fieldErrors.address}</p>
              ) : null}
              {fieldErrors.interests ? (
                <p className="text-xs text-red-600">{fieldErrors.interests}</p>
              ) : null}
            </div>
          ) : null}

          {activeTab === "notifications" ? (
            <ClientNotificationSettingsPanel
              values={settings.notifications}
              onChange={updateNotificationPreference}
            />
          ) : null}

          {activeTab === "security" ? (
            <ClientSecuritySettingsPanel
              values={security}
              onChange={(key, value) => {
                setSecurity((current) => ({ ...current, [key]: value }));
                setError(null);
              }}
              onLogoutComplete={onClose}
              onDeactivate={() => void handleDeactivate()}
              isDeactivating={isDeactivating}
            />
          ) : null}
        </>
      )}

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="sticky bottom-0 -mx-1 flex justify-end gap-2 border-t border-border bg-white px-1 pt-4">
        <Button type="button" variant="outline" size="sm" onClick={requestClose}>
          {copy.cancel}
        </Button>
        {activeTab !== "security" || canSaveSecurity || security.currentPassword ? (
          <Button
            type="button"
            size="sm"
            disabled={
              isSaving ||
              loading ||
              !settings ||
              (activeTab === "security" && !canSaveSecurity)
            }
            onClick={() => void saveAction()}
          >
            {isSaving ? "Saving…" : saveLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
