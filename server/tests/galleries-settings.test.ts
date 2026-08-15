import { describe, expect, it } from "vitest";
import {
  api,
  onboardPhotographer,
  registerUser,
  setRole,
  uniqueEmail,
} from "./helpers.js";

describe("Galleries API", () => {
  it("lists photographer galleries after onboarding", async () => {
    const email = uniqueEmail("galleries.list");
    const registered = await registerUser({
      fullName: "Gallery Owner",
      email,
      phone: "+250 788 000 020",
    });
    const withRole = await setRole(registered.token, "photographer");
    await onboardPhotographer(withRole.token, "Gallery Test Studio");

    const response = await api()
      .get("/api/photographer/galleries")
      .set("Authorization", `Bearer ${withRole.token}`)
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe("Settings API", () => {
  it("loads and updates photographer profile settings", async () => {
    const email = uniqueEmail("settings.profile");
    const registered = await registerUser({
      fullName: "Settings Owner",
      email,
      phone: "+250 788 000 021",
    });
    const withRole = await setRole(registered.token, "photographer");
    await onboardPhotographer(withRole.token, "Settings Test Studio");

    const current = await api()
      .get("/api/photographer/settings/profile")
      .set("Authorization", `Bearer ${withRole.token}`)
      .expect(200);

    expect(current.body.data).toBeTruthy();

    const updated = await api()
      .patch("/api/photographer/settings/profile")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({
        ...current.body.data,
        bio: "Updated studio bio for tests",
      })
      .expect(200);

    expect(updated.body.data.bio).toBe("Updated studio bio for tests");
  });

  it("loads and updates client profile settings including full name", async () => {
    const email = uniqueEmail("settings.client");
    const registered = await registerUser({
      fullName: "Client Settings User",
      email,
      phone: "+250 788 000 022",
    });
    const withRole = await setRole(registered.token, "client");

    const current = await api()
      .get("/api/client/settings")
      .set("Authorization", `Bearer ${withRole.token}`)
      .expect(200);

    expect(current.body.data.fullName).toBe("Client Settings User");
    expect(current.body.data.email).toBe(email);
    expect(current.body.data.notifications).toBeTruthy();

    const updated = await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({
        fullName: "Imani Uwase",
        phone: "+250 788 111 333",
        address: "Kigali, Rwanda",
        interests: ["Portrait", "Wedding"],
      })
      .expect(200);

    expect(updated.body.data.fullName).toBe("Imani Uwase");
    expect(updated.body.data.phone).toBe("+250 788 111 333");
  });

  it("accepts partial client profile PATCH after initial profile is saved", async () => {
    const email = uniqueEmail("settings.client.partial");
    const registered = await registerUser({
      fullName: "Partial Client",
      email,
      phone: "+250 788 000 023",
    });
    const withRole = await setRole(registered.token, "client");

    await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({
        fullName: "Partial Client",
        phone: "+250 788 000 023",
        address: "Kigali, Rwanda",
        interests: ["Portrait"],
      })
      .expect(200);

    const updated = await api()
      .patch("/api/client/settings")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({ phone: "+250 788 222 444" })
      .expect(200);

    expect(updated.body.data.phone).toBe("+250 788 222 444");
  });

  it("rejects photographer payment settings when MoMo is enabled without account details", async () => {
    const email = uniqueEmail("settings.payment");
    const registered = await registerUser({
      fullName: "Payment Settings Owner",
      email,
      phone: "+250 788 000 024",
    });
    const withRole = await setRole(registered.token, "photographer");
    await onboardPhotographer(withRole.token, "Payment Settings Studio");

    const response = await api()
      .patch("/api/photographer/settings/payment")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({
        mobileMoneyEnabled: true,
        bankTransferEnabled: false,
        momoAccountName: "",
        momoNumber: "",
      })
      .expect(400);

    expect(response.body.message).toContain("Mobile Money");
  });

  it("round-trips photographer gallery defaults", async () => {
    const email = uniqueEmail("settings.gallery");
    const registered = await registerUser({
      fullName: "Gallery Settings Owner",
      email,
      phone: "+250 788 000 025",
    });
    const withRole = await setRole(registered.token, "photographer");
    await onboardPhotographer(withRole.token, "Gallery Defaults Studio");

    const updated = await api()
      .patch("/api/photographer/settings/gallery")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({
        allowDownloads: false,
        passwordProtection: true,
        watermarkGridView: false,
      })
      .expect(200);

    expect(updated.body.data.allowDownloads).toBe(false);
    expect(updated.body.data.passwordProtection).toBe(true);
    expect(updated.body.data.watermarkGridView).toBe(false);

    const reloaded = await api()
      .get("/api/photographer/settings/gallery")
      .set("Authorization", `Bearer ${withRole.token}`)
      .expect(200);

    expect(reloaded.body.data).toEqual(updated.body.data);
  });

  it("loads and updates booking preferences", async () => {
    const email = uniqueEmail("settings.booking");
    const registered = await registerUser({
      fullName: "Booking Settings Owner",
      email,
      phone: "+250 788 000 026",
    });
    const withRole = await setRole(registered.token, "photographer");
    await onboardPhotographer(withRole.token, "Booking Prefs Studio");

    const current = await api()
      .get("/api/photographer/settings/booking")
      .set("Authorization", `Bearer ${withRole.token}`)
      .expect(200);

    expect(current.body.data.maxDaysAhead).toBeGreaterThan(0);

    const updated = await api()
      .patch("/api/photographer/settings/booking")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({
        maxDaysAhead: 90,
        cancellationPolicy: "48-hour cancellation policy applies.",
      })
      .expect(200);

    expect(updated.body.data.maxDaysAhead).toBe(90);
    expect(updated.body.data.cancellationPolicy).toBe(
      "48-hour cancellation policy applies.",
    );
  });
});
