"use client";

import React from "react";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme";
import { MousePointer2 } from "lucide-react";

export default function AccessActionsPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <HeaderLayout
        title="Gestion d'actions"
        icon={<i className="icon-access-management text-[30px]" />}
        showGradient={true}
      />

      <div className="flex-1 flex flex-col p-6 sm:p-8 space-y-6 overflow-hidden items-center justify-center">
        {/* Page Vide */}
        <p className="text-gray-400 text-sm font-medium italic">
          Aucun contenu pour le moment.
        </p>
      </div>
    </div>
  );
}
