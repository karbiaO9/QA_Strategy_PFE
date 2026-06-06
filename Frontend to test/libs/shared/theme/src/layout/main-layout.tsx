"use client";

import { Poppins } from "next/font/google";
import React from "react";
import {
  Sidebar,
  type SidebarItem,
  type UserProfileData,
  Toaster,
} from "@physio-connect-frontend/shared-ui";
import { Menu } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "100", "200", "300", "500", "600", "700", "800", "900"],
});

export const SidebarContext = React.createContext<{
  setMobileOpen: (v: boolean) => void;
} | null>(null);

export interface MainLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  /** optional cabinet name shown at the top of the sidebar. If present, profile moves to bottom. */
  cabinetName?: string;
  /** name of the signed‑in user shown in sidebar */
  userName?: string;
  /** avatar: URL string or React node. Falls back to first letter if not provided */
  userAvatar?: string | React.ReactNode;
  userEmail?: string;
  profiles?: UserProfileData[];
  onProfileClick?: (profile: UserProfileData) => void;
  onAddProfile?: () => void;
  onLogout?: () => void;
}

export function MainLayout({
  children,
  sidebarItems,
  cabinetName,
  userName,
  userAvatar,
  userEmail,
  profiles,
  onProfileClick,
  onAddProfile,
  onLogout,
}: Readonly<MainLayoutProps>) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <SidebarContext.Provider value={{ setMobileOpen }}>
        <div className={`h-screen flex md:gap-4 md:p-4 p-0 overflow-hidden ${poppins.className} antialiased`}>
          {/* desktop sidebar - hidden on mobile, visible on md+ */}
          <aside className="xl:w-[305px] w-[84px] h-full hidden md:block bg-white rounded-3xl shadow-sm flex-col flex-shrink-0">
            <Sidebar
              items={sidebarItems}
              cabinetName={cabinetName}
              userName={userName}
              userAvatar={userAvatar}
              userEmail={userEmail}
              profiles={profiles}
              onProfileClick={onProfileClick}
              onAddProfile={onAddProfile}
              onLogout={onLogout}
            />
          </aside>

          {/* mobile overlay */}
          {mobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <button
                aria-label="Close sidebar"
                className="absolute inset-0 bg-black/25"
                onClick={() => setMobileOpen(false)}
              />
              <aside className="relative w-full h-full bg-white flex flex-col">
                <Sidebar
                  items={sidebarItems}
                  cabinetName={cabinetName}
                  userName={userName}
                  userAvatar={userAvatar}
                  userEmail={userEmail}
                  profiles={profiles}
                  onProfileClick={onProfileClick}
                  onAddProfile={onAddProfile}
                  onLogout={onLogout}
                  logo="Logo"
                  onCloseMobile={() => setMobileOpen(false)}
                />
              </aside>
            </div>
          )}

          {/* main content container */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Mobile top header */}
            <div className="md:hidden flex h-[72px] items-center justify-between px-5 sm:px-6 bg-white shrink-0">
              <div className="font-bold text-[22px] text-gray-900">Logo</div>
              <button
                aria-label="Open sidebar"
                className="flex p-[5px] rounded-lg text-primary-500 border-[1.5px] border-primary-500 transition-colors hover:bg-primary-50"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-6 w-6 rotate-90" strokeWidth={2.5} />
              </button>
            </div>

            <main className="flex-1 flex bg-white md:rounded-3xl md:shadow-sm flex-col min-w-0 overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </SidebarContext.Provider>
      <Toaster />
    </>
  );
}
