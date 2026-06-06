import { HeaderLayout } from "@physio-connect-frontend/shared-theme";
import { CreditCard } from "lucide-react";

export default function PlansPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <HeaderLayout 
        title="Gestion de plans" 
        subtitle="Ici, vous pouvez gérer les abonnements et les plans."
        icon={<CreditCard className="h-6 w-6" />}
        showGradient={true}
      />
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <p className="text-sm text-gray-600">Cette page est en cours de construction.</p>
      </div>
    </div>
  );
}
