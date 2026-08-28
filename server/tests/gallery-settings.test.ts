import { describe, expect, it } from "vitest";
import {
  mergeGallerySettings,
  readStoredGallerySettings,
  resolveDownloadEnabled,
  isGalleryExpired,
  isGalleryPinProtected,
  verifyGalleryAccessPin,
} from "../src/lib/gallery-settings.js";

describe("gallery settings", () => {
  const baseGallery = {
    settings: {
      visibility: "private",
      allowSharing: false,
      allowFavorites: true,
      allowDownloads: true,
      expirationDate: "2026-12-31",
      slug: "amahoro-wedding-abc12345",
    },
    status: "published" as const,
    workflowStatus: "delivered" as const,
    title: "Amahoro Wedding",
    id: "abc12345-6789-0000-0000-000000000001",
  };

  it("reads stored delivery preferences from gallery settings", () => {
    const settings = readStoredGallerySettings(baseGallery);

    expect(settings.visibility).toBe("private");
    expect(settings.allowDownloads).toBe(true);
    expect(settings.slug).toBe("amahoro-wedding-abc12345");
  });

  it("only enables downloads after delivery when allowDownloads is true", () => {
    const settings = readStoredGallerySettings(baseGallery);

    expect(resolveDownloadEnabled(baseGallery, settings)).toBe(true);
    expect(
      resolveDownloadEnabled(
        { workflowStatus: "ready" },
        { allowDownloads: true },
      ),
    ).toBe(false);
    expect(
      resolveDownloadEnabled(
        { workflowStatus: "delivered" },
        { allowDownloads: false },
      ),
    ).toBe(false);
  });

  it("merges updated settings without dropping existing values", () => {
    const merged = mergeGallerySettings(baseGallery, {
      socialSharing: true,
      allowDownloads: false,
      expirationDate: "2027-01-15",
    });

    expect(merged.allowSharing).toBe(true);
    expect(merged.allowDownloads).toBe(false);
    expect(merged.allowFavorites).toBe(true);
    expect(merged.expirationDate).toBe("2027-01-15");
  });

  it("detects PIN protection and verifies submitted PIN", () => {
    const gallery = {
      ...baseGallery,
      settings: {
        ...baseGallery.settings,
        visibility: "password",
        accessPin: "4821",
      },
      delivery: { accessPin: "4821" },
    };

    expect(isGalleryPinProtected(readStoredGallerySettings(gallery))).toBe(true);
    expect(verifyGalleryAccessPin(gallery, "4821")).toBe(true);
    expect(verifyGalleryAccessPin(gallery, "0000")).toBe(false);
  });

  it("blocks access when gallery expiration date has passed", () => {
    expect(isGalleryExpired({ expirationDate: "2020-01-01" })).toBe(true);
    expect(isGalleryExpired({ expirationDate: "2099-12-31" })).toBe(false);
  });
});
