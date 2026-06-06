import { HeaderLayout } from "@physio-connect-frontend/shared-theme";

export default function UsersPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <HeaderLayout
        title="Gestion des utilisateurs"
        subtitle="Ici, vous pouvez administrer les utilisateurs."
        icon={<i className="icon-users text-[30px]" />}
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
