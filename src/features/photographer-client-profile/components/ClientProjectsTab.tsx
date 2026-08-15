import { Calendar, Clock, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { ROUTES } from "@/constants/routes";
import { PROJECT_STATUS_BADGE_STYLES } from "@/constants/status-colors";
import { resolveMediaUrl } from "@/lib/media-url";
import type { ClientProject } from "@/types/domains/photographer-client";
import { cn } from "@/lib/utils";

type ClientProjectsTabProps = {
  projects: ClientProject[];
};

export function ClientProjectsTab({ projects }: ClientProjectsTabProps) {
  const copy = CLIENT_PROFILE_COPY;

  if (projects.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">No projects yet.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((project) => {
        const content = (
          <>
            <div className="relative h-36 sm:h-40">
              {project.coverImage ? (
                <img
                  src={resolveMediaUrl(project.coverImage, "")}
                  alt={project.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-gray-100 via-[#f7f7f5] to-gold-light/30" />
              )}
              <span
                className={cn(
                  "absolute top-3 right-3 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  PROJECT_STATUS_BADGE_STYLES[project.status],
                )}
              >
                {copy.projectStatus[project.status]}
              </span>
            </div>

            <div className="p-4">
              <p className="text-[10px] font-bold tracking-wider text-gold uppercase">
                {project.category}
              </p>
              <h3 className="mt-1 text-base font-bold text-charcoal">
                {project.title}
              </h3>

              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 shrink-0" aria-hidden />
                  {project.date}
                </span>
                {project.photoCount !== undefined ? (
                  <span className="flex items-center gap-1.5">
                    <Image className="size-3.5 shrink-0" aria-hidden />
                    {copy.photos(project.photoCount)}
                  </span>
                ) : project.time ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" aria-hidden />
                    {project.time}
                  </span>
                ) : null}
              </div>
            </div>
          </>
        );

        return (
          <article
            key={project.id}
            className="overflow-hidden rounded-xl border border-border bg-white shadow-card transition-shadow hover:shadow-md"
          >
            {project.bookingId ? (
              <Link
                to={ROUTES.photographer.bookingDetail(project.bookingId)}
                className="block"
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </article>
        );
      })}
    </div>
  );
}
