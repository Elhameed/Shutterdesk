import { apiClient } from "@/lib/api-client";
import {
  mapApiClientPaymentRecord,
  mapApiPaymentVerification,
} from "@/services/payment-mapper";
import { mapApiPaymentRequest } from "@/services/photographer/booking-mapper";
import type { PaymentRequest } from "@/types/domains/booking";
import type {
  ApiClientPaymentRecord,
  ApiPaymentVerification,
  ClientPaymentRecord,
  StudioPaymentProfile,
} from "@/types/domains/payment";
import type {
  ClientOutstandingSummary,
  UploadReceiptInput,
} from "@/services/client/types";

type ListRecordsResponse = { data: ApiClientPaymentRecord[] };
type VerificationResponse = { data: ApiPaymentVerification };
type PaymentRequestsResponse = { data: PaymentRequest[] };
type SummaryResponse = {
  data: {
    totalBalance: number;
    unpaidCount: number;
    obligations: PaymentRequest[];
  };
};
type ProfileResponse = { data: StudioPaymentProfile };

export const clientPaymentsHttp = {
  async list(): Promise<ClientPaymentRecord[]> {
    const { data } = await apiClient.get<ListRecordsResponse>("/client/payments");
    return data.data.map(mapApiClientPaymentRecord);
  },

  async listRequests(): Promise<PaymentRequest[]> {
    const { data } = await apiClient.get<PaymentRequestsResponse>(
      "/client/payments/requests",
    );
    return data.data.map(mapApiPaymentRequest);
  },

  async getRequestById(id: string): Promise<PaymentRequest | undefined> {
    try {
      const { data } = await apiClient.get<{ data: PaymentRequest }>(
        `/client/payments/requests/${id}`,
      );
      return mapApiPaymentRequest(data.data);
    } catch {
      return undefined;
    }
  },

  async getOutstandingSummary(): Promise<ClientOutstandingSummary> {
    const { data } = await apiClient.get<SummaryResponse>("/client/payments/summary");
    return {
      ...data.data,
      obligations: data.data.obligations.map(mapApiPaymentRequest),
    };
  },

  async uploadReceipt(input: UploadReceiptInput) {
    const { data } = await apiClient.post<VerificationResponse>(
      "/client/payments/receipts",
      input,
    );
    return mapApiPaymentVerification(data.data);
  },

  async getStudioPaymentProfile(slug: string): Promise<StudioPaymentProfile> {
    const { data } = await apiClient.get<ProfileResponse>(
      `/client/payments/studios/${slug}/profile`,
    );
    return data.data;
  },
};
