import { describe, expect, it } from "vitest";
import { parseStudioPaymentProfile } from "../src/modules/payments/payments.mapper.js";

describe("parseStudioPaymentProfile", () => {
  it("does not default mobile money to enabled", () => {
    const profile = parseStudioPaymentProfile({
      bankTransferEnabled: true,
      accountName: "Imani Uwase Photography Ltd",
      accountNumber: "1001234567",
    });

    expect(profile.mobileMoneyEnabled).toBe(false);
    expect(profile.bankTransferEnabled).toBe(true);
  });

  it("returns enabled methods from stored profile", () => {
    const profile = parseStudioPaymentProfile({
      mobileMoneyEnabled: true,
      momoAccountName: "Golden Hour Studio",
      momoNumber: "+250 788 100 101",
      bankTransferEnabled: false,
    });

    expect(profile.mobileMoneyEnabled).toBe(true);
    expect(profile.momoAccountName).toBe("Golden Hour Studio");
  });
});
