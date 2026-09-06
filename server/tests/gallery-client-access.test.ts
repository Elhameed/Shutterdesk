import { describe, expect, it } from "vitest";
import {
  addCrmClient,
  api,
  onboardPhotographer,
  registerUser,
  setRole,
  uniqueEmail,
} from "./helpers.js";

/**
 * Regression cover for the two defects that made client gallery access fail in
 * every environment:
 *
 *  - galleries were created with a hardcoded `expirationDate` that had already
 *    passed, so every gallery read as expired: the detail endpoint served zero
 *    photos and every download returned 403
 *  - the PIN header was missing from the CORS allowlist, so PIN-protected
 *    galleries failed preflight before the request was ever sent
 *
 * Neither had any coverage, which is why both shipped.
 */

type Studio = { id: string; slug: string };

async function setUpPhotographer(label: string) {
  const { token } = await registerUser({
    fullName: `Gallery Photographer ${label}`,
    email: uniqueEmail(`gallery.photographer.${label}`),
    phone: "+250 788 000 111",
  });

  const { token: photographerToken } = await setRole(token, "photographer");
  const { studio } = await onboardPhotographer(
    photographerToken,
    `Gallery Studio ${label}`,
  );

  return { photographerToken, studio: studio as Studio };
}

async function setUpLinkedClient(photographerToken: string, label: string) {
  const email = uniqueEmail(`gallery.client.${label}`);

  const crmClient = await addCrmClient(photographerToken, {
    name: `Gallery Client ${label}`,
    email,
  });

  const { token } = await registerUser({
    fullName: `Gallery Client ${label}`,
    email,
    phone: "+250 788 222 333",
  });
  const { token: clientToken } = await setRole(token, "client");

  return { clientToken, crmClientId: crmClient.id };
}

async function createReadyGallery(
  photographerToken: string,
  crmClientId: string,
  overrides: Record<string, unknown> = {},
) {
  const response = await api()
    .post("/api/photographer/galleries")
    .set("Authorization", `Bearer ${photographerToken}`)
    .send({
      title: "Regression gallery",
      category: "wedding",
      clientId: crmClientId,
      // `ready` publishes the gallery, which is what makes it visible to the
      // client at all (`findAuthorizedClientGallery`).
      statusSegment: "ready",
      ...overrides,
    })
    .expect(201);

  const gallery = response.body.data as { id: string };

  // A gallery with no photos can't distinguish "expired" from "empty", which is
  // exactly the ambiguity that let the expiry bug hide.
  await api()
    .post(`/api/photographer/galleries/${gallery.id}/photos`)
    .set("Authorization", `Bearer ${photographerToken}`)
    .send({
      photos: [{ assetKey: "galleries/regression-photo-1", alt: "Regression photo" }],
    })
    .expect(201);

  // Uploading photos deliberately drops the gallery back to `editing`, so it
  // has to be delivered before a client can see it at all.
  await api()
    .post(`/api/photographer/galleries/${gallery.id}/deliver`)
    .set("Authorization", `Bearer ${photographerToken}`)
    .expect(200);

  return gallery;
}

