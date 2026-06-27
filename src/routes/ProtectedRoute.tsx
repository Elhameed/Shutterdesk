import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/AuthProvider";
import { AppShellSkeleton } from "@/components/skeletons";
import { ROUTES } from "@/constants/routes";
import {
  getDashboardRouteForUser,
  getOnboardingRedirectRoute,
  getPostAuthDashboardRoute,
  isOnboardingPath,
  userNeedsOnboarding,
} from "@/lib/auth-routing";
import type { UserRole } from "@/types";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
      <div className="text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="text-sm text-muted">Loading your session…</p>
      </div>
    </div>
  );
}

type ProtectedRouteProps = {
  children: ReactNode;
  role?: UserRole;
};

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppShellSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  if (userNeedsOnboarding(user) && !isOnboardingPath(location.pathname)) {
    return <Navigate to={getOnboardingRedirectRoute(user)} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getDashboardRouteForUser(user)} replace />;
  }

  return children;
}

type GuestRouteProps = {
  children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getPostAuthDashboardRoute(user)} replace />;
  }

  return children;
}
