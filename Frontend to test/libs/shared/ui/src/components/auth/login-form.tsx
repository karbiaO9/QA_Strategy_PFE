"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";
import "../../i18n";
import { Field, FieldGroup, FieldLabel } from "../field";
import { Input } from "../input";

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
  showSocialLogin?: boolean;
  showSignUp?: boolean;
  signUpHref?: string;
}

const loginSchema = (t: any) => z.object({
  email: z.string().min(1, t("login.emailRequired")),
  password: z.string().min(1, t("login.passwordRequired")),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;

export function LoginForm({
  onSubmit,
  isLoading = false,
  className,
  showSocialLogin = true,
  showSignUp = true,
  signUpHref = "/signup",
}: Readonly<LoginFormProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const { t } = useTranslation();
  const schema = loginSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const isFormDisabled = isSubmitting || isLoading;

  const onFormSubmit = async (data: LoginFormData) => {
    setGlobalError("");
    try {
      await onSubmit(data.email, data.password);
    } catch (err: any) {
      const message = err?.data?.message || err?.message || t("login.genericError");
      setGlobalError(message);
      // We also show a toast with the translated code if possible
      const { handleApiError } = await import("../../utils/error-handler");
      handleApiError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn("w-full max-w-md mx-auto", className)}>
      <FieldGroup>
        {/* Email Field */}
        <Field>
          <FieldLabel htmlFor="email">
            {t("login.emailLabel")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="email"
            placeholder={t("login.emailPlaceholder")}
            disabled={isFormDisabled}
            className="bg-white"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.email.message}</p>
          )}
        </Field>

        {/* Password Field */}
        <Field>
          <FieldLabel htmlFor="password">
            {t("login.passwordLabel")} <span className="text-destructive">*</span>
          </FieldLabel>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder={t("login.passwordPlaceholder")}
              disabled={isFormDisabled}
              className="bg-white pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={isFormDisabled}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.password.message}</p>
          )}
        </Field>

        {/* Global Error Message */}
        {globalError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {globalError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isFormDisabled}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mt-4"
        >
          {isSubmitting || isLoading ? t("login.submitBtnLoading") : t("login.submitBtn")}
        </button>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 border-gray-300 rounded focus:ring-ring cursor-pointer disabled:cursor-not-allowed"
              disabled={isFormDisabled}
              {...register("rememberMe")}
            />
            <span className="text-sm font-medium text-black">{t("login.rememberMe")}</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-[#A855F7] hover:text-[#9333EA] font-medium transition-all"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

        {/* Divider */}
        {showSocialLogin && (
          <>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="px-3 bg-white text-gray-400 font-semibold">{t("login.or")}</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isFormDisabled}
                className="flex items-center justify-center gap-2.5 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-800">{t("login.google")}</span>
              </button>

              <button
                type="button"
                disabled={isFormDisabled}
                className="flex items-center justify-center gap-2.5 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 13.5c0-.31-.03-.62-.06-.92h-8.9v1.75h5.1c-.22 1.16-.9 2.15-1.9 2.81v2.25h3.07c1.8-1.66 2.84-4.1 2.84-6.89z" />
                  <path d="M11.4 18.32c2.04 0 3.75-.68 5-1.84l-3.07-2.25c-.68.46-1.56.72-2.35.72-1.8 0-3.32-1.22-3.86-2.86H3.41v2.31C4.66 17.33 7.88 18.32 11.4 18.32z" />
                  <path d="M7.54 14.09c-.27-.46-.42-1-.42-1.59s.15-1.13.42-1.59V8.6H3.41C2.34 10.22 1.75 12.06 1.75 14c0 1.94.59 3.78 1.66 5.4l4.13-3.31z" />
                  <path d="M11.4 6.88c1.03 0 1.95.35 2.67.94l2-2c-1.2-1.12-2.8-1.8-4.67-1.8-3.52 0-6.74 1.99-8.4 4.9l4.13 3.31c.54-1.64 2.06-2.86 3.86-2.86z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-800">{t("login.apple")}</span>
              </button>
            </div>
          </>
        )}

        {/* Sign Up Link */}
        {showSignUp && (
          <div className="text-center mt-8">
            <p className="text-sm text-black">
              {t("login.noAccount")}{' '}
              <Link
                href={signUpHref}
                className="text-cyan-500 hover:text-cyan-600 font-medium"
              >
                {t("login.signUp")}
              </Link>
            </p>
          </div>
        )}
      </FieldGroup>
    </form>
  );
}
