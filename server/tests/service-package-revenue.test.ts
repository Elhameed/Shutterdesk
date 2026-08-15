import { describe, expect, it } from "vitest";
import { aggregateServicePackageRevenue } from "../src/lib/service-package-revenue.js";

describe("aggregateServicePackageRevenue", () => {
  it("sums amountPaid per service package for non-cancelled bookings", () => {
    const revenue = aggregateServicePackageRevenue([
      {
        servicePackageId: "pkg-1",
        amountPaid: 150_000,
        status: "confirmed",
      },
      {
        servicePackageId: "pkg-1",
        amountPaid: 300_000,
        status: "completed",
      },
      {
        servicePackageId: "pkg-2",
        amountPaid: 65_000,
        status: "pending",
      },
      {
        servicePackageId: "pkg-1",
        amountPaid: 50_000,
        status: "cancelled",
      },
      {
        servicePackageId: null,
        amountPaid: 100_000,
        status: "confirmed",
      },
    ]);

    expect(revenue.get("pkg-1")).toBe(450_000);
    expect(revenue.get("pkg-2")).toBe(65_000);
  });
});
