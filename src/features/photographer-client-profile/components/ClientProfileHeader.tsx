import { Check, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENTS_COPY } from "@/constants/photographer-clients";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { CLIENT_TIER_BADGE_STYLES } from "@/constants/status-colors";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";
import { cn } from "@/lib/utils";

type ClientProfileHeaderProps = {
  profile: ClientProfileDetail;
};

export function ClientProfileHeader({ profile }: ClientProfileHeaderProps) {
  const copy = CLIENT_PROFILE_COPY;

  const contacts = [
    { icon: MapPin, value: profile.location },
    { icon: Mail, value: profile.email },
    { icon: Phone, value: profile.phone },
  ];

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="size-20 rounded-full object-cover sm:size-24"
          />
          <span
            className="absolute right-1 bottom-1 size-3.5 rounded-full border-2 border-white bg-green-500"
            aria-hidden
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
              {profile.name}
            </h1>
            <span
              className={cn(
                "inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                CLIENT_TIER_BADGE_STYLES[profile.tier],
              )}
            >
              {CLIENTS_COPY.status[profile.tier]}
            </span>
            {profile.rating === "excellent" && (
              <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-green-700 uppercase">
                <Check className="size-3" strokeWidth={3} aria-hidden />
                {copy.excellent}
              </span>
            )}
          </div>

          <ul className="mt-3 space-y-1.5">
            {contacts.map(({ icon: Icon, value }) => (
              <li
                key={value}
                className="flex items-center gap-2 text-sm text-muted"
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={`tel:${profile.phone.replace(/\s+/g, "")}`}>
            <Phone className="size-4" />
            {copy.quickCall}
          </a>
        </Button>
        <Button variant="default" size="sm" className="gap-2" asChild>
          <a href={`mailto:${profile.email}`}>
            <MessageSquare className="size-4" />
            {copy.sendMessage}
          </a>
        </Button>
      </div>
    </div>
  );
}
