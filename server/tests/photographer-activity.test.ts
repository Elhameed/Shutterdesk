import { describe, expect, it } from "vitest";
import {
  buildPhotographerActivityRecords,
  filterPhotographerActivities,
} from "../src/lib/photographer-activity.js";

describe("photographer activity", () => {
  it("builds chronological activity records across studio events", () => {
    const records = buildPhotographerActivityRecords({
      bookings: [
        {
          id: "booking-1",
          clientName: "Teniola Mukamana",
          packageName: "Golden Hour Portrait",
          status: "confirmed",
          createdAt: new Date("2026-06-18T10:00:00Z"),
          updatedAt: new Date("2026-06-18T10:00:00Z"),
        },
      ],
      verifications: [
        {
          id: "verification-1",
          bookingId: "booking-1",
          clientName: "Teniola Mukamana",
          bookingTitle: "Golden Hour Portrait",
          transactionId: "MOMO123456",
          status: "approved",
          submittedAt: new Date("2026-06-17T12:00:00Z"),
          verifiedAt: new Date("2026-06-17T14:00:00Z"),
          updatedAt: new Date("2026-06-17T14:00:00Z"),
        },
      ],
      galleries: [
        {
          id: "gallery-1",
          title: "Amahoro Wedding",
          clientName: "Patrick Niyonsaba",
          workflowStatus: "delivered",
          uploadedAt: new Date("2026-06-10T09:00:00Z"),
          updatedAt: new Date("2026-06-16T09:00:00Z"),
        },
      ],
      clients: [
        {
          id: "client-1",
          name: "Imani Uwase",
          createdAt: new Date("2026-06-01T09:00:00Z"),
        },
      ],
      services: [
        {
          id: "service-1",
          title: "Graduation Mini Session",
          createdAt: new Date("2026-05-20T09:00:00Z"),
          updatedAt: new Date("2026-06-02T09:00:00Z"),
        },
      ],
    });

    expect(records[0]?.id).toBe("booking-created-booking-1");
    expect(records.some((item) => item.type === "payment")).toBe(true);
    expect(records.some((item) => item.type === "gallery")).toBe(true);
  });

  it("filters activity by type and date range", () => {
    const records = buildPhotographerActivityRecords({
      bookings: [
        {
          id: "booking-1",
          clientName: "Teniola Mukamana",
          packageName: "Golden Hour Portrait",
          status: "confirmed",
          createdAt: new Date("2026-06-18T10:00:00Z"),
          updatedAt: new Date("2026-06-18T10:00:00Z"),
        },
      ],
      verifications: [],
      galleries: [],
      clients: [],
      services: [],
    });

    const filtered = filterPhotographerActivities(records, {
      type: "booking",
      since: new Date("2026-06-01T00:00:00Z"),
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.type).toBe("booking");
  });
});