describe("client gallery access", () => {
  it("lets a client open a gallery created without an expiry date", async () => {
    const { photographerToken } = await setUpPhotographer("open");
    const { clientToken, crmClientId } = await setUpLinkedClient(
      photographerToken,
      "open",
    );

    const gallery = await createReadyGallery(photographerToken, crmClientId);

    // Before the fix creation stamped a hardcoded past date, so the client got
    // the gallery back with its photos stripped.
    const response = await api()
      .get(`/api/client/galleries/${gallery.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    expect(response.body.data.gallery.id).toBe(gallery.id);
    expect(response.body.data.photos).toHaveLength(1);
  });

  it("reports no expiry when none was set", async () => {
    const { photographerToken } = await setUpPhotographer("noexpiry");
    const { crmClientId } = await setUpLinkedClient(photographerToken, "noexpiry");

    const gallery = await createReadyGallery(photographerToken, crmClientId);

    const response = await api()
      .get(`/api/photographer/galleries/${gallery.id}`)
      .set("Authorization", `Bearer ${photographerToken}`)
      .expect(200);

    expect(response.body.data.meta.settings.expirationDate).toBeNull();
  });

  it("lets a client download from a gallery created without an expiry date", async () => {
    const { photographerToken } = await setUpPhotographer("download");
    const { clientToken, crmClientId } = await setUpLinkedClient(
      photographerToken,
      "download",
    );

    const gallery = await createReadyGallery(photographerToken, crmClientId, {
      allowDownloads: true,
    });

    // The download path is the one that actually threw 403 on a stale expiry.
    await api()
      .post(`/api/client/galleries/${gallery.id}/download`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);
  });

  it("still expires a gallery whose expiry date the photographer set in the past", async () => {
    const { photographerToken } = await setUpPhotographer("expired");
    const { clientToken, crmClientId } = await setUpLinkedClient(
      photographerToken,
      "expired",
    );

    const gallery = await createReadyGallery(photographerToken, crmClientId, {
      expirationDate: "2020-01-01",
      allowDownloads: true,
    });

    // Expiry must still work when it is a deliberate choice — the fix makes it
    // opt-in, not absent.
    const detail = await api()
      .get(`/api/client/galleries/${gallery.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);
    expect(detail.body.data.photos).toHaveLength(0);

    const download = await api()
      .post(`/api/client/galleries/${gallery.id}/download`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(403);
    expect(download.body.message).toMatch(/expired/i);
  });

  it("gates a PIN-protected gallery until the right PIN is supplied", async () => {
    const { photographerToken } = await setUpPhotographer("pin");
    const { clientToken, crmClientId } = await setUpLinkedClient(
      photographerToken,
      "pin",
    );

    const gallery = await createReadyGallery(photographerToken, crmClientId, {
      visibility: "password",
      accessPin: "4821",
    });

    const locked = await api()
      .get(`/api/client/galleries/${gallery.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);
    expect(locked.body.data.photos).toHaveLength(0);

    const wrong = await api()
      .post(`/api/client/galleries/${gallery.id}/verify-pin`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ pin: "0000" })
      .expect(400);
    expect(wrong.body.message).toMatch(/incorrect/i);

    await api()
      .post(`/api/client/galleries/${gallery.id}/verify-pin`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ pin: "4821" })
      .expect(200)
      .expect((response) => {
        expect(response.body.data.verified).toBe(true);
      });

    const unlocked = await api()
      .get(`/api/client/galleries/${gallery.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .set("X-Gallery-Access-Pin", "4821")
      .expect(200);
    expect(unlocked.body.data.photos).toHaveLength(1);
  });

  it("rejects a verify-pin request with no PIN", async () => {
    const { photographerToken } = await setUpPhotographer("nopin");
    const { clientToken, crmClientId } = await setUpLinkedClient(
      photographerToken,
      "nopin",
    );

    const gallery = await createReadyGallery(photographerToken, crmClientId, {
      visibility: "password",
      accessPin: "1234",
    });

    await api()
      .post(`/api/client/galleries/${gallery.id}/verify-pin`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({})
      .expect(400);
  });

  it("lists the client's delivered galleries", async () => {
    const { photographerToken } = await setUpPhotographer("list");
    const { clientToken, crmClientId } = await setUpLinkedClient(
      photographerToken,
      "list",
    );

    const gallery = await createReadyGallery(photographerToken, crmClientId);

    const response = await api()
      .get("/api/client/galleries")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    const ids = (response.body.data as Array<{ id: string }>).map((item) => item.id);
    expect(ids).toContain(gallery.id);
  });

  it("returns a download url for a single photo", async () => {
    const { photographerToken } = await setUpPhotographer("photo");
    const { clientToken, crmClientId } = await setUpLinkedClient(
      photographerToken,
      "photo",
    );

    const gallery = await createReadyGallery(photographerToken, crmClientId, {
      allowDownloads: true,
    });

    const detail = await api()
      .get(`/api/client/galleries/${gallery.id}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);
    const photoId = detail.body.data.photos[0].id as string;

    await api()
      .get(`/api/client/galleries/${gallery.id}/photos/${photoId}/download`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);
  });

  it("does not expose another client's gallery", async () => {
    const { photographerToken } = await setUpPhotographer("isolation");
    const { crmClientId } = await setUpLinkedClient(photographerToken, "isolation");
    const gallery = await createReadyGallery(photographerToken, crmClientId);

    const { clientToken: outsiderToken } = await setUpLinkedClient(
      photographerToken,
      "isolation.outsider",
    );

    await api()
      .get(`/api/client/galleries/${gallery.id}`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .expect(404);
  });

  it("allows the gallery PIN header through CORS preflight", async () => {
    const response = await api()
      .options("/api/client/galleries/some-id")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "X-Gallery-Access-Pin");

    // Without the header on the allowlist the browser never sends the real
    // request, so PIN-protected galleries are unopenable.
    expect(response.headers["access-control-allow-headers"]?.toLowerCase()).toContain(
      "x-gallery-access-pin",
    );
  });
});
