import { ROUTES } from "@/constants/routes";
import type { PhotographerGallery } from "@/types/domains/gallery";

export type ClientGalleryNavigation =
  | { type: "none" }
  | { type: "detail"; galleryId: string }
  | { type: "list" };

export function getClientGalleries(
  galleries: PhotographerGallery[],
  clientId: string,
) {
  return galleries.filter((gallery) => gallery.clientId === clientId);
}

export function resolveClientGalleryNavigation(
  galleries: PhotographerGallery[],
  clientId: string,
): ClientGalleryNavigation {
  const clientGalleries = getClientGalleries(galleries, clientId);

  if (clientGalleries.length === 0) {
    return { type: "none" };
  }

  if (clientGalleries.length === 1) {
    return { type: "detail", galleryId: clientGalleries[0].id };
  }

  return { type: "list" };
}

export function clientGalleryRoute(
  galleries: PhotographerGallery[],
  clientId: string,
) {
  const target = resolveClientGalleryNavigation(galleries, clientId);

  switch (target.type) {
    case "detail":
      return ROUTES.photographer.galleryDetail(target.galleryId);
    case "list":
      return ROUTES.photographer.galleriesForClient(clientId);
    default:
      return null;
  }
}
