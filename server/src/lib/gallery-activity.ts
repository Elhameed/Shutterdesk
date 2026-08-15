import { randomUUID } from "crypto";
import { formatRelativeTimestamp } from "./notification-dispatch.js";

export type GalleryActivityRecord = {
  id: string;
  type: "favorite" | "share" | "download" | "view";
  description: string;
  timestamp: string;
};

export function readGalleryActivities(raw: unknown): GalleryActivityRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((entry): entry is GalleryActivityRecord => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const record = entry as Record<string, unknown>;
    return (
      typeof record.id === "string" &&
      typeof record.type === "string" &&
      typeof record.description === "string" &&
      typeof record.timestamp === "string"
    );
  });
}

export function appendGalleryActivity(
  activities: unknown,
  entry: Pick<GalleryActivityRecord, "type" | "description">,
): GalleryActivityRecord[] {
  const current = readGalleryActivities(activities);

  return [
    {
      id: randomUUID(),
      type: entry.type,
      description: entry.description,
      timestamp: formatRelativeTimestamp(new Date()),
    },
    ...current,
  ].slice(0, 50);
}
