export type ServiceCoverCrop = {
  focalX: number;
  focalY: number;
  zoom: number;
};

export const DEFAULT_SERVICE_COVER_CROP: ServiceCoverCrop = {
  focalX: 50,
  focalY: 50,
  zoom: 1,
};

export const SERVICE_COVER_CARD_CLASS = "relative h-44 sm:h-48";

export function clampCoverCrop(crop: Partial<ServiceCoverCrop>): ServiceCoverCrop {
  return {
    focalX: clamp(crop.focalX ?? 50, 0, 100),
    focalY: clamp(crop.focalY ?? 50, 0, 100),
    zoom: clamp(crop.zoom ?? 1, 1, 2.5),
  };
}

export function defaultCoverCropForAspect(width: number, height: number): ServiceCoverCrop {
  if (width <= 0 || height <= 0) {
    return DEFAULT_SERVICE_COVER_CROP;
  }

  const aspect = width / height;

  if (aspect < 0.85) {
    return { focalX: 50, focalY: 32, zoom: 1 };
  }

  if (aspect < 1) {
    return { focalX: 50, focalY: 40, zoom: 1 };
  }

  return DEFAULT_SERVICE_COVER_CROP;
}

export function serviceCoverImageStyle(crop: ServiceCoverCrop) {
  const normalized = clampCoverCrop(crop);

  return {
    objectFit: "cover" as const,
    objectPosition: `${normalized.focalX}% ${normalized.focalY}%`,
    transform: normalized.zoom > 1 ? `scale(${normalized.zoom})` : undefined,
    transformOrigin: `${normalized.focalX}% ${normalized.focalY}%`,
  };
}

export function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Unable to read image dimensions"));
    image.src = src;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
