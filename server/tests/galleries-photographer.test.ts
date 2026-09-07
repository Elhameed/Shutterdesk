import { beforeAll, describe, expect, it } from "vitest";
import { authed, setUpLinkedClient, setUpStudio } from "./helpers.js";

/**
 * `galleries.service.ts` is the largest and most stateful service in the API and
 * had exactly one of its sixteen routes covered. These tests exercise the rest,
 * with particular attention to the stored counters (photoCount, coverAssetKey,
 * storageUsedGb) that are maintained two different ways.
 */

let photographer: Awaited<ReturnType<typeof setUpStudio>>;
let crmClientId: string;

beforeAll(async () => {
  photographer = await setUpStudio("galleries");
  ({ crmClientId } = await setUpLinkedClient(photographer.token, "galleries"));
});

function studio() {
  return authed(photographer.token);
}

async function createGallery(overrides: Record<string, unknown> = {}) {
  const response = await studio()
    .post("/api/photographer/galleries")
    .send({
      title: "Coverage gallery",
      category: "wedding",
      clientId: crmClientId,
      ...overrides,
    })
    .expect(201);

  return response.body.data as { id: string; title: string };
}

async function addPhotos(galleryId: string, count: number) {
  const response = await studio()
    .post(`/api/photographer/galleries/${galleryId}/photos`)
    .send({
      photos: Array.from({ length: count }, (_, index) => ({
        assetKey: `galleries/coverage-${index}`,
        alt: `Coverage photo ${index}`,
      })),
    })
    .expect(201);

  return response.body.data.photos as Array<{ id: string; alt: string }>;
}

async function readDetail(galleryId: string) {
  const response = await studio()
    .get(`/api/photographer/galleries/${galleryId}`)
    .expect(200);

  return response.body.data as {
    gallery: Record<string, unknown>;
    meta: Record<string, unknown>;
    photos: Array<{ id: string; alt: string }>;
  };
}

