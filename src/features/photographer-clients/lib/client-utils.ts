import type {
  ClientStatusFilter,
  ClientTypeFilter,
} from "@/constants/photographer-clients";
import { formatRwf } from "@/lib/currency";
import type { Client } from "@/types/domains/photographer-client";

export function filterClients(
  clients: Client[],
  status: ClientStatusFilter,
  type: ClientTypeFilter,
): Client[] {
  return clients.filter((client) => {
    const matchesStatus = status === "all" || client.tier === status;
    const matchesType = type === "all" || client.category === type;
    return matchesStatus && matchesType;
  });
}

export function searchClients(clients: Client[], query: string): Client[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return clients;

  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(normalized) ||
      client.email.toLowerCase().includes(normalized) ||
      client.phone.toLowerCase().includes(normalized),
  );
}

export function formatClientCurrency(amount: number): string {
  return formatRwf(amount);
}
