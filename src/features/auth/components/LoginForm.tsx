import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAssets } from "@/constants/assets";
import { AUTH_COPY } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { getPostAuthDashboardRoute } from "@/lib/auth-routing";

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const copy = AUTH_COPY.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password, rememberMe);
      navigate(getPostAuthDashboardRoute(user));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignIn() {
    setError("Google sign-in is not configured yet. Please use email and password.");
  }

  return (
    <div>
      <AuthBackLink label={copy.backToWebsite} />

      <div className="mb-8">
        <h1 className="font-display text-ink text-3xl">{copy.title}</h1>
        <Badge variant="accent" className="mt-4">
          {copy.portalBadge}
        </Badge>
        <p className="text-ink-soft mt-4 text-sm leading-relaxed">
          {copy.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="text-ink-soft text-sm">{copy.rememberMe}</span>
        </label>

        {error && (
          <p
            className="bg-bad-tint text-bad-fg rounded-sm px-4 py-3 text-sm"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="auth"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : copy.signIn}
        </Button>
      </form>

      <AuthDivider />

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        {authAssets.googleIcon ? (
          <img
            src={authAssets.googleIcon}
            alt=""
            className="size-5"
            aria-hidden
          />
        ) : (
          <GoogleIcon />
        )}
        {copy.google}
      </Button>

      <p className="text-ink-faint mt-6 flex items-center justify-center gap-1 text-xs">
        <Lock className="size-3 shrink-0" aria-hidden />
        {copy.securityNote}
      </p>

      <p className="text-ink-soft mt-8 text-center text-sm">
        {copy.noAccount}{" "}
        <Link
          to={ROUTES.register}
          className="text-accent hover:text-accent-hover font-medium transition-colors"
        >
          {copy.createAccount}
        </Link>
      </p>
    </div>
  );
}