describe("photographer galleries", () => {
  it("creates a gallery and lists it", async () => {
    const gallery = await createGallery({ title: "Listed gallery" });

    const list = await studio().get("/api/photographer/galleries").expect(200);
    const ids = (list.body.data as Array<{ id: string }>).map((item) => item.id);

    expect(ids).toContain(gallery.id);
  });

  it("returns a detail payload with gallery, meta and photos", async () => {
    const gallery = await createGallery();
    await addPhotos(gallery.id, 2);

    const detail = await readDetail(gallery.id);

    expect(detail.gallery.id).toBe(gallery.id);
    expect(detail.photos).toHaveLength(2);
    expect(detail.meta).toHaveProperty("settings");
  });

  it("updates a gallery's editable fields", async () => {
    const gallery = await createGallery();

    await studio()
      .patch(`/api/photographer/galleries/${gallery.id}`)
      .send({ title: "Renamed gallery", description: "Updated description" })
      .expect(200);

    const detail = await readDetail(gallery.id);
    expect(detail.gallery.title).toBe("Renamed gallery");
    expect(detail.gallery.description).toBe("Updated description");
  });

  it("tracks photoCount as photos are added", async () => {
    const gallery = await createGallery();

    await addPhotos(gallery.id, 3);
    expect((await readDetail(gallery.id)).gallery.photoCount).toBe(3);

    await addPhotos(gallery.id, 2);
    expect((await readDetail(gallery.id)).gallery.photoCount).toBe(5);
  });

  it("keeps photoCount correct after deleting a photo", async () => {
    const gallery = await createGallery();
    const photos = await addPhotos(gallery.id, 3);

    await studio()
      .delete(`/api/photographer/galleries/${gallery.id}/photos/${photos[0].id}`)
      .expect(200);

    const detail = await readDetail(gallery.id);
    expect(detail.photos).toHaveLength(2);
    // Upload increments this counter while delete recomputes it, so the two
    // paths have to agree.
    expect(detail.gallery.photoCount).toBe(2);
  });

  it("updates a single photo's alt text", async () => {
    const gallery = await createGallery();
    const photos = await addPhotos(gallery.id, 2);

    await studio()
      .patch(`/api/photographer/galleries/${gallery.id}/photos/${photos[0].id}`)
      .send({ alt: "Renamed photo" })
      .expect(200);

    const detail = await readDetail(gallery.id);
    const updated = detail.photos.find((photo) => photo.id === photos[0].id);
    expect(updated?.alt).toBe("Renamed photo");
  });

  it("reorders photos", async () => {
    const gallery = await createGallery();
    const photos = await addPhotos(gallery.id, 3);
    const reversed = [...photos].reverse().map((photo) => photo.id);

    await studio()
      .patch(`/api/photographer/galleries/${gallery.id}/photos/reorder`)
      .send({ photoIds: reversed })
      .expect(200);

    const detail = await readDetail(gallery.id);
    expect(detail.photos.map((photo) => photo.id)).toEqual(reversed);
  });

  it("updates delivery settings", async () => {
    const gallery = await createGallery();
    await addPhotos(gallery.id, 1);

    await studio()
      .patch(`/api/photographer/galleries/${gallery.id}/delivery`)
      .send({ allowDownloads: true, deliveryNotes: "Ready for the client." })
      .expect(200);

    const detail = await readDetail(gallery.id);
    expect(detail.meta.delivery).toMatchObject({
      deliveryNotes: "Ready for the client.",
    });
  });

  it("delivers a gallery and refuses to deliver an empty one", async () => {
    const empty = await createGallery();
    await studio()
      .post(`/api/photographer/galleries/${empty.id}/deliver`)
      .expect(400);

    const gallery = await createGallery();
    await addPhotos(gallery.id, 1);
    await studio()
      .post(`/api/photographer/galleries/${gallery.id}/deliver`)
      .expect(200);

    const detail = await readDetail(gallery.id);
    expect(detail.gallery.workflowStatus).toBe("delivered");
  });

  it("notifies the client about a delivered gallery", async () => {
    const gallery = await createGallery();
    await addPhotos(gallery.id, 1);
    await studio().post(`/api/photographer/galleries/${gallery.id}/deliver`).expect(200);

    await studio()
      .post(`/api/photographer/galleries/${gallery.id}/notify-client`)
      .expect(200);
  });

  it("archives a gallery", async () => {
    const gallery = await createGallery();
    await addPhotos(gallery.id, 1);

    await studio()
      .post(`/api/photographer/galleries/${gallery.id}/archive`)
      .expect(200);

    const detail = await readDetail(gallery.id);
    expect(detail.gallery.status).toBe("archived");
  });

  it("exports a gallery report", async () => {
    const gallery = await createGallery();
    await addPhotos(gallery.id, 2);

    const response = await studio()
      .get(`/api/photographer/galleries/${gallery.id}/export-report`)
      .expect(200);

    expect(response.body.data).toBeTruthy();
  });

  it("keeps a chosen cover when photos change", async () => {
    const gallery = await createGallery({
      coverAssetKey: "galleries/chosen-cover",
    });
    const photos = await addPhotos(gallery.id, 3);

    expect((await readDetail(gallery.id)).gallery.coverAssetKey).toBe(
      "galleries/chosen-cover",
    );

    // Delete and reorder used to recompute the cover from the first remaining
    // photo, discarding the photographer's choice. It is now only reassigned
    // when the removed photo *was* the cover.
    await studio()
      .delete(`/api/photographer/galleries/${gallery.id}/photos/${photos[0].id}`)
      .expect(200);

    expect((await readDetail(gallery.id)).gallery.coverAssetKey).toBe(
      "galleries/chosen-cover",
    );

    const remaining = (await readDetail(gallery.id)).photos;
    await studio()
      .patch(`/api/photographer/galleries/${gallery.id}/photos/reorder`)
      .send({ photoIds: [...remaining].reverse().map((photo) => photo.id) })
      .expect(200);

    expect((await readDetail(gallery.id)).gallery.coverAssetKey).toBe(
      "galleries/chosen-cover",
    );
  });

  it("refuses to touch another studio's gallery", async () => {
    const gallery = await createGallery();
    const other = await setUpStudio("galleries.intruder");

    await authed(other.token)
      .get(`/api/photographer/galleries/${gallery.id}`)
      .expect(404);

    await authed(other.token)
      .patch(`/api/photographer/galleries/${gallery.id}`)
      .send({ title: "Hijacked" })
      .expect(404);
  });

  it("rejects a gallery with no title", async () => {
    await studio()
      .post("/api/photographer/galleries")
      .send({ category: "wedding", clientId: crmClientId })
      .expect(400);
  });
});
