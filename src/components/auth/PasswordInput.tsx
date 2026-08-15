import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PasswordInputProps = {
  id: string;
  label?: string;
  forgotPasswordHref?: string;
  forgotPasswordLabel?: string;
  showForgotPassword?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Input>, "type" | "id">;

export function PasswordInput({
  id,
  label = "Password",
  forgotPasswordHref = "#",
  forgotPasswordLabel = "Forgot Password?",
  showForgotPassword = true,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex items-center gap-4",
          showForgotPassword ? "justify-between" : "",
        )}
      >
        <Label htmlFor={id}>{label}</Label>
        {showForgotPassword && (
          <a
            href={forgotPasswordHref}
            className="text-xs font-medium text-gold hover:text-gold-hover"
          >
            {forgotPasswordLabel}
          </a>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          className="pr-11"
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light hover:text-muted"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
