"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Field, FieldGroup, FieldLabel } from "../field";
import { Input } from "../input";
import { cn } from "../../utils/cn";

import { useTranslation } from "react-i18next";
import "../../i18n";

export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

const forgotPasswordSchema = (t: any) => z.object({
  email: z.string().min(1, t("forgotPassword.emailRequired")).email(t("forgotPassword.invalidEmail")),
});

type FormData = z.infer<ReturnType<typeof forgotPasswordSchema>>;

export function ForgotPasswordForm({
  onSubmit,
  isLoading = false,
  className,
}: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const schema = forgotPasswordSchema(t);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onFormSubmit = async (data: FormData) => {
    await onSubmit(data.email);
  };

  const isDisabled = isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn("w-full max-w-md mx-auto", className)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{t("forgotPassword.emailLabel")} <span className="text-destructive">*</span></FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t("forgotPassword.emailPlaceholder")}
            {...register("email")}
            disabled={isDisabled}
            className="bg-white"
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.email.message}</p>
          )}
        </Field>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mt-4"
        >
          {isDisabled ? t("forgotPassword.submitBtnLoading") : t("forgotPassword.submitBtn")}
        </button>
      </FieldGroup>
    </form>
  );
}
