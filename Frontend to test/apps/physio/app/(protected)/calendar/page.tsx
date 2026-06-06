"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"

export default function CalendarPage() {
  return (
    <>
      <HeaderLayout
        title="Calendrier"
        subtitle="Consultez votre calendrier et gérez vos prochains rendez-vous."
        icon={<Calendar className="h-6 w-6" />}
        showNotification
      />
      <div className="flex-1 overflow-y-auto space-y-14"></div>
    </>
  );
}