"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordForm, showToast } from "@physio-connect-frontend/shared-ui";
import { AuthLayout } from "@physio-connect-frontend/shared-theme";
import { useResetPasswordMutation } from "../../../store/api/auth-api";
import { ROUTES } from "../../../config/routes";
import logo from "../../../public/logo.png";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const resetToken = searchParams.get("token") || "";
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { t } = useTranslation();

  const handleResetPassword = async (password: string) => {
    try {
      const response = await resetPassword({ 
        email, 
        resetToken, 
        newPassword: password 
      }).unwrap();
      
      if (response.success) {
        showToast(t("resetPassword.successMessage"), "success");
        router.push(ROUTES.LOGIN);
      }
    } catch (error: any) {
      // Handled by authApi
    }
  };

  return (
    <AuthLayout
      logo={
        <div className="p-6">
          <img src={logo.src} alt="Logo" className="h-10 w-auto" />
        </div>
      }
      logoPosition="right"
      onBack={() => router.push(ROUTES.LOGIN)}
      title={t("resetPassword.title")}
      subtitle={t("resetPassword.subtitle")}
    >
      <ResetPasswordForm
        onSubmit={handleResetPassword}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
