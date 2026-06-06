"use client";

import { MainLayout } from "@physio-connect-frontend/shared-theme";
import { adminSidebarItems } from "../../config";
import { useSession, signOut } from "next-auth/react";
import { useGetMeQuery } from "../../store/api/auth-api";
import "../globals.css";

export default function ProtectedLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { data: me } = useGetMeQuery({});
  const apiUser = me?.user;
  
  const userName = apiUser 
    ? `${apiUser.firstName} ${apiUser.lastName}` 
    : (session?.user?.name || (session?.user as any)?.firstName || "Admin");
    
  const userEmail = apiUser?.email || session?.user?.email || "";
  const userAvatar = apiUser?.profilePhoto || session?.user?.image || null;

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <MainLayout
      sidebarItems={adminSidebarItems}
      userName={userName}
      userEmail={userEmail}
      userAvatar={userAvatar}
      onLogout={handleLogout}
    >
      {children}
    </MainLayout>
  );
}
