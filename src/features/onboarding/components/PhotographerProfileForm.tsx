import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Banknote, Lock, QrCode, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ONBOARDING_COPY,
  PHOTOGRAPHER_SPECIALIZATIONS,
  type PhotographerSpecialization,
} from "@/constants/onboarding";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/app/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";
import { uploadAvatarToCloudinary } from "@/lib/cloudinary-upload";
import { onboardingService } from "@/services/onboarding/onboarding.service";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

export function PhotographerProfileForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const copy = ONBOARDING_COPY.photographerProfile;
  const sharedCopy = ONBOARDING_COPY.shared;
  const profileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePhotoName, setProfilePhotoName] = useState<string>();
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrCodeName, setQrCodeName] = useState<string>();
  const [businessName, setBusinessName] = useState("");
  const [specialization, setSpecialization] = useState<
    PhotographerSpecialization | ""
  >("");
  const [bio, setBio] = useState("");
  const [momoAccountName, setMomoAccountName] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleProfilePhotoChange(file: File | undefined) {
    if (!file) return;
    setProfileFile(file);
    setProfilePhotoName(file.name);
    setProfilePreview(URL.createObjectURL(file));
  }

  function handleQrChange(file: File | undefined) {
    if (!file) return;
    setQrFile(file);
    setQrCodeName(file.name);
    setQrPreview(URL.createObjectURL(file));
  }

  async function buildOnboardingUploads() {
    let profilePhotoUrl: string | undefined;
    let qrCodeUrl: string | undefined;

    if (profileFile) {
      profilePhotoUrl = await uploadAvatarToCloudinary(profileFile, "photographer");
    }
    if (qrFile) {
      qrCodeUrl = await uploadAvatarToCloudinary(qrFile, "photographer");
    }

    return { profilePhotoUrl, qrCodeUrl };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { profilePhotoUrl, qrCodeUrl } = await buildOnboardingUploads();

      await onboardingService.completePhotographerProfile({
        businessName,
        specialization,
        bio,
        momoAccountName,
        momoNumber,
        profilePhotoName,
        profilePhotoUrl,
        qrCodeName,
        qrCodeUrl,
      });
      await refreshUser();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.dashboard,
      });
      navigate(ROUTES.photographer.dashboard);
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
      const { profilePhotoUrl, qrCodeUrl } = await buildOnboardingUploads();

      await onboardingService.skipPhotographerOnboarding({
        businessName: businessName.trim() || undefined,
        specialization: specialization || undefined,
        bio: bio.trim() || undefined,
        momoAccountName: momoAccountName.trim() || undefined,
        momoNumber: momoNumber.trim() || undefined,
        profilePhotoName,
        profilePhotoUrl,
        qrCodeName,
        qrCodeUrl,
      });
      await refreshUser();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.dashboard,
      });
      navigate(ROUTES.photographer.dashboard);
    } catch (skipError) {
      setError(
        getApiErrorMessage(skipError, "Unable to skip onboarding. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          {copy.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>{copy.profilePhoto}</Label>
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ececea]">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-7 text-muted-light" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) =>
                    handleProfilePhotoChange(e.target.files?.[0])
                  }
                />
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="text-sm font-semibold text-gold underline-offset-4 hover:text-gold-hover hover:underline"
                >
                  {copy.uploadImage}
                </button>
                <p className="mt-1 text-xs text-muted-light">
                  {copy.profilePhotoHint}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>{copy.paymentQrCode}</Label>
            <input
              ref={qrInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleQrChange(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => qrInputRef.current?.click()}
              className={cn(
                "flex h-[88px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-[#f7f7f5] transition-colors hover:bg-[#f0f0ee]",
              )}
            >
              {qrPreview ? (
                <img
                  src={qrPreview}
                  alt=""
                  className="max-h-14 max-w-[80%] object-contain"
                />
              ) : (
                <>
                  <QrCode className="size-5 text-muted-light" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {copy.uploadQr}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">{copy.businessName}</Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder={copy.businessNamePlaceholder}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">{copy.specialization}</Label>
            <Select
              id="specialization"
              name="specialization"
              value={specialization}
              onChange={(e) =>
                setSpecialization(
                  e.target.value as PhotographerSpecialization | "",
                )
              }
              required
            >
              <option value="">{copy.specializationPlaceholder}</option>
              {PHOTOGRAPHER_SPECIALIZATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{copy.bio}</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder={copy.bioPlaceholder}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>

        <div className="rounded-xl bg-[#f7f7f5] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Banknote className="size-4 text-gold" />
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-charcoal">
              {copy.paymentDetails}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="momoAccountName"
              placeholder={copy.momoNamePlaceholder}
              value={momoAccountName}
              onChange={(e) => setMomoAccountName(e.target.value)}
              required
            />
            <Input
              name="momoNumber"
              type="tel"
              placeholder={copy.momoNumberPlaceholder}
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1 text-xs text-muted-light">
            <Lock className="size-3 shrink-0" aria-hidden />
            {copy.securityNote}
          </p>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            <Button
              type="submit"
              variant="auth"
              size="lg"
              className="w-full sm:min-w-[200px]"
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
        </div>
      </form>
    </div>
  );
}
