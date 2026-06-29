import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { InterestChips } from "@/components/onboarding/InterestChips";
import { ProfilePhotoUpload } from "@/components/onboarding/ProfilePhotoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CLIENT_INTERESTS,
  ONBOARDING_COPY,
} from "@/constants/onboarding";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/api-error";
import { uploadAvatarToCloudinary } from "@/lib/cloudinary-upload";
import { clientApi } from "@/services/client";
import { onboardingService } from "@/services/onboarding/onboarding.service";

export function ClientProfileForm() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const copy = ONBOARDING_COPY.clientProfile;
  const sharedCopy = ONBOARDING_COPY.shared;

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user?.phone]);

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      setIsSubmitting(false);
      return;
    }
    if (!address.trim()) {
      setError("Please enter your location.");
      setIsSubmitting(false);
      return;
    }
    if (interests.length === 0) {
      setError("Please select at least one specialty or interest.");
      setIsSubmitting(false);
      return;
    }

    try {
      let avatarUrl: string | undefined;
      if (profileFile) {
        avatarUrl = await uploadAvatarToCloudinary(profileFile, "client");
      }
      await clientApi.settings.update({
        fullName: user?.fullName ?? "",
        phone,
        address,
        interests,
        ...(avatarUrl ? { avatarUrl } : {}),
      });
      await refreshUser();
      navigate(ROUTES.client.dashboard);
    } catch (submitError) {
      setError(
        getApiErrorMessage(submitError, "Unable to complete setup. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSkip() {
    setError(null);
    setIsSubmitting(true);

    try {
      await onboardingService.skipClientOnboarding();
      await refreshUser();
      navigate(ROUTES.client.dashboard);
    } catch (skipError) {
      setError(
        getApiErrorMessage(skipError, "Unable to skip onboarding. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8 lg:p-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          {copy.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <ProfilePhotoUpload
          preview={profilePreview}
          title={copy.profilePhoto}
          hint={copy.profilePhotoHint}
          onChange={(file) => {
            setProfileFile(file);
            setProfilePreview(URL.createObjectURL(file));
          }}
        />

        <div className="space-y-2">
          <Label htmlFor="phone">{copy.phoneNumber}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder={copy.phonePlaceholder}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
          {user?.phone ? (
            <p className="text-xs text-muted">{copy.phoneFromAccount}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{copy.address}</Label>
          <Input
            id="address"
            name="address"
            placeholder={copy.addressPlaceholder}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
          />
        </div>

        <InterestChips
          label={copy.interests}
          options={CLIENT_INTERESTS}
          selected={interests}
          onToggle={toggleInterest}
        />

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-2">
          <Button
            type="submit"
            variant="auth"
            size="lg"
            className="w-full shadow-elevated"
            disabled={isSubmitting}
          >
            {copy.completeSetup}
            <ArrowRight className="size-4" />
          </Button>

          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-muted-light hover:text-muted"
            onClick={() => void handleSkip()}
            disabled={isSubmitting}
          >
            {sharedCopy.skipForNow}
          </Button>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-light">
          {copy.termsPrefix}{" "}
          <Link to="#" className="underline hover:text-muted">
            {copy.termsOfService}
          </Link>{" "}
          {copy.termsAnd}{" "}
          <Link to="#" className="underline hover:text-muted">
            {copy.privacyPolicy}
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
