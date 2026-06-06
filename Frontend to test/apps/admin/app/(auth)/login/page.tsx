"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoginForm, handleApiError } from "@physio-connect-frontend/shared-ui";
import { AuthLayout } from "@physio-connect-frontend/shared-theme";
import { ROUTES } from "../../../config/routes";
import logo from "../../../public/logo.png";
import { useTranslation } from "react-i18next";
import { useLoginMutation } from "../../../store/api/auth-api";

const BACKGROUND_IMAGE = "/login.png";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const [login] = useLoginMutation();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. First, call our custom login mutation to populate Redux
      await login({ email, password }).unwrap();

      // 2. Then, sign in with NextAuth to establish the session cookie
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push(ROUTES.DASHBOARD);
    } catch (error: any) {
      // Error is handled automatically in authApi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      backgroundImage={BACKGROUND_IMAGE}
      logo={
        <div className="p-6">
          <img src={logo.src} alt="Logo" className="h-10 w-auto" />
        </div>
      }
      logoPosition="left"
      title={t("login.title")}
      subtitle={t("login.subtitle")}
    >
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        showSignUp={false}
        showSocialLogin={false}
      />
    </AuthLayout>
  );
}
