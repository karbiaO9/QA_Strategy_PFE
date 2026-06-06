"use client";

import React from "react";
import { cn } from "@physio-connect-frontend/shared-ui";

/**
 * Main App Layout with Sidebar
 * Used for authenticated pages with sidebar navigation
 */
export function AppLayout({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("flex min-h-screen bg-gray-50", className)}>
      {children}
    </div>
  );
}

/**
 * Auth Layout for Login/Register pages
 * No sidebar, full width login form
 */
export function AuthLayout({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("min-h-screen bg-white", className)}>{children}</div>
  );
}

/**
 * Main Content Area with Rounded Corners
 * Used inside AppLayout after Sidebar
 */
export function MainContent({
  children,
  className,
  padding = "medium",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  padding?: "small" | "medium" | "large";
}>) {
  const paddingMap = {
    small: "p-3 md:p-4",
    medium: "p-4 md:p-6",
    large: "p-6 md:p-8",
  };

  return (
    <main
      className={cn("md:ml-64 flex-1 w-full", paddingMap[padding], className)}
    >
      <div className="mx-auto max-w-7xl bg-white rounded-[10px] shadow-sm border border-gray-100 p-4 md:p-6">
        {children}
      </div>
    </main>
  );
}

export interface GlobalLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: "small" | "medium" | "large";
}

/**
 * Global Layout Component
 * Provides consistent padding and styling across the application
 * Located in: libs/shared/layout
 */
export function GlobalLayout({
  children,
  className,
  padding = "medium",
}: Readonly<GlobalLayoutProps>) {
  const paddingMap = {
    small: "p-3 md:p-4",
    medium: "p-4 md:p-6",
    large: "p-6 md:p-8",
  };

  return (
    <div
      className={cn("min-h-screen bg-gray-50", paddingMap[padding], className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

/**
 * Content Card Component
 * White card with rounded corners for main content
 */
export function ContentCard({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "bg-white rounded-[10px] shadow-sm border border-gray-100 p-4 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Page Header Component
 * Consistent styling for page headers
 */
export function PageHeader({
  title,
  description,
  className,
  children,
}: Readonly<{
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}>) {
  return (
    <div className={cn("mb-6", className)}>
      {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
      {description && <p className="mt-2 text-gray-600">{description}</p>}
      {children}
    </div>
  );
}

/**
 * Login Layout Component
 * Used for login/register pages with form
 */
export function LoginLayout({
  children,
  className,
  logo,
  title,
  subtitle,
  showRightSide = true,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showRightSide?: boolean;
}>) {
  return (
    <div className={cn("min-h-screen bg-white", className)}>
      <div
        className={cn(
          "grid min-h-screen",
          showRightSide ? "lg:grid-cols-2" : "grid-cols-1",
        )}
      >
        {/* Left side - Form */}
        <div className="flex flex-col justify-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            {/* Logo */}
            {logo && (
              <div className="text-lg font-semibold text-gray-900">{logo}</div>
            )}

            {/* Welcome Section */}
            <div className="space-y-2">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              )}
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>

        {/* Right side - Brand/Feature showcase (optional) */}
        {showRightSide && (
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">Bienvenue</h2>
              <p className="text-gray-600 text-lg">
                Accédez à votre plateforme
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
