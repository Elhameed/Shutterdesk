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
    <section className="h-full rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-charcoal">{copy.clientProfile}</h2>
        <User className="size-4 shrink-0 text-muted" aria-hidden />
      </div>

      <div className="flex items-center gap-4">
        {client.avatar ? (
          <img
            src={client.avatar}
            alt={client.name}
            className="size-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gold-light text-base font-bold text-gold">
            {client.initials}
          </div>
        )}
        <div>
          <p className="text-base font-bold text-charcoal">{client.name}</p>
          {client.preferredSince ? (
            <p className="text-xs text-muted">
              {copy.preferredClientSince(client.preferredSince)}
            </p>
          ) : null}
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {contacts.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-start gap-3 text-sm text-charcoal">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
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
