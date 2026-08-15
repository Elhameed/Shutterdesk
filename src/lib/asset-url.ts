/**
 * Resolves image paths under src/assets/images/.
 * Prefers raster formats over .svg when both exist (e.g. after you upload .png).
 */
const imageModules = import.meta.glob<string>(
  "../assets/images/**/*.{png,jpg,jpeg,webp,svg}",
  { eager: true, query: "?url", import: "default" },
);

const EXTENSION_PRIORITY = ["png", "jpg", "jpeg", "webp", "svg"] as const;

/**
 * @param relativePath - Path under src/assets/images/ without extension
 *   e.g. "landing/hero-studio-mockup"
 */
export function assetUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, "").replace(/\\/g, "/");

  for (const ext of EXTENSION_PRIORITY) {
    const suffix = `/${normalized}.${ext}`;
    const match = Object.keys(imageModules).find((key) =>
      key.replace(/\\/g, "/").endsWith(suffix),
    );
    if (match) {
      return imageModules[match];
    }
  }

  console.warn(`[assetUrl] Missing asset: src/assets/images/${normalized}.{png|jpg|jpeg|webp|svg}`);
  return "";
}
