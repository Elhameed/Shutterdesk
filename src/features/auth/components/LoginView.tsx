import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { authAssets } from "@/constants/assets";
import { AUTH_COPY } from "@/constants/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginView() {
  const copy = AUTH_COPY.login;

  return (
    <AuthSplitLayout
      backgroundImage={authAssets.loginSideBg}
      headline={copy.headline}
      subheadline={copy.subheadline}
      logoVariant="black"
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
