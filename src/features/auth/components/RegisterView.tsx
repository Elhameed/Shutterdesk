import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { authAssets } from "@/constants/assets";
import { AUTH_COPY } from "@/constants/auth";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export function RegisterView() {
  const copy = AUTH_COPY.register;

  return (
    <AuthSplitLayout
      backgroundImage={authAssets.loginSideBg}
      headline={copy.headline}
      subheadline={copy.subheadline}
      formClassName="max-w-lg"
      monotone
      logoVariant="black"
    >
      <RegisterForm />
    </AuthSplitLayout>
  );
}
