"use client";

import React from "react";
import { Book } from "lucide-react";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"

export default function LibraryPage() {
  return (
    <>
      <HeaderLayout
        title="Bibliothèque"
        subtitle="Téléversez des vidéos, créez des programmes et modifiez-les."
        icon={<Book className="h-6 w-6" />}
        showNotification
      />
      <div className="flex-1 overflow-y-auto space-y-14"></div>
    </>
  );
}