import { HeaderLayout } from "@physio-connect-frontend/shared-theme";
import { Users } from "lucide-react";

export default function ClinicsPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <HeaderLayout
        title="Gestion de cabinets"
        subtitle="Ici, vous pouvez gérer les cabinets."
        icon={<i className="icon-clinics text-[30px]" />}
        showGradient={true}
      />
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <p className="text-sm text-gray-600">
          Cette page est en cours de construction.
        </p>
      </div>
    </div>
  );
}
