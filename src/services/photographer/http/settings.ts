import { apiClient } from "@/lib/api-client";
import type {
  BillingSettings,
  BookingSettings,
  GallerySettings,
  NotificationSettings,
  PaymentSettings,
  ProfileSettings,
  SecuritySettings,
  SettingsPanel,
  StudioSettings,
} from "@/types/domains/settings";

type PanelDataMap = {
  profile: ProfileSettings;
  studio: StudioSettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  gallery: GallerySettings;
  booking: BookingSettings;
  security: SecuritySettings;
  billing: BillingSettings;
};

type Response<T> = { data: T };

export const photographerSettingsHttp = {
  async getPanel<P extends SettingsPanel>(
    panel: P,
  ): Promise<PanelDataMap[P]> {
    const { data } = await apiClient.get<Response<PanelDataMap[P]>>(
      `/photographer/settings/${panel}`,
    );
    return data.data;
  },

  async updatePanel<P extends SettingsPanel>(
    panel: P,
    payload: Partial<PanelDataMap[P]>,
  ): Promise<PanelDataMap[P]> {
    const { data } = await apiClient.patch<Response<PanelDataMap[P]>>(
      `/photographer/settings/${panel}`,
      payload,
    );
    return data.data;
  },

  async deactivate(): Promise<void> {
    await apiClient.post("/photographer/settings/deactivate");
  },
};
