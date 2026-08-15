import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENTS_COPY } from "@/constants/photographer-clients";
import { ClientsViewToggle } from "@/features/photographer-clients/components/ClientsViewToggle";
import type { ClientViewMode } from "@/constants/photographer-clients";

type ClientsHeaderProps = {
  view: ClientViewMode;
  onViewChange: (view: ClientViewMode) => void;
  onAddClient: () => void;
};

export function ClientsHeader({
  view,
  onViewChange,
  onAddClient,
}: ClientsHeaderProps) {
  const copy = CLIENTS_COPY;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted">{copy.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ClientsViewToggle view={view} onChange={onViewChange} />
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={onAddClient}
        >
          <UserPlus className="size-4" />
          <span className="hidden sm:inline">{copy.addClient}</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
}
