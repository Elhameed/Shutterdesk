import { beforeAll, describe, expect, it } from "vitest";
import {
  authed,
  createPhotographerPackage,
  prisma,
  setUpLinkedClient,
  setUpStudio,
  testBookingDate,
  uniqueEmail,
} from "./helpers.js";

/**
 * Several columns are stored counters that nothing maintains — reads recompute
 * them instead. That is fine on its own, but only some read paths pass the
 * computed value, so the same number differs depending on which endpoint you
 * ask. These tests assert the two paths agree.
 */

let photographer: Awaited<ReturnType<typeof setUpStudio>>;

beforeAll(async () => {
  photographer = await setUpStudio("counters");
});

describe("client metrics", () => {
  it("reports the same numbers on create as on list and detail", async () => {
    const email = uniqueEmail("counters.client");

    const created = await authed(photographer.token)
      .post("/api/photographer/clients")
      .send({
        name: "Counter Client",
        email,
        phone: "+250 788 700 001",
        category: "wedding",
      })
      .expect(201);

    const id = created.body.data.id as string;

    const list = await authed(photographer.token)
      .get("/api/photographer/clients")
      .expect(200);
    const listed = (list.body.data as Array<{ id: string }>).find(
      (item) => item.id === id,
    );

    const detail = await authed(photographer.token)
      .get(`/api/photographer/clients/${id}`)
      .expect(200);

    for (const field of ["sessions", "revenue", "balance", "lastBooking"] as const) {
      expect(created.body.data[field]).toEqual(listed?.[field as keyof typeof listed]);
      expect(created.body.data[field]).toEqual(detail.body.data[field]);
    }
  });

  it("reflects a booking's revenue consistently across endpoints", async () => {
    const client = await setUpLinkedClient(photographer.token, "counters.booked");
    const pkg = await createPhotographerPackage(photographer.token, {
      title: "Counter Package",
      price: 400_000,
    });

    const slot = testBookingDate(18, "01:00 PM");
    await authed(photographer.token)
      .post("/api/photographer/bookings")
      .send({
        clientId: client.crmClientId,
        clientName: "Counter Booked",
        email: client.email,
        servicePackageId: pkg.id,
        packageName: "Counter Package",
        packageDetail: "Counter coverage",
        date: slot.date,
        time: slot.time,
        packagePrice: 400_000,
      })
      .expect(201);

    const list = await authed(photographer.token)
      .get("/api/photographer/clients")
      .expect(200);
    const listed = (list.body.data as Array<{ id: string; sessions: number }>).find(
      (item) => item.id === client.crmClientId,
    );

    const detail = await authed(photographer.token)
      .get(`/api/photographer/clients/${client.crmClientId}`)
      .expect(200);

    expect(listed?.sessions).toBe(1);
    expect(detail.body.data.sessions).toBe(1);
  });
});

describe("service package revenue", () => {
  it("does not appear to drop to zero when the package is renamed", async () => {
    const client = await setUpLinkedClient(photographer.token, "counters.revenue");
    const pkg = await createPhotographerPackage(photographer.token, {
      title: "Revenue Package",
      price: 500_000,
    });

    const slot = testBookingDate(27, "11:00 AM");
    const booking = await authed(photographer.token)
      .post("/api/photographer/bookings")
      .send({
        clientId: client.crmClientId,
        clientName: "Revenue Client",
        email: client.email,
        servicePackageId: pkg.id,
        packageName: "Revenue Package",
        packageDetail: "Revenue coverage",
        date: slot.date,
        time: slot.time,
        packagePrice: 500_000,
      })
      .expect(201);

    // Package revenue is the sum of amountPaid across its bookings. Setting it
    // directly is far shorter than driving the whole receipt-and-approval flow,
    // and this test is about the read paths, not the payment flow.
    await prisma.booking.update({
      where: { id: booking.body.data.id },
      data: { amountPaid: 250_000, paymentStatus: "partial" },
    });

    const list = await authed(photographer.token)
      .get("/api/photographer/services")
      .expect(200);
    const listed = (list.body.data as Array<{ id: string; totalRevenue: number }>).find(
      (item) => item.id === pkg.id,
    );
    expect(listed?.totalRevenue).toBe(250_000);

    const updated = await authed(photographer.token)
      .patch(`/api/photographer/services/${pkg.id}`)
      .send({ title: "Revenue Package Renamed" })
      .expect(200);

    // The stored totalRevenue column is never written, so the update response
    // used to fall back to it and report 0 — making a rename look like the
    // package had lost all its revenue.
    expect(updated.body.data.totalRevenue).toBe(250_000);
  });
});

