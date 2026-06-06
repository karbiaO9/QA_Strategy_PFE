"use client";

import { useState, useRef } from "react";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";
import "../../i18n";

export interface VerifyOtpFormProps {
  onSubmit: (otp: string) => Promise<void> | void;
  onResend?: () => void;
  isLoading?: boolean;
  className?: string;
  length?: number;
  email?: string; // Optional email to show in subtitle
}

export function VerifyOtpForm({
  onSubmit,
  onResend,
  isLoading = false,
  className,
  length = 6,
  email = "",
}: VerifyOtpFormProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { t } = useTranslation();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFormSubmit = async () => {
    await onSubmit(otp.join(""));
  };

  return (
    <div
      className={cn(
        "w-full max-w-lg mx-auto flex flex-col items-center",
        className,
      )}
    >
      <div className="flex gap-2 sm:gap-4 mb-10">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-10 sm:w-14 sm:h-14 text-center text-xl font-medium border border-gray-300 rounded-[18px] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
          />
        ))}
      </div>

      <button
        onClick={handleFormSubmit}
        disabled={isLoading || otp.some((d) => d === "")}
        className="w-full bg-cyan-500 hover:bg-cyan-500/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-sm"
      >
        {isLoading ? t("verifyOtp.submitBtnLoading") : t("verifyOtp.submitBtn")}
      </button>

      {onResend && (
        <p className="mt-8 text-sm font-medium text-gray-900">
          {t("verifyOtp.resendPrompt")}{" "}
          <button
            onClick={onResend}
            className="text-cyan-500 font-bold hover:underline"
          >
            {t("verifyOtp.resendBtn")}
          </button>
        </p>
      )}
    </div>
  );
}
