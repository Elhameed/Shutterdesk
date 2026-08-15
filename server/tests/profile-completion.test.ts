import { describe, expect, it } from "vitest";
import { resolvePhotographerProfileCompletion } from "../src/lib/photographer-profile-completion.js";

const owner = {
  fullName: "Amara Mukamana",
  avatarUrl: null,
};

describe("resolvePhotographerProfileCompletion", () => {
  it("returns 0% when onboarding was skipped with defaults", () => {
    const result = resolvePhotographerProfileCompletion(
      {
        name: "Amara Mukamana Photography",
        avatarAssetKey: "app/user-avatar",
        profileSettings: { bio: "" },
        brandSettings: { specialization: "" },
        paymentProfile: {
          momoAccountName: "Amara Mukamana Photography",
          momoNumber: "",
          mobileMoneyEnabled: false,
        },
      },
      owner,
    );

    expect(result.percent).toBe(0);
    expect(result.items.filter((item) => !item.optional).every((item) => !item.completed)).toBe(
      true,
    );
  });

  it("reflects partial onboarding data saved to the studio", () => {
    const result = resolvePhotographerProfileCompletion(
      {
        name: "Golden Hour Studio Kigali",
        avatarAssetKey: "app/user-avatar",
        profileSettings: { bio: "" },
        brandSettings: { specialization: "Wedding" },
        paymentProfile: {
          momoAccountName: "",
          momoNumber: "",
        },
      },
      owner,
    );

    expect(result.percent).toBe(25);
    expect(result.items.find((item) => item.id === "studio-profile")?.completed).toBe(true);
  });

  it("counts bank transfer as a completed payment method", () => {
    const result = resolvePhotographerProfileCompletion(
      {
        name: "Golden Hour Studio Kigali",
        avatarAssetKey: "app/user-avatar",
        profileSettings: {
          bio: "Wedding photographer based in Kigali.",
        },
        brandSettings: { specialization: "Wedding" },
        paymentProfile: {
          bankTransferEnabled: true,
          accountName: "Golden Hour Studio",
          accountNumber: "1234567890",
          mobileMoneyEnabled: false,
          momoAccountName: "",
          momoNumber: "",
        },
      },
      owner,
    );

    expect(result.items.find((item) => item.id === "payment-methods")?.completed).toBe(true);
    expect(result.percent).toBe(75);
  });

  it("returns 100% when required profile sections are complete without optional QR", () => {
    const result = resolvePhotographerProfileCompletion(
      {
        name: "Golden Hour Studio Kigali",
        avatarAssetKey: "https://res.cloudinary.com/demo/avatar.jpg",
        profileSettings: {
          bio: "Wedding photographer based in Kigali.",
        },
        brandSettings: { specialization: "Wedding" },
        paymentProfile: {
          mobileMoneyEnabled: true,
          momoAccountName: "Golden Hour Studio",
          momoNumber: "+250 788 100 101",
        },
      },
      {
        fullName: "Amara Mukamana",
        avatarUrl: "https://res.cloudinary.com/demo/avatar.jpg",
      },
    );

    expect(result.percent).toBe(100);
    expect(
      result.items.filter((item) => !item.optional).every((item) => item.completed),
    ).toBe(true);
    expect(result.items.find((item) => item.id === "payment-qr")?.completed).toBe(false);
  });

  it("marks optional QR code complete without affecting required percent", () => {
    const withoutQr = resolvePhotographerProfileCompletion(
      {
        name: "Golden Hour Studio Kigali",
        avatarAssetKey: "https://res.cloudinary.com/demo/avatar.jpg",
        profileSettings: { bio: "Portrait specialist." },
        brandSettings: { specialization: "Portrait" },
        paymentProfile: {
          mobileMoneyEnabled: true,
          momoAccountName: "Golden Hour Studio",
          momoNumber: "+250 788 100 101",
        },
      },
      {
        fullName: "Amara Mukamana",
        avatarUrl: "https://res.cloudinary.com/demo/avatar.jpg",
      },
    );

    const withQr = resolvePhotographerProfileCompletion(
      {
        name: "Golden Hour Studio Kigali",
        avatarAssetKey: "https://res.cloudinary.com/demo/avatar.jpg",
        profileSettings: { bio: "Portrait specialist." },
        brandSettings: { specialization: "Portrait" },
        paymentProfile: {
          mobileMoneyEnabled: true,
          momoAccountName: "Golden Hour Studio",
          momoNumber: "+250 788 100 101",
          qrCodeAssetKey: "https://res.cloudinary.com/demo/qr.png",
        },
      },
      {
        fullName: "Amara Mukamana",
        avatarUrl: "https://res.cloudinary.com/demo/avatar.jpg",
      },
    );

    expect(withoutQr.percent).toBe(100);
    expect(withQr.percent).toBe(100);
    expect(withQr.items.find((item) => item.id === "payment-qr")?.completed).toBe(true);
  });
});
