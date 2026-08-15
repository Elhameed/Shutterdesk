import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ClientSidebar } from "@/components/layout/ClientSidebar";
import { ClientSettingsModal } from "@/features/client-settings";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function ClientLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f7f7f5]">
      {drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-charcoal/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeDrawer}
        />
      )}

      <ClientSidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-200 ease-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        onNavigate={closeDrawer}
        onOpenSettings={() => {
          setSettingsOpen(true);
          closeDrawer();
        }}
      />

      <ClientSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-charcoal transition-colors hover:bg-gray-100"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <Logo size="sm" />
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
