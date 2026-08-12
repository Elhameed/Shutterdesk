const STORAGE_PREFIX = "shutterdesk:gallery-access:";

export function getStoredGalleryAccessPin(galleryId: string) {
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}${galleryId}`) ?? undefined;
  } catch {
    return undefined;
  }
}

export function storeGalleryAccessPin(galleryId: string, pin: string) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${galleryId}`, pin);
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export function clearStoredGalleryAccessPin(galleryId: string) {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${galleryId}`);
  } catch {
    // Ignore storage failures.
  }
}
