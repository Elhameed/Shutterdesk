import type { StudioClient, User } from "@prisma/client";

const PLACEHOLDER_INSTAGRAM_HANDLES = new Set([
  "instagram.com/immaculee.niyonsaba",
  "instagram.com/imaniuwase",
]);

export type BookingClientProfileSource = {
  clientName: string;
  clientEmail: string;
  clientMeta?: unknown;
  crmClient?: Pick<StudioClient, "phone" | "memberSince" | "name" | "email"> | null;
  linkedUser?: Pick<
    User,
    "fullName" | "email" | "phone" | "avatarUrl" | "createdAt"
  > | null;
};

export function normalizeBookingInstagram(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER_INSTAGRAM_HANDLES.has(trimmed.toLowerCase())) {
    return "";
  }

  return trimmed;
}

export function resolveBookingClientProfile(source: BookingClientProfileSource) {
  const meta = (source.clientMeta ?? {}) as Record<string, unknown>;
  const linkedUser = source.linkedUser;
  const crmClient = source.crmClient;

  const name = linkedUser?.fullName ?? crmClient?.name ?? source.clientName;
  const email = linkedUser?.email ?? crmClient?.email ?? source.clientEmail;
  const phone =
    linkedUser?.phone?.trim() ||
    crmClient?.phone?.trim() ||
    (typeof meta.phone === "string" ? meta.phone.trim() : "") ||
    "";

  const instagram = normalizeBookingInstagram(meta.instagram);

  const preferredSince = crmClient?.memberSince
    ? crmClient.memberSince.getFullYear()
    : linkedUser?.createdAt
      ? linkedUser.createdAt.getFullYear()
      : typeof meta.preferredSince === "number" && meta.preferredSince >= 2000
        ? meta.preferredSince
        : null;

  return {
    name,
    email,
    phone,
    instagram,
    preferredSince,
  };
}
