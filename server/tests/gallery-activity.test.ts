import { describe, expect, it } from "vitest";
import { appendGalleryActivity, readGalleryActivities } from "../src/lib/gallery-activity.js";

describe("gallery activity", () => {
  it("appends studio activity entries with timestamps", () => {
    const next = appendGalleryActivity([], {
      type: "share",
      description: "Studio notified Immaculée Niyonsaba about gallery updates.",
    });

    expect(next).toHaveLength(1);
    expect(next[0]?.description).toContain("Studio notified");
    expect(next[0]?.timestamp).toBeTruthy();
  });

  it("keeps the most recent activities first", () => {
    const first = appendGalleryActivity([], {
      type: "view",
      description: "Client viewed gallery",
    });
    const second = appendGalleryActivity(first, {
      type: "download",
      description: "Client downloaded photos",
    });

    expect(readGalleryActivities(second)).toHaveLength(2);
    expect(second[0]?.type).toBe("download");
  });
});
