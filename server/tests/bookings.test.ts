import { describe, expect, it } from "vitest";
import {
  addCrmClient,
  api,
  createPhotographerPackage,
  onboardPhotographer,
  prisma,
  registerUser,
  setRole,
  testBookingDate,
  uniqueEmail,
} from "./helpers.js";

describe("Bookings API", () => {
  it("uses package depositPercent for photographer-created bookings", async () => {
    const photographerEmail = uniqueEmail("photo.deposit");
    const clientEmail = uniqueEmail("client.deposit");

    const photographer = await registerUser({
      fullName: "Deposit Photographer",
      email: photographerEmail,
      phone: "+250 788 100 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(
      photographerSession.token,
      "Deposit Test Studio",
    );

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Deposit Test Package",
      price: 200_000,
      depositPercent: 40,
    });

    const crmClient = await addCrmClient(photographerSession.token, {
      name: "Deposit Client",
      email: clientEmail,
    });

    const bookingSlot = testBookingDate(14, "10:00 AM");
    const booking = await api()
      .post("/api/photographer/bookings")
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({
        clientId: crmClient.id,
        clientName: "Deposit Client",
        email: clientEmail,
        servicePackageId: pkg.id,
        packageName: "Deposit Test Package",
        packageDetail: "Integration test booking",
        date: bookingSlot.date,
        time: bookingSlot.time,
        packagePrice: 200_000,
      })
      .expect(201);

    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: { bookingId: booking.body.data.id, type: "deposit" },
    });

    expect(paymentRequest).not.toBeNull();
    expect(paymentRequest?.amount).toBe(80_000);
  });

  it("notifies the client when a photographer creates a booking for them", async () => {
    const photographerEmail = uniqueEmail("photo.create");
    const clientEmail = uniqueEmail("client.create");

    const photographer = await registerUser({
      fullName: "Create Photographer",
      email: photographerEmail,
      phone: "+250 788 100 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(
      photographerSession.token,
      "Create Booking Studio",
    );

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Create Test Package",
      price: 200_000,
      depositPercent: 40,
    });

    const client = await registerUser({
      fullName: "Create Client",
      email: clientEmail,
      phone: "+250 788 100 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 100 002",
        address: "Kigali, Rwanda",
        interests: ["Wedding"],
      })
      .expect(200);

    const crmClient = await addCrmClient(photographerSession.token, {
      name: "Create Client",
      email: clientEmail,
    });

    const bookingSlot = testBookingDate(16, "10:00 AM");
    const booking = await api()
      .post("/api/photographer/bookings")
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({
        clientId: crmClient.id,
        clientName: "Create Client",
        email: clientEmail,
        servicePackageId: pkg.id,
        packageName: "Create Test Package",
        packageDetail: "Integration test booking",
        date: bookingSlot.date,
        time: bookingSlot.time,
        packagePrice: 200_000,
      })
      .expect(201);

    const notifications = await api()
      .get("/api/client/notifications")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      notifications.body.data.some(
        (item: { title: string }) => item.title === "New booking from studio",
      ),
    ).toBe(true);

    const clientBookings = await api()
      .get("/api/client/bookings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      clientBookings.body.data.some(
        (item: { id: string }) => item.id === booking.body.data.id,
      ),
    ).toBe(true);
  });

  it("creates client marketplace bookings with deposit from package settings", async () => {
    const photographerEmail = uniqueEmail("photo.market");
    const clientEmail = uniqueEmail("client.market");

    const photographer = await registerUser({
      fullName: "Market Photographer",
      email: photographerEmail,
      phone: "+250 788 100 002",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    const studio = await onboardPhotographer(
      photographerSession.token,
      "Marketplace Studio",
    );

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Marketplace Package",
      price: 150_000,
      depositPercent: 30,
    });

    const client = await registerUser({
      fullName: "Market Client",
      email: clientEmail,
      phone: "+250 788 200 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 200 002",
        address: "Kigali, Rwanda",
        interests: ["Wedding"],
      })
      .expect(200);

    const services = await api()
      .get(`/api/client/studios/${studio.studio.slug}/services`)
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(services.body.data.length).toBeGreaterThan(0);

    const publicPackage = services.body.data.find(
      (item: { id: string }) => item.id === pkg.id,
    );
    expect(publicPackage).toBeDefined();

    const bookingSlot = testBookingDate(21, "02:00 PM");
    const booking = await api()
      .post("/api/client/bookings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        servicePackageId: pkg.id,
        date: bookingSlot.date,
        time: bookingSlot.time,
        locationNotes: "Kigali, Rwanda",
      })
      .expect(201);

    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: { bookingId: booking.body.data.id, type: "deposit" },
    });

    expect(paymentRequest?.amount).toBe(45_000);

    const clientBookings = await api()
      .get("/api/client/bookings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      clientBookings.body.data.some(
        (item: { id: string }) => item.id === booking.body.data.id,
      ),
    ).toBe(true);
  });

  it("notifies the client when a photographer cancels a pending booking", async () => {
    const photographerEmail = uniqueEmail("photo.cancel");
    const clientEmail = uniqueEmail("client.cancel");

    const photographer = await registerUser({
      fullName: "Cancel Photographer",
      email: photographerEmail,
      phone: "+250 788 400 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(photographerSession.token, "Cancel Test Studio");

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Cancel Package",
      price: 120_000,
      depositPercent: 30,
    });

    const client = await registerUser({
      fullName: "Cancel Client",
      email: clientEmail,
      phone: "+250 788 400 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 400 002",
        address: "Kigali, Rwanda",
        interests: ["Portrait"],
      })
      .expect(200);

    const bookingSlot = testBookingDate(35, "09:00 AM");
    const booking = await api()
      .post("/api/client/bookings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        servicePackageId: pkg.id,
        date: bookingSlot.date,
        time: bookingSlot.time,
        locationNotes: "Kigali, Rwanda",
      })
      .expect(201);

    await api()
      .patch(`/api/photographer/bookings/${booking.body.data.id}/status`)
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({ status: "cancelled" })
      .expect(200);

    const notifications = await api()
      .get("/api/client/notifications")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      notifications.body.data.some(
        (item: { title: string }) => item.title === "Booking cancelled",
      ),
    ).toBe(true);
  });
});
