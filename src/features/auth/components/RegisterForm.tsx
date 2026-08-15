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

export function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const copy = AUTH_COPY.register;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      navigate(getPostAuthDashboardRoute(user));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignUp() {
    setError("Google sign-in is not configured yet. Please use email and password.");
  }

  return (
    <div>
      <AuthBackLink label={copy.backToWebsite} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-charcoal">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder={copy.fullNamePlaceholder}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder={copy.phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            showForgotPassword={false}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            id="confirmPassword"
            label={copy.confirmPasswordLabel}
            name="confirmPassword"
            autoComplete="new-password"
            showForgotPassword={false}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5">
          <Checkbox
            className="mt-0.5"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <span className="text-sm leading-relaxed text-muted">
            {copy.termsPrefix}{" "}
            <a href="#" className="font-medium text-gold hover:text-gold-hover">
              {copy.termsOfService}
            </a>{" "}
            {copy.termsAnd}{" "}
            <a href="#" className="font-medium text-gold hover:text-gold-hover">
              {copy.privacyPolicy}
            </a>
          </span>
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
          {isSubmitting ? "Creating account…" : copy.createAccount}
        </Button>
      </form>

      <AuthDivider />

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogleSignUp}
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
        {copy.hasAccount}{" "}
        <Link
          to={ROUTES.login}
          className="font-semibold text-gold hover:text-gold-hover"
        >
          {copy.signIn}
        </Link>
      </p>
    </div>
  );
}
