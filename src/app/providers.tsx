import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/app/AuthProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { NotificationToastBridge } from "@/components/common/NotificationToastBridge";
import { ToastProvider } from "@/components/ui/toast";
import { queryClient } from "@/lib/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <ErrorBoundary>
            <AuthProvider>
              <NotificationToastBridge />
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
