import { v2 as cloudinary } from "cloudinary";
import type { Env } from "../config/env.js";
import { AppError } from "../middleware/error-handler.js";

export type CloudinaryUploadContext = "receipts" | "galleries" | "avatars" | "services";

export type CloudinaryUploadSignature = {
  mode: "cloudinary";
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
};

export function isCloudinaryConfigured(env: Env) {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
  );
}

function configureCloudinary(env: Env) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function resolveCloudinaryFolder(env: Env, context: CloudinaryUploadContext) {
  const prefix = env.CLOUDINARY_FOLDER_PREFIX.replace(/\/+$/, "");
  return `${prefix}/${context}`;
}

export function createCloudinaryUploadSignature(
  env: Env,
  context: CloudinaryUploadContext,
  resourceType: "image" | "raw" = "image",
): CloudinaryUploadSignature {
  if (!isCloudinaryConfigured(env)) {
    throw new AppError(
      "Cloudinary is not configured. Add CLOUDINARY_* variables to server/.env.",
      503,
    );
  }

  configureCloudinary(env);

  const folder = resolveCloudinaryFolder(env, context);
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET!,
  );

  const cloudName = env.CLOUDINARY_CLOUD_NAME!;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return {
    mode: "cloudinary",
    cloudName,
    apiKey: env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
    uploadUrl,
  };
}

export function cloudinaryThumbnailUrl(secureUrl: string) {
  if (!secureUrl.includes("res.cloudinary.com") || !secureUrl.includes("/upload/")) {
    return secureUrl;
  }
  return secureUrl.replace("/upload/", "/upload/c_fill,w_480,h_480,q_auto,f_auto/");
}

export function isAllowedCloudinaryUrl(env: Env, url: string) {
  if (!url.startsWith("http")) return true;
  if (!isCloudinaryConfigured(env)) return true;

  const cloudName = env.CLOUDINARY_CLOUD_NAME!;
  return url.includes(`res.cloudinary.com/${cloudName}/`);
}

export function normalizeStoredMediaUrl(env: Env, value: string, fieldLabel: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError(`${fieldLabel} is required`, 400);
  }
  if (trimmed.startsWith("blob:")) {
    throw new AppError(`Upload the ${fieldLabel.toLowerCase()} before saving`, 400);
  }
  if (isCloudinaryConfigured(env)) {
    if (!trimmed.startsWith("http")) {
      throw new AppError(`Upload your ${fieldLabel.toLowerCase()} through the file picker`, 400);
    }
    if (!isAllowedCloudinaryUrl(env, trimmed)) {
      throw new AppError(`Invalid ${fieldLabel.toLowerCase()} upload source`, 400);
    }
    return trimmed;
  }
  if (trimmed.startsWith("data:") || trimmed.startsWith("http")) {
    return trimmed;
  }
  return trimmed.replace(/^\//, "");
}
