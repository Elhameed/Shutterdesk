import { beforeAll, describe, expect, it } from "vitest";
import {
  authed,
  createPhotographerPackage,
  setUpLinkedClient,
  setUpStudio,
  testBookingDate,
} from "./helpers.js";

/**
 * Covers the booking routes that had none: photographer list and detail,
 * reschedule, the gallery-release override, and the client-side upcoming and
 * gallery lookups.
 */

let photographer: Awaited<ReturnType<typeof setUpStudio>>;
let client: Awaited<ReturnType<typeof setUpLinkedClient>>;
let packageId: string;

beforeAll(async () => {
  photographer = await setUpStudio("bookings");
  client = await setUpLinkedClient(photographer.token, "bookings");
  const pkg = await createPhotographerPackage(photographer.token, {
    title: "Booking Routes Package",
    price: 300_000,
  });
  packageId = pkg.id;
});

let dayOffset = 10;
function nextSlot() {
  dayOffset += 3;
  return testBookingDate(dayOffset, "09:00 AM");
}

async function createBooking() {
  const slot = nextSlot();
  const response = await authed(photographer.token)
    .post("/api/photographer/bookings")
    .send({
      clientId: client.crmClientId,
      clientName: "Client bookings",
      email: client.email,
      servicePackageId: packageId,
      packageName: "Booking Routes Package",
      packageDetail: "Coverage booking",
      date: slot.date,
      time: slot.time,
      packagePrice: 300_000,
    })
    .expect(201);

  return response.body.data as { id: string };
}

describe("photographer booking routes", () => {
  it("lists bookings", async () => {
    const booking = await createBooking();

    const response = await authed(photographer.token)
      .get("/api/photographer/bookings")
      .expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toContain(booking.id);
  });

  it("paginates bookings when a page is requested", async () => {
    await createBooking();

    const response = await authed(photographer.token)
      .get("/api/photographer/bookings")
      .query({ page: 1, limit: 1 })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination).toMatchObject({ page: 1 });
  });

  it("returns a single booking and its detail payload", async () => {
    const booking = await createBooking();

    const summary = await authed(photographer.token)
      .get(`/api/photographer/bookings/${booking.id}`)
      .expect(200);
    expect(summary.body.data.id).toBe(booking.id);

    const detail = await authed(photographer.token)
      .get(`/api/photographer/bookings/${booking.id}/detail`)
      .expect(200);
    expect(detail.body.data.reference).toMatch(/^BK-\d+$/);
    expect(detail.body.data).toHaveProperty("lifecycleStage");
  });

  it("reschedules a booking", async () => {
    const booking = await createBooking();
    const slot = nextSlot();

    await authed(photographer.token)
      .patch(`/api/photographer/bookings/${booking.id}/reschedule`)
      .send({ date: slot.date, time: slot.time })
      .expect(200);

    const detail = await authed(photographer.token)
      .get(`/api/photographer/bookings/${booking.id}/detail`)
      .expect(200);
    expect(detail.body.data.event.date).toBe(slot.date);
  });

  it("rejects a reschedule with no date", async () => {
    const booking = await createBooking();

    await authed(photographer.token)
      .patch(`/api/photographer/bookings/${booking.id}/reschedule`)
      .send({ time: "10:00 AM" })
      .expect(400);
  });

  it("toggles the gallery release override", async () => {
    const booking = await createBooking();

    const enabled = await authed(photographer.token)
      .patch(`/api/photographer/bookings/${booking.id}/gallery-release-override`)
      .send({ enabled: true })
      .expect(200);
    expect(enabled.body.data.galleryReleaseOverride).toBe(true);

    const disabled = await authed(photographer.token)
      .patch(`/api/photographer/bookings/${booking.id}/gallery-release-override`)
      .send({ enabled: false })
      .expect(200);
    expect(disabled.body.data.galleryReleaseOverride).toBe(false);
  });

  it("404s on another studio's booking", async () => {
    const booking = await createBooking();
    const other = await setUpStudio("bookings.intruder");

    await authed(other.token)
      .get(`/api/photographer/bookings/${booking.id}`)
      .expect(404);

    await authed(other.token)
      .patch(`/api/photographer/bookings/${booking.id}/status`)
      .send({ status: "cancelled" })
      .expect(404);
  });
});

describe("client booking routes", () => {
  it("returns the upcoming booking", async () => {
    await createBooking();

    const response = await authed(client.token)
      .get("/api/client/bookings/upcoming")
      .expect(200);

    // Null is a legitimate answer when nothing is confirmed yet; the contract is
    // that the route resolves rather than erroring.
    expect(response.body).toHaveProperty("data");
  });

  it("returns a single client booking and its detail", async () => {
    const booking = await createBooking();

    const summary = await authed(client.token)
      .get(`/api/client/bookings/${booking.id}`)
      .expect(200);
    expect(summary.body.data.id).toBe(booking.id);

    const detail = await authed(client.token)
      .get(`/api/client/bookings/${booking.id}/detail`)
      .expect(200);
    expect(detail.body.data).toHaveProperty("payment");
  });

  it("reports the linked gallery id, null when there is none", async () => {
    const booking = await createBooking();

    const response = await authed(client.token)
      .get(`/api/client/bookings/${booking.id}/gallery`)
      .expect(200);

    expect(response.body.data).toEqual({ galleryId: null });
  });

  it("does not expose another client's booking", async () => {
    const booking = await createBooking();
    const other = await setUpLinkedClient(photographer.token, "bookings.other");

    await authed(other.token)
      .get(`/api/client/bookings/${booking.id}`)
      .expect(404);
  });

  it("lets a client book a package for themselves", async () => {
    const slot = nextSlot();

    const response = await authed(client.token)
      .post("/api/client/bookings")
      .send({
        servicePackageId: packageId,
        date: slot.date,
        time: slot.time,
        locationNotes: "Client-selected venue",
      })
      .expect(201);

    expect(response.body.data.id).toBeTruthy();
  });

  it("rejects a client booking with no package", async () => {
    const slot = nextSlot();

    await authed(client.token)
      .post("/api/client/bookings")
      .send({ date: slot.date, time: slot.time })
      .expect(400);
  });
});
