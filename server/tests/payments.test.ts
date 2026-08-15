import { describe, expect, it } from "vitest";
import {
  api,
  createPhotographerPackage,
  onboardPhotographer,
  prisma,
  registerUser,
  setRole,
  testBookingDate,
  uniqueEmail,
} from "./helpers.js";

describe("Payments API", () => {
  it("accepts receipt upload and exposes it in photographer verification queue", async () => {
    const photographerEmail = uniqueEmail("photo.pay");
    const clientEmail = uniqueEmail("client.pay");

    const photographer = await registerUser({
      fullName: "Pay Photographer",
      email: photographerEmail,
      phone: "+250 788 300 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(photographerSession.token, "Payment Test Studio");

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Payment Package",
      price: 100_000,
      depositPercent: 50,
    });

    const client = await registerUser({
      fullName: "Pay Client",
      email: clientEmail,
      phone: "+250 788 300 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 300 002",
        address: "Kigali, Rwanda",
        interests: ["Portrait"],
      })
      .expect(200);

    const bookingSlot = testBookingDate(30);
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

    const obligations = await api()
      .get("/api/client/payments/requests")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    const obligation = obligations.body.data.find(
      (item: { bookingId: string }) => item.bookingId === booking.body.data.id,
    );
    expect(obligation).toBeDefined();

    const receiptUrl = "https://example.com/shutterdesk-test-receipt.jpg";

    const verification = await api()
      .post("/api/client/payments/receipts")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        bookingId: booking.body.data.id,
        paymentRequestId: obligation.id,
        amount: obligation.amount,
        receiptImage: receiptUrl,
      })
      .expect(201);

    expect(verification.body.data.receiptAssetKey).toBe(receiptUrl);
    expect(verification.body.data.status).toBe("pending");

    const queue = await api()
      .get("/api/photographer/payments/verifications")
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .expect(200);

    const queued = queue.body.data.find(
      (item: { id: string }) => item.id === verification.body.data.id,
    );

    expect(queued).toBeDefined();
    expect(queued.receiptAssetKey).toBe(receiptUrl);

    const clientNotifications = await api()
      .get("/api/client/notifications")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      clientNotifications.body.data.some(
        (item: { title: string }) =>
          item.title === "Payment verification in progress",
      ),
    ).toBe(true);
  });

  it("auto-confirms booking when deposit payment is approved", async () => {
    const photographerEmail = uniqueEmail("photo.confirm");
    const clientEmail = uniqueEmail("client.confirm");

    const photographer = await registerUser({
      fullName: "Confirm Photographer",
      email: photographerEmail,
      phone: "+250 788 300 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(photographerSession.token, "Confirm Test Studio");

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Confirm Package",
      price: 100_000,
      depositPercent: 50,
    });

    const client = await registerUser({
      fullName: "Confirm Client",
      email: clientEmail,
      phone: "+250 788 300 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 300 002",
        address: "Kigali, Rwanda",
        interests: ["Portrait"],
      })
      .expect(200);

    const bookingSlot = testBookingDate(30);
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

    const obligations = await api()
      .get("/api/client/payments/requests")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    const obligation = obligations.body.data.find(
      (item: { bookingId: string }) => item.bookingId === booking.body.data.id,
    );

    const verification = await api()
      .post("/api/client/payments/receipts")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        bookingId: booking.body.data.id,
        paymentRequestId: obligation.id,
        amount: obligation.amount,
        receiptImage: "https://example.com/receipt.jpg",
      })
      .expect(201);

    await api()
      .patch(`/api/photographer/payments/verifications/${verification.body.data.id}`)
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({ status: "approved" })
      .expect(200);

    const detail = await api()
      .get(`/api/client/bookings/${booking.body.data.id}/detail`)
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(detail.body.data.lifecycleStage).toBe("session_scheduled");
    expect(detail.body.data.detailStatus).toBe("confirmed");

    const cancelAttempt = await api()
      .patch(`/api/photographer/bookings/${booking.body.data.id}/status`)
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({ status: "cancelled" });

    expect(cancelAttempt.status).toBe(409);

    const balanceAfterDeposit = await prisma.paymentRequest.findFirst({
      where: {
        bookingId: booking.body.data.id,
        type: "balance",
        status: "unpaid",
      },
    });
    expect(balanceAfterDeposit).toBeNull();

    await api()
      .patch(`/api/photographer/bookings/${booking.body.data.id}/status`)
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({ status: "completed" })
      .expect(200);

    const balanceRequest = await prisma.paymentRequest.findFirst({
      where: {
        bookingId: booking.body.data.id,
        type: "balance",
        status: "unpaid",
      },
    });

    expect(balanceRequest).not.toBeNull();
    expect(balanceRequest?.amount).toBe(50_000);

    const detailAfterSession = await api()
      .get(`/api/client/bookings/${booking.body.data.id}/detail`)
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(detailAfterSession.body.data.lifecycleStage).toBe("awaiting_balance");

    const notifications = await api()
      .get("/api/client/notifications")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      notifications.body.data.some(
        (item: { title: string }) => item.title === "Final balance due",
      ),
    ).toBe(true);

    const outstanding = await api()
      .get("/api/client/payments/outstanding")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(outstanding.body.data.totalBalance).toBe(50_000);

    const dashboard = await api()
      .get("/api/client/dashboard")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(dashboard.body.data.stats.pendingPayments).toBe(50_000);
    expect(
      dashboard.body.data.obligations.some(
        (item: { type: string }) => item.type === "balance",
      ),
    ).toBe(true);
  }, 90_000);

  it("supports paying the full amount upfront and leaves no outstanding balance", async () => {
    const photographerEmail = uniqueEmail("photo.full");
    const clientEmail = uniqueEmail("client.full");

    const photographer = await registerUser({
      fullName: "Full Photographer",
      email: photographerEmail,
      phone: "+250 788 300 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(photographerSession.token, "Full Payment Studio");

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Full Package",
      price: 100_000,
      depositPercent: 50,
    });

    const client = await registerUser({
      fullName: "Full Client",
      email: clientEmail,
      phone: "+250 788 300 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 300 002",
        address: "Kigali, Rwanda",
        interests: ["Portrait"],
      })
      .expect(200);

    const bookingSlot = testBookingDate(30);
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

    const obligations = await api()
      .get("/api/client/payments/requests")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    const obligation = obligations.body.data.find(
      (item: { bookingId: string }) => item.bookingId === booking.body.data.id,
    );

    // Deposit is 50k, but the full remaining should be the whole package price.
    expect(obligation.amount).toBe(50_000);
    expect(obligation.fullAmount).toBe(100_000);

    const verification = await api()
      .post("/api/client/payments/receipts")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        bookingId: booking.body.data.id,
        paymentRequestId: obligation.id,
        amount: obligation.fullAmount,
        receiptImage: "https://example.com/full-receipt.jpg",
        paymentOption: "full",
      })
      .expect(201);

    expect(verification.body.data.amount).toBe(100_000);

    await api()
      .patch(`/api/photographer/payments/verifications/${verification.body.data.id}`)
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({ status: "approved" })
      .expect(200);

    const detail = await api()
      .get(`/api/client/bookings/${booking.body.data.id}/detail`)
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(detail.body.data.detailStatus).toBe("confirmed");
    expect(detail.body.data.payment.statusLabel).toBe("Paid in Full");
    expect(detail.body.data.payment.amountPaid).toBe(100_000);
    expect(detail.body.data.payment.outstandingDue).toBe(0);

    // Completing the session must not create a leftover balance obligation.
    await api()
      .patch(`/api/photographer/bookings/${booking.body.data.id}/status`)
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({ status: "completed" })
      .expect(200);

    const balanceRequest = await prisma.paymentRequest.findFirst({
      where: {
        bookingId: booking.body.data.id,
        type: "balance",
        status: "unpaid",
      },
    });
    expect(balanceRequest).toBeNull();

    const outstanding = await api()
      .get("/api/client/payments/outstanding")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(outstanding.body.data.totalBalance).toBe(0);
  }, 90_000);

  it("notifies the client when a payment receipt is rejected", async () => {
    const photographerEmail = uniqueEmail("photo.reject");
    const clientEmail = uniqueEmail("client.reject");

    const photographer = await registerUser({
      fullName: "Reject Photographer",
      email: photographerEmail,
      phone: "+250 788 300 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(photographerSession.token, "Reject Test Studio");

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Reject Package",
      price: 100_000,
      depositPercent: 50,
    });

    const client = await registerUser({
      fullName: "Reject Client",
      email: clientEmail,
      phone: "+250 788 300 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 300 002",
        address: "Kigali, Rwanda",
        interests: ["Portrait"],
      })
      .expect(200);

    const bookingSlot = testBookingDate(30);
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

    const obligations = await api()
      .get("/api/client/payments/requests")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    const obligation = obligations.body.data.find(
      (item: { bookingId: string }) => item.bookingId === booking.body.data.id,
    );

    const verification = await api()
      .post("/api/client/payments/receipts")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        bookingId: booking.body.data.id,
        paymentRequestId: obligation.id,
        amount: obligation.amount,
        receiptImage: "https://example.com/receipt.jpg",
      })
      .expect(201);

    await api()
      .patch(`/api/photographer/payments/verifications/${verification.body.data.id}`)
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .send({ status: "rejected" })
      .expect(200);

    const notifications = await api()
      .get("/api/client/notifications")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      notifications.body.data.some(
        (item: { title: string }) => item.title === "Payment rejected",
      ),
    ).toBe(true);
  });

  it("requests a compliant receipt resubmission and notifies the client", async () => {
    const photographerEmail = uniqueEmail("photo.resubmit");
    const clientEmail = uniqueEmail("client.resubmit");

    const photographer = await registerUser({
      fullName: "Resubmit Photographer",
      email: photographerEmail,
      phone: "+250 788 300 001",
    });
    const photographerSession = await setRole(photographer.token, "photographer");
    await onboardPhotographer(photographerSession.token, "Resubmit Test Studio");

    const pkg = await createPhotographerPackage(photographerSession.token, {
      title: "Resubmit Package",
      price: 100_000,
      depositPercent: 50,
    });

    const client = await registerUser({
      fullName: "Resubmit Client",
      email: clientEmail,
      phone: "+250 788 300 002",
    });
    const clientSession = await setRole(client.token, "client");
    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        phone: "+250 788 300 002",
        address: "Kigali, Rwanda",
        interests: ["Portrait"],
      })
      .expect(200);

    const bookingSlot = testBookingDate(30);
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

    const obligations = await api()
      .get("/api/client/payments/requests")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    const obligation = obligations.body.data.find(
      (item: { bookingId: string }) => item.bookingId === booking.body.data.id,
    );

    const verification = await api()
      .post("/api/client/payments/receipts")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .send({
        bookingId: booking.body.data.id,
        paymentRequestId: obligation.id,
        amount: obligation.amount,
        receiptImage: "https://example.com/receipt.jpg",
      })
      .expect(201);

    const response = await api()
      .post(
        `/api/photographer/payments/verifications/${verification.body.data.id}/request-resubmission`,
      )
      .set("Authorization", `Bearer ${photographerSession.token}`)
      .expect(200);

    expect(response.body.data.status).toBe("rejected");

    const detail = await api()
      .get(`/api/client/bookings/${booking.body.data.id}/detail`)
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(detail.body.data.payment.statusLabel).toBe("New receipt requested");

    const notifications = await api()
      .get("/api/client/notifications")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    expect(
      notifications.body.data.some(
        (item: { title: string }) => item.title === "New receipt required",
      ),
    ).toBe(true);

    const refreshedObligations = await api()
      .get("/api/client/payments/requests")
      .set("Authorization", `Bearer ${clientSession.token}`)
      .expect(200);

    const refreshedObligation = refreshedObligations.body.data.find(
      (item: { bookingId: string }) => item.bookingId === booking.body.data.id,
    );

    expect(refreshedObligation.status).toBe("unpaid");
  });
});
