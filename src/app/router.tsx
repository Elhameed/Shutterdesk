import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { RouteFallback } from "@/components/common/RouteFallback";
import { routes } from "@/routes";

export function AppRouter() {
  const element = useRoutes(routes);

  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}
