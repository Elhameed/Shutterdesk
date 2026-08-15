import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClientManagementActions } from "@/features/photographer-clients/components/ClientManagementActions";
import { CLIENTS_COPY } from "@/constants/photographer-clients";
import { ROUTES } from "@/constants/routes";
import type { Client } from "@/types/domains/photographer-client";
import { formatRwf } from "@/lib/currency";
import { cn } from "@/lib/utils";

const tierStyles = {
  vip: "bg-gold-light text-gold",
  active: "bg-gray-100 text-charcoal",
  new: "bg-gray-100 text-charcoal",
} as const;

const dotStyles = {
  vip: "bg-green-500",
  active: "bg-green-500",
  new: "bg-yellow-400",
} as const;

type ClientCardProps = {
  client: Client;
};

export function ClientCard({ client }: ClientCardProps) {
  const copy = CLIENTS_COPY;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="relative h-24 sm:h-28">
        {client.banner ? (
          <img
            src={client.banner}
            alt=""
            className="size-full object-cover"
            aria-hidden
          />
        ) : (
          <div
            className="size-full bg-gradient-to-br from-gray-100 via-[#f7f7f5] to-gold-light/40"
            aria-hidden
          />
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
              tierStyles[client.tier],
            )}
          >
            {copy.status[client.tier]}
          </span>
          <span
            className={cn("size-2 rounded-full", dotStyles[client.tier])}
            aria-hidden
          />
        </div>
      </div>

      <div className="relative px-4 pb-4">
        <img
          src={client.avatar}
          alt={client.name}
          className="absolute -top-8 left-4 size-16 rounded-full border-4 border-white object-cover shadow-sm"
        />

        <div className="pt-10">
          <h3 className="text-base font-bold text-charcoal">{client.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted">{client.email}</p>
          <p className="truncate text-xs text-muted">{client.phone}</p>

          <span className="mt-3 inline-flex rounded border border-border px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase">
            {copy.categories[client.category]}
          </span>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.sessions}
              </p>
              <p className="mt-0.5 text-sm font-bold text-charcoal">
                {client.sessions}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.revenue}
              </p>
              <p className="mt-0.5 text-sm font-bold text-charcoal">
                {formatRwf(client.revenue)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              asChild
            >
              <Link to={ROUTES.photographer.clientDetail(client.id)}>
                {copy.viewProfile}
              </Link>
            </Button>
            <ClientManagementActions client={client} variant="card" />
          </div>
        </div>
      </div>
    </article>
  );
}
