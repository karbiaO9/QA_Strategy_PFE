"use client";

import React from "react";
import {
  Sidebar,
  type SidebarItem,
  type UserProfileData,
  Toaster,
} from "@physio-connect-frontend/shared-ui";
import { Menu } from "lucide-react";
import ProtectedRoute from "../guards/protected-route";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, switchActiveProfile } from "@/store/slices/auth-slice";
import { RootState } from "@/store/store";
import { useSelectProfileMutation } from "@/store/api/auth-api";


export const SidebarContext = React.createContext<{
  setMobileOpen: (v: boolean) => void;
} | null>(null);

export interface MainLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
}

export function MainLayout({
  children,
  sidebarItems,
}: Readonly<MainLayoutProps>) {
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const { user, profiles, activeProfile } = useSelector((state: RootState) => state.auth);
  const [selectProfile, { isLoading: isSwitchingProfile }] = useSelectProfileMutation();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleProfileClick = async (profile: UserProfileData) => {
    if (activeProfile?.id === profile.id) return;

    try {
      await selectProfile(profile.id).unwrap();
    } catch (error) {
      console.error("Profile switch failed", error);
    }
  };

  const handleAddProfile = () => {
    console.log("Navigation to add profile page or opening modal");
  };

  console.log("MainLayout Render - User:", user, "Profiles:", profiles, "Active Profile:", activeProfile);

  return (
    <ProtectedRoute>
      <SidebarContext.Provider value={{ setMobileOpen }}>
        <div className={`h-screen flex md:gap-4 md:p-4 p-0 overflow-hidden ${isSwitchingProfile ? 'opacity-75 pointer-events-none' : ''}`}>
          {/* Desktop Sidebar */}
          <aside className="xl:w-[305px] w-[84px] h-full hidden md:block bg-white rounded-3xl shadow-sm flex-col flex-shrink-0">
            <Sidebar
              items={sidebarItems}
              cabinetName={activeProfile?.cabinetName}
              userName={`${user?.firstName} ${user?.lastName}`}
              userAvatar={user?.profilePhoto || undefined}
              userEmail={user?.email}
              activeProfileId={activeProfile?.id}
              profiles={profiles}
              onProfileClick={handleProfileClick}
              onAddProfile={handleAddProfile}
              onLogout={handleLogout}
            />
          </aside>

          {/* Mobile Sidebar Overlay */}
          {mobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <button
                className="absolute inset-0 bg-black/25"
                onClick={() => setMobileOpen(false)}
              />
              <aside className="relative w-full h-full bg-white flex flex-col">
                <Sidebar
                  items={sidebarItems}
                  cabinetName={activeProfile?.cabinetName}
                  userName={`${user?.firstName} ${user?.lastName}`}
                  userAvatar={user?.profilePhoto || undefined}
                  userEmail={user?.email}
                  profiles={profiles}
                  onProfileClick={handleProfileClick}
                  onAddProfile={handleAddProfile}
                  onLogout={handleLogout}
                  logo="XXXConnect"
                  onCloseMobile={() => setMobileOpen(false)}
                />
              </aside>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Mobile Top Header */}
            <div className="md:hidden flex h-[72px] items-center justify-between px-5 sm:px-6 bg-white shrink-0">
              <div className="font-bold text-[22px] text-gray-900">XXXConnect</div>
              <button
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
    </ProtectedRoute>
  );
}
