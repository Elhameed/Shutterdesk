import { beforeAll, describe, expect, it } from "vitest";
import {
  TEST_PASSWORD,
  authed,
  setUpLinkedClient,
  setUpStudio,
} from "./helpers.js";

/**
 * The settings panels that had no coverage (studio, notifications, security,
 * billing) plus the client payment read routes and the client onboarding skip.
 */

let photographer: Awaited<ReturnType<typeof setUpStudio>>;
let client: Awaited<ReturnType<typeof setUpLinkedClient>>;

beforeAll(async () => {
  photographer = await setUpStudio("settings");
  client = await setUpLinkedClient(photographer.token, "settings");
});

describe("photographer settings panels", () => {
  it.each(["profile", "studio", "payment", "notifications", "gallery", "booking", "security", "billing"])(
    "reads the %s panel",
    async (panel) => {
      const response = await authed(photographer.token)
        .get(`/api/photographer/settings/${panel}`)
        .expect(200);

      expect(response.body.data).toBeTruthy();
    },
  );

  it("rejects an unknown panel", async () => {
    await authed(photographer.token)
      .get("/api/photographer/settings/nonsense")
      .expect(400);
  });

  it("renames the studio through the studio panel", async () => {
    await authed(photographer.token)
      .patch("/api/photographer/settings/studio")
      .send({ studioName: "Renamed Studio", specialization: "Portrait" })
      .expect(200);

    const response = await authed(photographer.token)
      .get("/api/photographer/settings/studio")
      .expect(200);

    expect(response.body.data.studioName).toBe("Renamed Studio");
  });

  it("rejects an unknown key on a strict panel schema", async () => {
    await authed(photographer.token)
      .patch("/api/photographer/settings/studio")
      .send({ studioName: "Fine", somethingElse: true })
      .expect(400);
  });

  it("updates notification preferences", async () => {
    // The photographer panel keys differ from the client's — newBooking here,
    // bookingUpdates there.
    const response = await authed(photographer.token)
      .patch("/api/photographer/settings/notifications")
      .send({ newBooking: { email: false } })
      .expect(200);

    expect(response.body.data).toBeTruthy();
  });
});

describe("client settings", () => {
  it("updates notification preferences", async () => {
    const response = await authed(client.token)
      .patch("/api/client/settings/notifications")
      .send({ bookingUpdates: { email: false, sms: true } })
      .expect(200);

    expect(response.body.data).toBeTruthy();
  });

  it("changes the password and invalidates the old token", async () => {
    const target = await setUpLinkedClient(photographer.token, "settings.password");

    await authed(target.token)
      .patch("/api/client/settings/security")
      .send({
        currentPassword: TEST_PASSWORD,
        newPassword: "NewTestPass456!",
        confirmPassword: "NewTestPass456!",
      })
      .expect(200);

    // Changing the password bumps tokenVersion, so the old token must stop working.
    await authed(target.token).get("/api/client/settings").expect(401);
  });

  it("rejects a password change with the wrong current password", async () => {
    const target = await setUpLinkedClient(photographer.token, "settings.badpass");

    await authed(target.token)
      .patch("/api/client/settings/security")
      .send({
        currentPassword: "NotThePassword1!",
        newPassword: "NewTestPass456!",
        confirmPassword: "NewTestPass456!",
      })
      .expect(400);
  });
});

describe("client payment reads", () => {
  it("returns history, requests, summary and outstanding", async () => {
    const history = await authed(client.token).get("/api/client/payments").expect(200);
    expect(Array.isArray(history.body.data)).toBe(true);

    const requests = await authed(client.token)
      .get("/api/client/payments/requests")
      .expect(200);
    expect(Array.isArray(requests.body.data)).toBe(true);

    await authed(client.token).get("/api/client/payments/summary").expect(200);
    await authed(client.token).get("/api/client/payments/outstanding").expect(200);
  });

  it("returns a studio payment profile", async () => {
    const response = await authed(client.token)
      .get(`/api/client/payments/studios/${photographer.studio.slug}/profile`)
      .expect(200);

    expect(response.body.data).toBeTruthy();
  });

  it("404s an unknown payment request", async () => {
    await authed(client.token)
      .get("/api/client/payments/requests/11111111-1111-1111-1111-111111111111")
      .expect(404);
  });
});

describe("client onboarding", () => {
  it("can be skipped", async () => {
    const target = await setUpLinkedClient(photographer.token, "settings.skip");

    await authed(target.token).post("/api/client/onboarding/skip").expect(200);
  });
});
