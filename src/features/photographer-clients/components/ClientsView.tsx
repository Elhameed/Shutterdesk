import { useCallback, useEffect, useMemo, useState } from "react";
import { AddClientModal } from "@/features/photographer-clients/components/AddClientModal";
import { ClientsFilterBar } from "@/features/photographer-clients/components/ClientsFilterBar";
import { ClientsGrid } from "@/features/photographer-clients/components/ClientsGrid";
import { ClientsHeader } from "@/features/photographer-clients/components/ClientsHeader";
import { ClientsList } from "@/features/photographer-clients/components/ClientsList";
import { ClientsPagination } from "@/features/photographer-clients/components/ClientsPagination";
import { ClientsSearch } from "@/features/photographer-clients/components/ClientsSearch";
import {
  filterClients,
  searchClients,
} from "@/features/photographer-clients/lib/client-utils";
import type {
  ClientStatusFilter,
  ClientTypeFilter,
  ClientViewMode,
} from "@/constants/photographer-clients";
import { CardGridSkeleton, ClientCardSkeleton, TableRowsSkeleton } from "@/components/skeletons";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { getApiErrorMessage } from "@/lib/api-error";
import { photographerApi } from "@/services/photographer";
import type { Client, ClientCategory } from "@/types/domains/photographer-client";

const PAGE_SIZE = 12;

export function ClientsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ClientViewMode>("card");
  const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<ClientTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addClientOpen, setAddClientOpen] = useState(false);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await photographerApi.clients.list();
      setClients(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load clients."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const byFilters = filterClients(clients, statusFilter, typeFilter);
    return searchClients(byFilters, searchQuery);
  }, [clients, statusFilter, typeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredClients.slice(start, start + PAGE_SIZE);
  }, [filteredClients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleReset = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
    setDateFilter("");
  };

  const handleClientCreated = async (payload: {
    name: string;
    email: string;
    phone: string;
    category: ClientCategory;
    location?: string;
    notes?: string;
  }) => {
    try {
      await photographerApi.clients.add(payload);
      await loadClients();
    } catch (createError) {
      setError(getApiErrorMessage(createError, "Unable to add client."));
    }
  };

  const from = filteredClients.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredClients.length);

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <ClientsHeader
        view={view}
        onViewChange={setView}
        onAddClient={() => setAddClientOpen(true)}
      />

      <div className="mt-6">
        <ClientsSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="mt-4">
        <ClientsFilterBar
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          dateFilter={dateFilter}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
          onDateChange={setDateFilter}
          onReset={handleReset}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5">
        {showSkeleton ? (
          view === "card" ? (
            <CardGridSkeleton count={PAGE_SIZE} Card={ClientCardSkeleton} />
          ) : (
            <TableRowsSkeleton rows={8} />
          )
        ) : isLoading ? null : paginatedClients.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-white">
            <p className="text-sm text-muted">No clients match your filters.</p>
          </div>
        ) : view === "card" ? (
          <ClientsGrid clients={paginatedClients} />
        ) : (
          <ClientsList clients={paginatedClients} />
        )}
      </div>

      <div className="mt-6">
        <ClientsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          from={from}
          to={to}
          totalClients={filteredClients.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        onCreated={handleClientCreated}
      />
    </div>
  );
}
