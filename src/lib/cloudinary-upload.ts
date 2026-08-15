import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";

export type CloudinaryUploadContext =
  | "receipts"
  | "galleries"
  | "avatars"
  | "services";

export type CloudinaryUploadSignature = {
  mode: "cloudinary";
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
};

type SignResponse = { data: CloudinaryUploadSignature };

function resourceTypeForFile(file: File): "image" | "raw" {
  if (file.type === "application/pdf") return "raw";
  return "image";
}

async function requestUploadSignature(
  role: "client" | "photographer",
  context: CloudinaryUploadContext,
  resourceType: "image" | "raw",
) {
  const path =
    role === "client" ? "/client/uploads/sign" : "/photographer/uploads/sign";

  const { data } = await apiClient.post<SignResponse>(path, {
    context,
    resourceType,
  });

  return data.data;
}

export async function uploadFileToCloudinary(
  file: File,
  options: {
    role: "client" | "photographer";
    context: CloudinaryUploadContext;
  },
): Promise<string> {
  const resourceType = resourceTypeForFile(file);
  const signature = await requestUploadSignature(
    options.role,
    options.context,
    resourceType,
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  const response = await fetch(signature.uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(
      body?.error?.message ?? `Cloudinary upload failed (${response.status})`,
    );
  }

  const payload = (await response.json()) as { secure_url?: string };
  if (!payload.secure_url) {
    throw new Error("Cloudinary did not return a secure URL");
  }

  return payload.secure_url;
}

export async function uploadReceiptToCloudinary(file: File) {
  try {
    return await uploadFileToCloudinary(file, {
      role: "client",
      context: "receipts",
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload receipt"));
  }
}

export async function uploadGalleryPhotoToCloudinary(file: File) {
  try {
    return await uploadFileToCloudinary(file, {
      role: "photographer",
      context: "galleries",
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload photo"));
  }
}

export async function uploadAvatarToCloudinary(
  file: File,
  role: "client" | "photographer",
) {
  try {
    return await uploadFileToCloudinary(file, {
      role,
      context: "avatars",
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload profile photo"));
  }
}

export async function uploadServiceCoverToCloudinary(file: File) {
  try {
    return await uploadFileToCloudinary(file, {
      role: "photographer",
      context: "services",
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload cover image"));
  }
}

export async function uploadBrandingToCloudinary(file: File) {
  try {
    return await uploadFileToCloudinary(file, {
      role: "photographer",
      context: "services",
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to upload branding asset"));
  }
}
