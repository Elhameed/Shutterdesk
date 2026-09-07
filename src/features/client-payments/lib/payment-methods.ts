import type { StudioPaymentProfile } from "@/types/domains/payment";

export type ClientPaymentMethod = "mobile_money" | "bank_transfer";

export function getAvailablePaymentMethods(
  profile: StudioPaymentProfile,
): ClientPaymentMethod[] {
  const methods: ClientPaymentMethod[] = [];

  if (profile.mobileMoneyEnabled) {
    methods.push("mobile_money");
  }
  if (profile.bankTransferEnabled) {
    methods.push("bank_transfer");
  }

  return methods;
}

export function getDefaultPaymentMethod(
  methods: ClientPaymentMethod[],
): ClientPaymentMethod | null {
  return methods[0] ?? null;
}
