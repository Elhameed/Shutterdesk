import { beforeAll, describe, expect, it } from "vitest";
import {
  authed,
  createPhotographerPackage,
  setUpLinkedClient,
  setUpStudio,
  testBookingDate,
} from "./helpers.js";

/**
 * Notifications, dashboards, analytics and upload signing. Dashboard had one
 * covered route, the rest had none.
 */

let photographer: Awaited<ReturnType<typeof setUpStudio>>;
let client: Awaited<ReturnType<typeof setUpLinkedClient>>;

beforeAll(async () => {
  photographer = await setUpStudio("portal");
  client = await setUpLinkedClient(photographer.token, "portal");

  const pkg = await createPhotographerPackage(photographer.token, {
    title: "Portal Package",
    price: 250_000,
  });

  // A booking generates notifications for both sides, so the read routes below
  // have something to return.
  const slot = testBookingDate(24, "02:00 PM");
  await authed(photographer.token)
    .post("/api/photographer/bookings")
    .send({
      clientId: client.crmClientId,
      clientName: "Client portal",
      email: client.email,
      servicePackageId: pkg.id,
      packageName: "Portal Package",
      packageDetail: "Portal coverage booking",
      date: slot.date,
      time: slot.time,
      packagePrice: 250_000,
    })
    .expect(201);
});

describe.each([
  ["photographer", () => photographer.token, "/api/photographer/notifications"],
  ["client", () => client.token, "/api/client/notifications"],
])("%s notifications", (_role, token, base) => {
  it("lists notifications", async () => {
    const response = await authed(token()).get(base).expect(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("paginates when a page is requested", async () => {
    const response = await authed(token())
      .get(base)
      .query({ page: 1, limit: 1 })
      .expect(200);

    expect(response.body).toHaveProperty("pagination");
  });

  it("marks one notification read, then marks all read", async () => {
    const list = await authed(token()).get(base).expect(200);
    const first = (list.body.data as Array<{ id: string }>)[0];

    if (first) {
      await authed(token()).patch(`${base}/${first.id}/read`).expect(200);
    }

    await authed(token()).patch(`${base}/read-all`).expect(200);

    const after = await authed(token()).get(base).expect(200);
    const unread = (after.body.data as Array<{ read: boolean }>).filter(
      (item) => !item.read,
    );
    expect(unread).toHaveLength(0);
  });
});

describe("dashboards", () => {
  it("returns the photographer dashboard", async () => {
    const response = await authed(photographer.token)
      .get("/api/photographer/dashboard")
      .expect(200);

    expect(response.body.data).toHaveProperty("user");
  });

  it("returns the photographer activity feed", async () => {
    const response = await authed(photographer.token)
      .get("/api/photographer/dashboard/activity")
      .expect(200);

    expect(response.body).toHaveProperty("data");
  });

  it("returns the client dashboard", async () => {
    const response = await authed(client.token)
      .get("/api/client/dashboard")
      .expect(200);

    expect(response.body.data).toBeTruthy();
  });

  it("refuses cross-role dashboard access", async () => {
    await authed(client.token).get("/api/photographer/dashboard").expect(403);
    await authed(photographer.token).get("/api/client/dashboard").expect(403);
  });
});

describe("analytics", () => {
  it("returns photographer analytics", async () => {
    const response = await authed(photographer.token)
      .get("/api/photographer/analytics")
      .expect(200);

    expect(response.body.data).toBeTruthy();
  });

  it("is closed to clients", async () => {
    await authed(client.token).get("/api/photographer/analytics").expect(403);
  });
});

describe("upload signing", () => {
  it("rejects an upload context the role may not use", async () => {
    // Clients may sign receipts and avatars, never galleries. A known context
    // the role is not allowed to use is a 403; an unknown one is a 400 from the
    // schema.
    await authed(client.token)
      .post("/api/client/uploads/sign")
      .send({ context: "galleries" })
      .expect(403);

    await authed(photographer.token)
      .post("/api/photographer/uploads/sign")
      .send({ context: "receipts" })
      .expect(403);
  });

  it("rejects an unknown context", async () => {
    await authed(photographer.token)
      .post("/api/photographer/uploads/sign")
      .send({ context: "anything" })
      .expect(400);
  });

  it("is closed to the other role", async () => {
    await authed(client.token)
      .post("/api/photographer/uploads/sign")
      .send({ context: "galleries" })
      .expect(403);
  });
});
