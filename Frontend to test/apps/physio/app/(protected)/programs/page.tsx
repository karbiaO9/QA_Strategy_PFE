"use client";

import React from "react";
import { FileText } from "lucide-react";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"

export default function ProgramsPage() {
  return (
    <>
      <HeaderLayout
        title="Programmes affectés"
        subtitle="Consulter les programmes affectés à vos patients"
        icon={<FileText className="h-6 w-6" />}
        showNotification
      />
      <div className="flex-1 overflow-y-auto space-y-14"></div>
    </>
  );
}