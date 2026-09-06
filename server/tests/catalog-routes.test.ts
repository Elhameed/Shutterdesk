import { beforeAll, describe, expect, it } from "vitest";
import {
  authed,
  createPhotographerPackage,
  setUpLinkedClient,
  setUpStudio,
} from "./helpers.js";

/**
 * Services, clients and studio browsing. Only the create routes were covered,
 * and only incidentally because the test helpers call them.
 */

let photographer: Awaited<ReturnType<typeof setUpStudio>>;
let client: Awaited<ReturnType<typeof setUpLinkedClient>>;

beforeAll(async () => {
  photographer = await setUpStudio("catalog");
  client = await setUpLinkedClient(photographer.token, "catalog");
});

describe("photographer services", () => {
  it("lists and reads a package", async () => {
    const pkg = await createPhotographerPackage(photographer.token, {
      title: "Listed Package",
      price: 120_000,
    });

    const list = await authed(photographer.token)
      .get("/api/photographer/services")
      .expect(200);
    expect((list.body.data as Array<{ id: string }>).map((p) => p.id)).toContain(pkg.id);

    const single = await authed(photographer.token)
      .get(`/api/photographer/services/${pkg.id}`)
      .expect(200);
    expect(single.body.data.id).toBe(pkg.id);
  });

  it("updates a package", async () => {
    const pkg = await createPhotographerPackage(photographer.token, {
      title: "Editable Package",
      price: 100_000,
    });

    const response = await authed(photographer.token)
      .patch(`/api/photographer/services/${pkg.id}`)
      .send({ title: "Renamed Package", price: 175_000 })
      .expect(200);

    expect(response.body.data.title).toBe("Renamed Package");
    expect(response.body.data.price).toBe(175_000);
  });

  it("duplicates a package under a distinct title", async () => {
    const pkg = await createPhotographerPackage(photographer.token, {
      title: "Duplicated Package",
      price: 90_000,
    });

    const response = await authed(photographer.token)
      .post(`/api/photographer/services/${pkg.id}/duplicate`)
      .expect(201);

    expect(response.body.data.id).not.toBe(pkg.id);
    expect(response.body.data.title).not.toBe(pkg.title);
  });

  it("deletes a package", async () => {
    const pkg = await createPhotographerPackage(photographer.token, {
      title: "Disposable Package",
      price: 80_000,
    });

    await authed(photographer.token)
      .delete(`/api/photographer/services/${pkg.id}`)
      .expect(200);

    await authed(photographer.token)
      .get(`/api/photographer/services/${pkg.id}`)
      .expect(404);
  });

  it("rejects a package with a negative price", async () => {
    await authed(photographer.token)
      .post("/api/photographer/services")
      .send({
        title: "Bad Package",
        description: "x",
        price: -1,
        category: "wedding",
        duration: "1hr",
      })
      .expect(400);
  });

  it("does not expose another studio's package", async () => {
    const pkg = await createPhotographerPackage(photographer.token, {
      title: "Private Package",
      price: 60_000,
    });
    const other = await setUpStudio("catalog.intruder");

    await authed(other.token)
      .get(`/api/photographer/services/${pkg.id}`)
      .expect(404);
  });
});

describe("photographer clients", () => {
  it("lists clients and reads one back", async () => {
    const list = await authed(photographer.token)
      .get("/api/photographer/clients")
      .expect(200);
    const ids = (list.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toContain(client.crmClientId);

    const single = await authed(photographer.token)
      .get(`/api/photographer/clients/${client.crmClientId}`)
      .expect(200);
    expect(single.body.data.id).toBe(client.crmClientId);
  });

  it("returns a client profile", async () => {
    const response = await authed(photographer.token)
      .get(`/api/photographer/clients/${client.crmClientId}/profile`)
      .expect(200);

    expect(response.body.data).toHaveProperty("timeline");
  });

  it("updates internal notes", async () => {
    const response = await authed(photographer.token)
      .patch(`/api/photographer/clients/${client.crmClientId}/notes`)
      .send({ notes: "Prefers morning sessions." })
      .expect(200);

    expect(response.body.data.notes).toBe("Prefers morning sessions.");
  });

  it("rejects a duplicate client email on the same studio", async () => {
    await authed(photographer.token)
      .post("/api/photographer/clients")
      .send({
        name: "Duplicate",
        email: client.email,
        phone: "+250 788 999 000",
        category: "wedding",
      })
      .expect(409);
  });

  it("does not expose another studio's client", async () => {
    const other = await setUpStudio("catalog.client.intruder");

    await authed(other.token)
      .get(`/api/photographer/clients/${client.crmClientId}`)
      .expect(404);
  });
});

describe("client studio browsing", () => {
  it("lists studios and their packages", async () => {
    await createPhotographerPackage(photographer.token, {
      title: "Browsable Package",
      price: 200_000,
    });

    const studios = await authed(client.token)
      .get("/api/client/studios")
      .expect(200);
    expect(Array.isArray(studios.body.data)).toBe(true);

    const services = await authed(client.token)
      .get(`/api/client/studios/${photographer.studio.slug}/services`)
      .expect(200);
    expect(Array.isArray(services.body.data)).toBe(true);

    const all = await authed(client.token)
      .get("/api/client/services")
      .expect(200);
    expect(Array.isArray(all.body.data)).toBe(true);
  });

  it("404s on an unknown studio slug", async () => {
    await authed(client.token)
      .get("/api/client/studios/no-such-studio/services")
      .expect(404);
  });
});
