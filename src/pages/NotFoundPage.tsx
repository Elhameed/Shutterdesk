import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <PageContainer className="flex min-h-screen flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-ink">404</h1>
      <p className="mt-4 text-ink-soft">This page could not be found.</p>
      <Button className="mt-8" asChild>
        <Link to={ROUTES.home}>Back to home</Link>
      </Button>
    </PageContainer>
  );
}
