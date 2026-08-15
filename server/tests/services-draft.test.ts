import { describe, expect, it } from "vitest";
import {
  resolveServiceBadges,
  resolveServiceCoverAssetKey,
} from "../src/modules/services/services.service.js";

describe("service draft badges", () => {
  it("marks draft packages without public visibility", () => {
    expect(
      resolveServiceBadges(false, {
        isDraft: true,
      }),
    ).toEqual(["draft"]);
  });

  it("publishes active packages with public badge", () => {
    expect(
      resolveServiceBadges(true, {
        isDraft: false,
        requestedBadges: ["draft"],
      }),
    ).toEqual(["public"]);
  });

  it("marks archived packages without public visibility", () => {
    expect(
      resolveServiceBadges(false, {
        isArchived: true,
        isDraft: false,
      }),
    ).toEqual(["archived"]);
  });
});

describe("service draft cover images", () => {
  it("stores no cover asset for drafts without an upload", () => {
    expect(resolveServiceCoverAssetKey(undefined, { isDraft: true })).toBeNull();
  });

  it("keeps a category fallback for published packages without an upload", () => {
    expect(resolveServiceCoverAssetKey(undefined, { isDraft: false })).toBe(
      "landing/gallery/wedding/gallery-wedding-couple",
    );
  });
});
