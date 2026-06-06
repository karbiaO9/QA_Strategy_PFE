"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { VerifyOtpForm, showToast } from "@physio-connect-frontend/shared-ui";
import { AuthLayout } from "@physio-connect-frontend/shared-theme";
import { useVerifyCodeMutation } from "../../../store/api/auth-api";
import { ROUTES } from "../../../config/routes";
import logo from "../../../public/logo.png";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [verifyCode, { isLoading }] = useVerifyCodeMutation();
  const { t } = useTranslation();

  const handleVerifyOtp = async (code: string) => {
    try {
      const response = await verifyCode({ email, code }).unwrap();
      if (response.success) {
        showToast(t("verifyOtp.successMessage"), "success");
        // Redirect to reset-password page with email and resetToken (from response)
        router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(response.resetToken)}`);
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
      title={t("verifyOtp.title")}
      subtitle={t("verifyOtp.subtitle", { email })}
    >
      <VerifyOtpForm
        onSubmit={handleVerifyOtp}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
