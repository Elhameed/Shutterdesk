import { beforeAll, describe, expect, it } from "vitest";
import {
  authed,
  createPhotographerPackage,
  setUpLinkedClient,
  setUpStudio,
} from "./helpers.js";

/**
 * Availability and calendar had no HTTP coverage at all, even though
 * `assertBookingSlotAvailable` sits on the critical path of every booking
 * create and reschedule.
 */

let photographer: Awaited<ReturnType<typeof setUpStudio>>;
let client: Awaited<ReturnType<typeof setUpLinkedClient>>;
let packageId: string;

/** A weekday inside the default 60-day booking horizon. */
function weekdayAhead(daysAhead: number) {
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + daysAhead);
  while (target.getDay() === 0 || target.getDay() === 6) {
    target.setDate(target.getDate() + 1);
  }

  return {
    iso: `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`,
    month: target.getMonth() + 1,
    year: target.getFullYear(),
    date: target,
  };
}

beforeAll(async () => {
  photographer = await setUpStudio("availability");
  client = await setUpLinkedClient(photographer.token, "availability");
  const pkg = await createPhotographerPackage(photographer.token, {
    title: "Availability Test Package",
    price: 150_000,
  });
  packageId = pkg.id;
});

describe("photographer availability", () => {
  it("returns a schedule, creating a default one on first read", async () => {
    const response = await authed(photographer.token)
      .get("/api/photographer/availability/schedule")
      .expect(200);

    expect(response.body.data.schedule).toMatchObject({
      slotIntervalMinutes: expect.any(Number),
      maxDaysAhead: expect.any(Number),
    });
    expect(Array.isArray(response.body.data.blocks)).toBe(true);
  });

  it("updates schedule settings", async () => {
    await authed(photographer.token)
      .patch("/api/photographer/availability/schedule")
      .send({ bufferMinutes: 30, maxSessionsPerDay: 5 })
      .expect(200);

    const response = await authed(photographer.token)
      .get("/api/photographer/availability/schedule")
      .expect(200);

    expect(response.body.data.schedule.bufferMinutes).toBe(30);
    expect(response.body.data.schedule.maxSessionsPerDay).toBe(5);
  });

  it("rejects schedule values outside the allowed range", async () => {
    await authed(photographer.token)
      .patch("/api/photographer/availability/schedule")
      .send({ slotIntervalMinutes: 5 })
      .expect(400);
  });

  it("creates and deletes an explicit block", async () => {
    const day = weekdayAhead(30);
    const startsAt = new Date(day.date);
    startsAt.setHours(9, 0, 0, 0);
    const endsAt = new Date(day.date);
    endsAt.setHours(12, 0, 0, 0);

    const created = await authed(photographer.token)
      .post("/api/photographer/availability/blocks")
      .send({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        reason: "Equipment servicing",
      })
      .expect(201);

    const blockId = created.body.data.id as string;
    expect(blockId).toBeTruthy();

    await authed(photographer.token)
      .delete(`/api/photographer/availability/blocks/${blockId}`)
      .expect(204);
  });

  it("blocks and unblocks a whole day", async () => {
    const day = weekdayAhead(37);

    await authed(photographer.token)
      .post("/api/photographer/availability/blocks/day")
      .send({ date: day.iso, reason: "Public holiday" })
      .expect(201);

    const withBlock = await authed(photographer.token)
      .get("/api/photographer/availability/schedule")
      .expect(200);
    expect(withBlock.body.data.blocks.length).toBeGreaterThan(0);

    // Note the asymmetry: POST /blocks/day takes the date in the body, DELETE
    // /blocks/day takes it as a query param.
    await authed(photographer.token)
      .delete("/api/photographer/availability/blocks/day")
      .query({ date: day.iso })
      .expect(204);
  });

  it("rejects a malformed day", async () => {
    await authed(photographer.token)
      .post("/api/photographer/availability/blocks/day")
      .send({ date: "next tuesday" })
      .expect(400);
  });
});

describe("client availability", () => {
  it("lists bookable dates for a studio package", async () => {
    const day = weekdayAhead(21);

    const response = await authed(client.token)
      .get("/api/client/availability/dates")
      .query({
        studioSlug: photographer.studio.slug,
        packageId,
        month: day.month,
        year: day.year,
      })
      .expect(200);

    expect(Array.isArray(response.body.data.availableDates)).toBe(true);
  });

  it("lists slots for a specific date", async () => {
    const day = weekdayAhead(21);

    const response = await authed(client.token)
      .get("/api/client/availability/slots")
      .query({
        studioSlug: photographer.studio.slug,
        packageId,
        date: day.iso,
      })
      .expect(200);

    expect(Array.isArray(response.body.data.slots)).toBe(true);
  });

  it("rejects a slots request with no date", async () => {
    await authed(client.token)
      .get("/api/client/availability/slots")
      .query({ studioSlug: photographer.studio.slug, packageId })
      .expect(400);
  });

  it("does not let a photographer call the client availability routes", async () => {
    await authed(photographer.token)
      .get("/api/client/availability/dates")
      .query({
        studioSlug: photographer.studio.slug,
        packageId,
        month: 1,
        year: 2027,
      })
      .expect(403);
  });
});

describe("photographer calendar", () => {
  it("returns a calendar for a month", async () => {
    const day = weekdayAhead(14);

    const response = await authed(photographer.token)
      .get("/api/photographer/calendar")
      .query({ month: day.month, year: day.year })
      .expect(200);

    expect(response.body.data).toBeTruthy();
  });

  it("rejects a calendar request with a bad month", async () => {
    await authed(photographer.token)
      .get("/api/photographer/calendar")
      .query({ month: 13, year: 2027 })
      .expect(400);
  });
});
