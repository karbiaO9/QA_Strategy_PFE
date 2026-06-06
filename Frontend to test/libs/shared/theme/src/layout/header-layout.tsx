"use client";

import React from "react";
import { Bell } from "lucide-react";
import { cn } from "@physio-connect-frontend/shared-ui";

export interface HeaderLayoutProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  showNotification?: boolean;
  showGradient?: boolean;
  dashboardType?: React.ReactNode;
  className?: string;
}

export function HeaderLayout({
  title,
  subtitle,
  icon,
  action,
  showNotification,
  showGradient = false,
  dashboardType = "admin",
  className,
}: HeaderLayoutProps) {
  return (
    <header
      className={cn(
        "relative shrink-0 py-4 md:py-0 md:h-[88px] px-5 sm:px-8 flex items-center justify-between bg-white border-b border-border-subtle overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {/* Header Left (Icon + Text) */}
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`flex items-center justify-center ${
              dashboardType === "admin" ? "text-primary-500" : "text-secondary-500"
            }`}>
              {icon}
            </div>
          )}
          <div>
            <h1 className="md:text-[24px] text-xl font-medium text-foreground mb-0.5">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] font-medium text-foreground-muted">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Header Right (Action + Notification) */}
      <div className="flex items-center gap-4">
        {action && <div>{action}</div>}
        {showNotification && (
          <button className="relative p-2 text-primary-500 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-[6px] right-[6px] w-[9px] h-[9px] bg-red-500 rounded-full border-2 border-white" />
          </button>
        )}
      </div>

      {showGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#00BEBB] to-[#8A38F5]" />
      )}
    </header>
  );
}
