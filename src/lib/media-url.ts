import { assetUrl } from "@/lib/asset-url";
import { appAssets } from "@/constants/assets";

export function resolveMediaUrl(
  value: string | null | undefined,
  fallback = appAssets.userAvatar,
) {
  if (!value) return fallback;
  if (
    value.startsWith("http") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  return assetUrl(value) || fallback;
}
