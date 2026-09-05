import { Instagram, Mail, Phone, User } from "lucide-react";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import type { BookingDetail } from "@/types/domains/booking";

type ClientProfileCardProps = {
  client: BookingDetail["client"];
};

const NOT_PROVIDED = "Not provided";

export function ClientProfileCard({ client }: ClientProfileCardProps) {
  const copy = BOOKING_DETAIL_COPY;

  const contacts = [
    { icon: Mail, label: copy.contactEmail, value: client.email },
    { icon: Phone, label: copy.contactPhone, value: client.phone || NOT_PROVIDED },
    ...(client.instagram
      ? [{ icon: Instagram, label: copy.contactInstagram, value: client.instagram }]
      : []),
  ];

  return (
    <section className="h-full rounded-md border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-ink">{copy.clientProfile}</h2>
        <User className="size-4 shrink-0 text-ink-soft" aria-hidden />
      </div>

      <div className="flex items-center gap-4">
        {client.avatar ? (
          <img
            src={client.avatar}
            alt={client.name}
            className="size-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-tint text-base font-bold text-accent">
            {client.initials}
          </div>
        )}
        <div>
          <p className="text-base font-bold text-ink">{client.name}</p>
          {client.preferredSince ? (
            <p className="text-xs text-ink-soft">
              {copy.preferredClientSince(client.preferredSince)}
            </p>
          ) : null}
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {contacts.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-start gap-3 text-sm text-ink">
            <Icon className="mt-0.5 size-4 shrink-0 text-ink-soft" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-ink-faint">
                {label}
              </p>
              <p className="truncate">{value}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
