import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { PasswordInput } from "@/components/auth/PasswordInput";
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
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">
          {copy.title}
        </h1>
        <span className="mt-4 inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-gold">
          {copy.portalBadge}
        </span>
        <p className="mt-4 text-sm leading-relaxed text-muted">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
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
          <span className="text-sm text-muted">{copy.rememberMe}</span>
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
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

      <p className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-light">
        <Lock className="size-3 shrink-0" aria-hidden />
        {copy.securityNote}
      </p>

      <p className="mt-8 text-center text-sm text-muted">
        {copy.noAccount}{" "}
        <Link
          to={ROUTES.register}
          className="font-semibold text-gold hover:text-gold-hover"
        >
          {copy.createAccount}
        </Link>
      </p>
    </div>
  );
}
