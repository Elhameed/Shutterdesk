import { describe, expect, it } from "vitest";
import {
  BOOKING_PROGRESS_STEP,
  GALLERY_PROGRESS_STEP,
  mergeBookingProgress,
  resolveProgressFromGallery,
} from "../src/lib/booking-progress.js";

describe("booking progress sync", () => {
  it("advances to gallery delivered when linked gallery is delivered", () => {
    const resolved = resolveProgressFromGallery({
      workflowStatus: "delivered",
      photoCount: 24,
    });

    expect(resolved).toEqual({
      progressStep: BOOKING_PROGRESS_STEP.GALLERY_DELIVERED,
      galleryStep: GALLERY_PROGRESS_STEP.DELIVERED,
    });
  });

  it("merges stored booking progress with live gallery state", () => {
    const merged = mergeBookingProgress(
      { progressStep: 4, galleryStep: 1 },
      { workflowStatus: "delivered", photoCount: 12 },
    );

    expect(merged).toEqual({
      progressStep: BOOKING_PROGRESS_STEP.GALLERY_DELIVERED,
      galleryStep: GALLERY_PROGRESS_STEP.DELIVERED,
    });
  });

  it("marks gallery ready without forcing delivery", () => {
    const merged = mergeBookingProgress(
      { progressStep: 4, galleryStep: 1 },
      { workflowStatus: "ready", photoCount: 8 },
    );

    expect(merged).toEqual({
      progressStep: BOOKING_PROGRESS_STEP.GALLERY_UPLOADED,
      galleryStep: GALLERY_PROGRESS_STEP.READY,
    });
  });
});
