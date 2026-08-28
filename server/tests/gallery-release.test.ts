import { describe, expect, it } from "vitest";
import {
  assertGalleryReleaseAllowed,
  canReleaseGallery,
} from "../src/lib/gallery-release.js";

describe("gallery release", () => {
  it("blocks release while a package balance remains", () => {
    expect(
      canReleaseGallery({
        packagePrice: 100_000,
        amountPaid: 50_000,
        paymentMeta: {},
      }),
    ).toBe(false);
  });

  it("allows release when the package is fully paid", () => {
    expect(
      canReleaseGallery({
        packagePrice: 100_000,
        amountPaid: 100_000,
        paymentMeta: {},
      }),
    ).toBe(true);
  });

  it("allows release when the photographer enabled an override", () => {
    expect(
      canReleaseGallery({
        packagePrice: 100_000,
        amountPaid: 50_000,
        paymentMeta: { galleryReleaseOverride: true },
      }),
    ).toBe(true);
  });

  it("throws when release is blocked", () => {
    expect(() =>
      assertGalleryReleaseAllowed({
        packagePrice: 100_000,
        amountPaid: 25_000,
        paymentMeta: {},
      }),
    ).toThrow(/remaining balance/i);
  });
});
