import { ROUTES } from "@/constants/routes";
import type { User, UserRole } from "@/types";

export function getDashboardRouteForRole(role: UserRole) {
  return role === "client"
    ? ROUTES.client.dashboard
    : ROUTES.photographer.dashboard;
}

export function getDashboardRouteForUser(user: User) {
  return getDashboardRouteForRole(user.role);
}

export function getOnboardingProfileRoute(user: User) {
  return user.role === "client"
    ? ROUTES.onboarding.clientProfile
    : ROUTES.onboarding.photographerProfile;
}

export function userNeedsOnboarding(user: User) {
  return user.needsOnboarding !== false;
}

export function getOnboardingRedirectRoute(user: User) {
  return getOnboardingProfileRoute(user);
}

export function getPostAuthDashboardRoute(user?: User | null) {
  if (!user) {
    return ROUTES.onboarding.role;
  }

  if (userNeedsOnboarding(user)) {
    return ROUTES.onboarding.role;
  }

  return getDashboardRouteForUser(user);
}

export function getBrandLogoRoute(user?: User | null) {
  if (!user) {
    return ROUTES.home;
  }

  return getPostAuthDashboardRoute(user);
}

export function isOnboardingPath(pathname: string) {
  return pathname.startsWith("/onboarding");
}
