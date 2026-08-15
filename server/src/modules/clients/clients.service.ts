import type { ClientCategory, ClientTier } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { resolveStudioClientAvatar } from "../../lib/client-avatar.js";
import {
  loadStudioClientMetrics,
  resolveClientMetrics,
} from "../../lib/client-metrics.js";
import { loadClientProfileActivity } from "../../lib/client-profile-activity.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import {
  buildPaginatedResult,
  type PaginationParams,
} from "../../lib/pagination.js";
import { AppError } from "../../middleware/error-handler.js";
import { toApiClient, toApiClientProfile } from "./clients.mapper.js";

type CreateClientInput = {
  name: string;
  email: string;
  phone: string;
  category: ClientCategory;
  location?: string;
  notes?: string;
};

function buildOnboardingTimeline(name: string, dateLabel: string) {
  return [
    {
      id: "onboarded",
      type: "onboarded",
      title: "Client Onboarded",
      subtitle: `${name} was added to your CRM.`,
      date: dateLabel,
    },
  ];
}

export async function listStudioClients(
  photographerUserId: string,
  pagination?: PaginationParams,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const where = { studioId: studio.id };
  const query = {
    where,
    orderBy: [{ tier: "asc" as const }, { createdAt: "desc" as const }],
    include: { linkedUser: { select: { avatarUrl: true } } },
  };

  const mapClient = async (clients: Awaited<ReturnType<typeof prisma.studioClient.findMany>>) => {
    const metricsMap = await loadStudioClientMetrics(
      studio.id,
      clients.map((client) => ({ id: client.id, email: client.email })),
    );
    return clients.map((client) =>
      toApiClient(
        client,
        resolveStudioClientAvatar(client),
        resolveClientMetrics(client.id, metricsMap),
      ),
    );
  };

  if (!pagination) {
    const clients = await prisma.studioClient.findMany(query);
    return await mapClient(clients);
  }

  const [clients, total] = await Promise.all([
    prisma.studioClient.findMany({
      ...query,
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.studioClient.count({ where }),
  ]);

  const items = await mapClient(clients);
  return buildPaginatedResult(items, total, pagination);
}

export async function getStudioClientById(
  photographerUserId: string,
  clientId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);

  const client = await prisma.studioClient.findFirst({
    where: {
      id: clientId,
      studioId: studio.id,
    },
    include: { linkedUser: { select: { avatarUrl: true } } },
  });

  if (!client) {
    return null;
  }

  const metricsMap = await loadStudioClientMetrics(studio.id, [
    { id: client.id, email: client.email },
  ]);

  return toApiClient(
    client,
    resolveStudioClientAvatar(client),
    resolveClientMetrics(client.id, metricsMap),
  );
}

export async function getStudioClientProfile(
  photographerUserId: string,
  clientId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);

  const client = await prisma.studioClient.findFirst({
    where: {
      id: clientId,
      studioId: studio.id,
    },
    include: { linkedUser: { select: { avatarUrl: true } } },
  });

  if (!client) {
    return null;
  }

  const metricsMap = await loadStudioClientMetrics(studio.id, [
    { id: client.id, email: client.email },
  ]);
  const metrics = resolveClientMetrics(client.id, metricsMap);
  const activity = await loadClientProfileActivity(studio.id, client, metrics);

  return toApiClientProfile(
    client,
    resolveStudioClientAvatar(client),
    metrics,
    activity,
  );
}

export async function updateStudioClientNotes(
  photographerUserId: string,
  clientId: string,
  notes: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);

  const client = await prisma.studioClient.findFirst({
    where: {
      id: clientId,
      studioId: studio.id,
    },
  });

  if (!client) {
    return null;
  }

  const updated = await prisma.studioClient.update({
    where: { id: client.id },
    data: { internalNotes: notes.trim() || null },
  });

  return updated.internalNotes;
}

export async function createStudioClient(
  photographerUserId: string,
  input: CreateClientInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.studioClient.findUnique({
    where: {
      studioId_email: {
        studioId: studio.id,
        email,
      },
    },
  });

  if (existing) {
    throw new AppError("A client with this email already exists in your CRM", 409);
  }

  const linkedUser = await prisma.user.findUnique({
    where: { email },
  });

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const client = await prisma.studioClient.create({
    data: {
      studioId: studio.id,
      linkedUserId: linkedUser?.role === "client" ? linkedUser.id : null,
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      category: input.category,
      tier: "new",
      avatarAssetKey: linkedUser?.avatarUrl ?? null,
      location: input.location?.trim() || null,
      internalNotes: input.notes?.trim() || null,
      timeline: buildOnboardingTimeline(input.name.trim(), dateLabel),
      projects: [],
      invoices: [],
      galleries: [],
      insights: {
        retention: "New",
        favType:
          input.category.charAt(0).toUpperCase() + input.category.slice(1),
        avgValue: 0,
      },
      preferences: {
        primaryContact: "Email Only",
        artisticStyles: [],
        editingPrefs: "No editing preferences recorded yet.",
        specialRequirements: input.notes?.trim() || "No special requirements noted.",
      },
    },
  });

  return toApiClient(
    client,
    resolveStudioClientAvatar({
      ...client,
      linkedUser: linkedUser?.role === "client" ? linkedUser : null,
    }),
  );
}

export type { CreateClientInput, ClientCategory, ClientTier };
