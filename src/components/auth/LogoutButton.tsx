import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/AuthProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AUTH_COPY } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  onComplete?: () => void;
  className?: string;
  size?: "sm" | "default";
  variant?: "outline" | "ghost";
};

export function LogoutButton({
  onComplete,
  className,
  size = "sm",
  variant = "outline",
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      queryClient.clear();
      push({ title: AUTH_COPY.logoutSuccess, variant: "success" });
      onComplete?.();
      navigate(ROUTES.login, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => void handleLogout()}
      disabled={isLoggingOut}
      className={cn("gap-2", className)}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      {AUTH_COPY.logout}
    </Button>
  );
}
