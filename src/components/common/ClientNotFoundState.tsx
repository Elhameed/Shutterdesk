import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type ClientNotFoundStateProps = {
  message: string;
  actionLabel: string;
  actionHref: string;
};

export function ClientNotFoundState({
  message,
  actionLabel,
  actionHref,
}: ClientNotFoundStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
      <p className="text-sm text-muted">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" asChild>
        <Link to={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