describe("gallery photo counters", () => {
  it("keeps a manually chosen cover when a photo is deleted", async () => {
    const client = await setUpLinkedClient(photographer.token, "counters.gallery");

    const gallery = await authed(photographer.token)
      .post("/api/photographer/galleries")
      .send({
        title: "Cover gallery",
        category: "wedding",
        clientId: client.crmClientId,
        coverAssetKey: "galleries/deliberate-cover",
      })
      .expect(201);

    const photos = await authed(photographer.token)
      .post(`/api/photographer/galleries/${gallery.body.data.id}/photos`)
      .send({
        photos: [
          { assetKey: "galleries/counter-0" },
          { assetKey: "galleries/counter-1" },
        ],
      })
      .expect(201);

    const firstPhotoId = photos.body.data.photos[0].id as string;

    await authed(photographer.token)
      .delete(
        `/api/photographer/galleries/${gallery.body.data.id}/photos/${firstPhotoId}`,
      )
      .expect(200);

    const detail = await authed(photographer.token)
      .get(`/api/photographer/galleries/${gallery.body.data.id}`)
      .expect(200);

    // Upload preserves the chosen cover; delete used to recompute it from the
    // first remaining photo, silently discarding the photographer's choice.
    expect(detail.body.data.gallery.coverAssetKey).toBe("galleries/deliberate-cover");
    expect(detail.body.data.gallery.photoCount).toBe(1);
  });
});

describe("studio rename propagation", () => {
  it("updates the studio name copied onto payment history", async () => {
    const studio = await setUpStudio("counters.rename");
    const client = await setUpLinkedClient(studio.token, "counters.rename");

    const slot = testBookingDate(33, "10:00 AM");
    const booking = await authed(studio.token)
      .post("/api/photographer/bookings")
      .send({
        clientId: client.crmClientId,
        clientName: "Rename Client",
        email: client.email,
        packageName: "Rename Package",
        packageDetail: "Rename coverage",
        date: slot.date,
        time: slot.time,
        packagePrice: 200_000,
      })
      .expect(201);

    // PaymentRecord copies the studio name at the time it is written.
    await prisma.paymentRecord.create({
      data: {
        clientEmail: client.email,
        bookingId: booking.body.data.id,
        studioId: studio.studio.id,
        studioName: studio.studio.name ?? "Studio counters.rename",
        bookingTitle: "Rename Package",
        amount: 100_000,
        paidAt: new Date(),
        status: "approved",
        receiptAssetKey: "receipts/rename",
      },
    });

    await authed(studio.token)
      .patch("/api/photographer/settings/studio")
      .send({ studioName: "Renamed Via Settings" })
      .expect(200);

    const afterSettings = await prisma.paymentRecord.findFirst({
      where: { bookingId: booking.body.data.id },
    });
    expect(afterSettings?.studioName).toBe("Renamed Via Settings");

    // Completing onboarding against an existing studio also renames it, and
    // that path had no sync at all.
    await authed(studio.token)
      .post("/api/photographer/onboarding/complete")
      .send({
        businessName: "Renamed Via Onboarding",
        specialization: "Wedding",
        bio: "Rename coverage",
        momoAccountName: "Renamed Via Onboarding",
        momoNumber: "+250 788 111 222",
      })
      .expect(201);

    const afterOnboarding = await prisma.paymentRecord.findFirst({
      where: { bookingId: booking.body.data.id },
    });
    expect(afterOnboarding?.studioName).toBe("Renamed Via Onboarding");
  });
});
