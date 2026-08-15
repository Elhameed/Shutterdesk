import { ClientCard } from "@/features/photographer-clients/components/ClientCard";
import type { Client } from "@/types/domains/photographer-client";

type ClientsGridProps = {
  clients: Client[];
};

export function ClientsGrid({ clients }: ClientsGridProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        No clients found for this filter.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
