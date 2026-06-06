"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "../field";
import { Input } from "../input";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";
import "../../i18n";

export interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

const resetPasswordSchema = (t: any) => z.object({
  password: z.string()
    .min(1, t("resetPassword.passwordRequired"))
    .min(6, t("resetPassword.passwordMinLength")),
  confirmPassword: z.string().min(1, t("resetPassword.confirmPasswordRequired")),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("resetPassword.passwordsMismatch"),
  path: ["confirmPassword"],
});

type FormData = z.infer<ReturnType<typeof resetPasswordSchema>>;

export function ResetPasswordForm({
  onSubmit,
  isLoading = false,
  className,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { t } = useTranslation();
  const schema = resetPasswordSchema(t);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onFormSubmit = async (data: FormData) => {
    await onSubmit(data.password);
  };

  const isDisabled = isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn("w-full max-w-md mx-auto", className)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">{t("resetPassword.passwordLabel")} <span className="text-destructive">*</span></FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("resetPassword.passwordPlaceholder")}
              {...register("password")}
              disabled={isDisabled}
              className="bg-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.password.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">{t("resetPassword.confirmPasswordLabel")} <span className="text-destructive">*</span></FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("resetPassword.confirmPasswordPlaceholder")}
              {...register("confirmPassword")}
              disabled={isDisabled}
              className="bg-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.confirmPassword.message}</p>
          )}
        </Field>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mt-4"
        >
          {isDisabled ? t("resetPassword.submitBtnLoading") : t("resetPassword.submitBtn")}
        </button>
      </FieldGroup>
    </form>
  );
}
