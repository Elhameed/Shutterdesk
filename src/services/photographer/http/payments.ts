import { apiClient } from "@/lib/api-client";
import { mapApiPaymentVerification } from "@/services/payment-mapper";
import type {
  ApiPaymentVerification,
  PaymentVerification,
  VerificationStatus,
} from "@/types/domains/payment";

type ListResponse = { data: ApiPaymentVerification[] };
type ItemResponse = { data: ApiPaymentVerification };

export const photographerPaymentsHttp = {
  async list(): Promise<PaymentVerification[]> {
    const { data } = await apiClient.get<ListResponse>(
      "/photographer/payments/verifications",
    );
    return data.data.map(mapApiPaymentVerification);
  },

  async updateStatus(
    id: string,
    status: VerificationStatus,
  ): Promise<PaymentVerification | undefined> {
    try {
      const { data } = await apiClient.patch<ItemResponse>(
        `/photographer/payments/verifications/${id}`,
        { status },
      );
      return mapApiPaymentVerification(data.data);
    } catch {
      return undefined;
    }
  },

  async requestResubmission(id: string): Promise<PaymentVerification | undefined> {
    try {
      const { data } = await apiClient.post<ItemResponse>(
        `/photographer/payments/verifications/${id}/request-resubmission`,
      );
      return mapApiPaymentVerification(data.data);
    } catch {
      return undefined;
    }
  },
};
