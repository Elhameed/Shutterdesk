import type { ReactNode } from "react";

type GalleryTabSectionProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

export function GalleryTabSection({
  title,
  children,
  action,
}: GalleryTabSectionProps) {
  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-medium text-ink-faint">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
