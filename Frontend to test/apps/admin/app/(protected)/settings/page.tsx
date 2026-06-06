import { HeaderLayout } from "@physio-connect-frontend/shared-theme";
import { Settings } from "lucide-react";

export default function ParametresPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <HeaderLayout 
        title="Paramètres" 
        subtitle="Ici, vous pouvez ajuster vos préférences et configurations du compte."
        icon={<Settings className="h-6 w-6" />}
        showGradient={true}
      />
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Préférences Générales</h2>
        <p className="text-sm text-gray-600">
          Cette page est en cours de construction.
        </p>
      </div>
    </div>
  );
}
