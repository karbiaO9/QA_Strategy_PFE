"use client";

import { useRouter } from "next/navigation";
import { ForgotPasswordForm, showToast, handleApiError } from "@physio-connect-frontend/shared-ui";
import { AuthLayout } from "@physio-connect-frontend/shared-theme";
import { useForgotPasswordMutation } from "../../../store/api/auth-api";
import { ROUTES } from "../../../config/routes";
import logo from "../../../public/logo.png";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const { t } = useTranslation();

  const handleForgotPassword = async (email: string) => {
    try {
      const response = await forgotPassword({ email }).unwrap();
      if (response.success) {
        showToast(response.message || t("forgotPassword.successMessage"), "success");
        // Redirect to verify-otp page with email as query param
        router.push(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(email)}`);
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
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.subtitle")}
    >
      <ForgotPasswordForm
        onSubmit={handleForgotPassword}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}
