"use client";

import { Poppins } from "next/font/google";
import React from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "100", "200", "300", "500", "600", "700", "800", "900"],
});

import { Toaster } from "@physio-connect-frontend/shared-ui";

export interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  imagePosition?: "left" | "right";
  onBack?: () => void;
  logoPosition?: "left" | "right";
}

/**
 * Auth Layout for Login/Register pages
 * Modern split layout with form card on left and image on right
 */
export function AuthLayout({
  children,
  backgroundImage,
  logo,
  title = "Bienvenue",
  subtitle = "Connectez-vous pour avoir accès à votre compte",
  imagePosition = "right",
  onBack,
  logoPosition = "left",
}: Readonly<AuthLayoutProps>) {
  return (
    <div className={`flex min-h-screen w-full bg-white ${poppins.className}`}>
      {/* Main Card Container */}
      <div
        className={`flex flex-1 w-full justify-center p-2.5 sm:p-4 flex-col lg:flex-row ${
          imagePosition === "left" ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Left Side - Form Container */}
        <div
          className={`w-full flex flex-col relative bg-white ${
            backgroundImage ? "lg:w-2/5" : "flex-1"
          }`}
        >
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-0 left-0 text-cyan-500 hover:opacity-80 transition-all z-20"
            >
              <span className="icon-left-arrow-two text-2xl"></span>
            </button>
          )}

          {/* Logo */}
          {logo && (
            <div
              className={`absolute top-0 z-10 ${
                logoPosition === "right" ? "right-0" : "left-0 w-full"
              }`}
            >
              <div
                className={
                  logoPosition === "left" ? "w-full max-w-[360px]" : ""
                }
              >
                {logo}
              </div>
            </div>
          )}

          <div
            className={`w-full max-w-[360px] mx-auto flex flex-col h-full relative ${
              onBack ? "mt-20 sm:mt-32" : "mt-10"
            }`}
          >
            <div
              className={`w-full flex flex-col ${onBack ? "" : "justify-center m-auto"}`}
            >
              {/* Form Header */}
              <div className="mb-6 text-center">
                <h2 className="text-[24px] font-bold text-gray-900 mb-1 tracking-tight">
                  {title}
                </h2>
                <p className="text-[16px] text-gray-400 font-medium">
                  {subtitle}
                </p>
              </div>

              {/* Form Content */}
              {children}
            </div>
          </div>
        </div>

        {/* Image Side */}
        {backgroundImage && (
          <div
            className={`hidden lg:flex lg:w-3/5 relative rounded-[20px] overflow-hidden`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${backgroundImage}")`,
              }}
            />
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
