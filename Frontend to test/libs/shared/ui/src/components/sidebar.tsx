"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "../i18n";
import {
  Users,
  Settings,
  FileText,
  Calendar,
  Bell,
  Brain,
  CreditCard,
  HelpCircle,
  Headphones,
  Book,
  Shield,
  User,
  ChevronUp,
  LogOut,
  Plus,
  Menu,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { cn } from "../utils/cn";
import { CustomAvatar } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { CustomAlert } from "./alert-dialog";

const getCustomIcon = (iconName: string) => {
  const CustomIcon = ({ className }: { className?: string }) => (
    <i
      className={cn(
        `icon icon-${iconName} text-[18px] leading-none flex items-center justify-center h-5 w-5`,
        className,
      )}
    />
  );
  CustomIcon.displayName = `CustomIcon(${iconName})`;
  return CustomIcon;
};

const iconMap = {
  Dashboard: getCustomIcon("dashboard"),
  AccessManagement: getCustomIcon("access-management"),
  Roles: getCustomIcon("roles"),
  Users: getCustomIcon("users"),
  Clinics: getCustomIcon("clinics"),
  Library: getCustomIcon("library"),
  AiSupervision: getCustomIcon("ai-supervision"),
  Plans: getCustomIcon("plans"),
  Faqs: getCustomIcon("faqs"),
  Support: getCustomIcon("support"),
  Settings,
  Shield,
  Bell,
  FileText,
  Calendar,
  Brain,
  CreditCard,
  HelpCircle,
  Headphones,
  Book,
  User,
};

export type IconName = keyof typeof iconMap;

export interface SidebarSubItem {
  label: string;
  href: string;
  icon?: IconName;
}

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: IconName;
  subItems?: SidebarSubItem[];
}

export interface UserProfileData {
  id: string;
  name: string;
  subtitle?: string;
  avatar?: string;
  isActive?: boolean;
}

interface Permission {
  action: string;
  subject: string;
  conditions: any;
}

interface Profile {
  id: string;
  profileType: string;
  cabinetName: string;
  role: { slug: string };
  isActive: boolean;
  permissions?: Permission[];
}


export interface SidebarProps {
  items: SidebarItem[];
  /** optional cabinet name for the header. If present, profile moves to bottom. */
  cabinetName?: string;
  /** name of the currently logged‑in user */
  userName?: string;
  /** optional avatar: URL string or React node. Falls back to first letter if not provided */
  userAvatar?: string | React.ReactNode;
  /** optional user email */
  userEmail?: string;
  /** optional active profile id */
  activeProfileId?: string;
  /** optional list of profiles for the switcher */
  profiles?: UserProfileData[] | Profile[];
  /** optional callback when a profile is clicked */
  onProfileClick?: (profile: UserProfileData) => void;
  /** optional callback to add a profile */
  onAddProfile?: () => void;
  /** optional callback for logout */
  onLogout?: () => void;
  /** optional logo text or node */
  logo?: string | React.ReactNode;
  /** optional callback for mobile close button */
  onCloseMobile?: () => void;
  className?: string;
}

// Simple sidebar: no internal responsive logic
// NOTE: This is a legacy component. Use AppSidebar from app-sidebar.tsx for new implementations with shadcn/ui
export function Sidebar({
  items,
  cabinetName,
  userName,
  userAvatar,
  userEmail,
  activeProfileId,
  profiles,
  onProfileClick,
  onAddProfile,
  onLogout,
  logo,
  onCloseMobile,
}: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // State to track which items are expanded
  const [open, setOpen] = React.useState(false);
  const [expandedLabels, setExpandedLabels] = React.useState<Set<string>>(
    new Set(),
  );
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);
  const [topProfileOpen, setTopProfileOpen] = React.useState(false);

  // Navigation Router
  const router = useRouter();

  // Toggle expansion state
  const toggleExpand = (label: string) => {
    setExpandedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  // Adjust Practice Name based on screen size
  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  // Auto-expand parent if a subitem is active
  React.useEffect(() => {
    items.forEach((item) => {
      if (item.subItems?.some((sub) => pathname === sub.href)) {
        setExpandedLabels((prev) => new Set(prev).add(item.label));
      }
    });
  }, [pathname, items]);

  const UserProfile = ({
    username,
    email,
    avatar,
    isActiveProfile, // New prop to replace currentProfile == username logic
    hideStatus = false,
  }: {
    username: string;
    email?: string;
    avatar: React.ReactNode | null;
    isActiveProfile?: boolean;
    hideStatus?: boolean;
  }) => (
    <div className={`flex items-center ${hideStatus ? "xl:gap-3 md:gap-0 gap-3" : "gap-3"}`}>
      <CustomAvatar
        src={typeof avatar === "string" ? avatar : undefined}
        fallbackText={username?.charAt(0)?.toUpperCase()}
        variant="circle"
        showBorder
        borderColor={cabinetName ? "primary" : "secondary"}
        className={`h-[42px] w-[42px] bg-white shadow-sm ${
          cabinetName ? "text-primary-500" : "text-secondary-500"
        }`}
      />
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-[15px] font-medium truncate leading-tight",
              hideStatus && "xl:block md:hidden",
              isActiveProfile && "text-neutral-550"
            )}
          >
            {username}
          </p>
          {!hideStatus && isActiveProfile && (
            <div className={cn(
              "h-[9px] w-[9px] rounded-full",
              cabinetName ? "bg-primary" : "bg-secondary"
            )}></div>
          )}
        </div>
        {email && (
          <p className={cn(
            "text-[13px] font-medium text-foreground-muted truncate leading-tight mt-0.5 max-w-[140px]",
            hideStatus && "xl:block md:hidden"
          )}>
            {email}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header Area */}
      {cabinetName ? (
        <div className="h-[88px] px-6 flex items-center md:justify-center justify-between shrink-0 border-b border-border-subtle mb-2">
          <div className="font-bold text-[20px] text-black">
            <span className="xl:inline md:hidden">{cabinetName}</span>
            <span className="xl:hidden md:inline hidden">
              {getInitials(cabinetName)}
            </span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className={`flex md:hidden p-[5px] rounded-lg border-[1.5px] transition-colors ${
                cabinetName
                  ? "text-primary-500 border-primary-500 hover:bg-primary-50"
                  : "text-secondary-500 border-secondary-500 hover:bg-secondary-50"
              }`}
              aria-label="Close sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
      ) : logo ? (
        <div className="h-[88px] px-5 sm:px-6 flex items-center md:justify-center justify-between shrink-0">
          <div className="font-bold text-[22px] text-gray-900">{logo}</div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className={`flex md:hidden p-[5px] rounded-lg border-[1.5px] transition-colors ${
                cabinetName
                  ? "text-primary-500 border-primary-500 hover:bg-primary-50"
                  : "text-secondary-500 border-secondary-500 hover:bg-secondary-50"
              }`}
              aria-label="Close sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
      ) : userName ? (
        <div className="h-[88px] px-6 flex items-center shrink-0 border-b-2 border-gray-200 mb-2">
          <DropdownMenu open={topProfileOpen} onOpenChange={setTopProfileOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer">
                <UserProfile
                  username={userName}
                  email={userEmail}
                  avatar={userAvatar}
                  hideStatus={true}
                />
                <span
                  className={cn(
                    "icon-bottom-arrow text-[10px] text-gray-400 transition-transform duration-200 block",
                    topProfileOpen && "rotate-180"
                  )}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[260px]" align="start">
              <DropdownMenuLabel className="font-semibold text-gray-900">
                {t("sidebar.myAccount")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="py-2.5 text-destructive hover:cursor-pointer flex items-center gap-2"
                onClick={() => setShowLogoutAlert(true)}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-base">{t("sidebar.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <nav
        className="flex-1 overflow-y-auto p-3 scrollbar-custom"
        style={{ height: "calc(100% - 6.5rem)" }}
      >
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon ? iconMap[item.icon] : null;
            const isActive = pathname === item.href;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <li key={item.label}>
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-1">
                    <Link
                      href={item.href || "#"}
                      onClick={(e) => {
                        if (!item.href && hasSubItems) {
                          e.preventDefault();
                          toggleExpand(item.label);
                        } else {
                          onCloseMobile?.();
                        }
                      }}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-3 py-1 rounded-lg text-[18px] transition-colors",
                        isActive
                          ? cabinetName
                            ? "text-primary-500 font-semibold"
                            : "text-secondary-500 font-semibold"
                          : "text-[#414246] hover:text-gray-900",
                      )}
                    >
                      <div
                        className={cn(
                          "grid place-items-center w-[38px] h-[38px] rounded-xl flex-shrink-0 transition-colors",
                          isActive
                            ? cabinetName
                              ? "border-[2px] border-primary-100 text-primary-500 bg-primary-100/10"
                              : "border-[2px] border-secondary-100 text-secondary-500 bg-secondary-100/10"
                            : "border-2 border-transparent text-[#414246]",
                        )}
                      >
                        {Icon && <Icon className="h-[18px] w-[18px]" />}
                      </div>
                      <span className="xl:block md:hidden flex-1">
                        {t(item.label)}
                      </span>
                    </Link>

                    {hasSubItems && (
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-transform duration-300"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-300",
                            expandedLabels.has(item.label) && "rotate-180",
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {hasSubItems && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        expandedLabels.has(item.label)
                          ? "max-h-[500px] opacity-100 mt-1"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <ul className="ml-[54px] space-y-3 pb-2 pt-1">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon
                            ? iconMap[subItem.icon]
                            : null;
                          const isSubActive = pathname === subItem.href;

                          return (
                            <li key={subItem.label}>
                              <Link
                                href={subItem.href}
                                onClick={onCloseMobile}
                                className={cn(
                                  "flex items-center gap-3 text-[18px] transition-colors",
                                  isSubActive
                                    ? cabinetName
                                      ? "text-primary-500 font-semibold"
                                      : "text-secondary-500 font-semibold"
                                    : "text-[#414246] hover:text-gray-900",
                                )}
                              >
                                {SubIcon && (
                                  <div className="shrink-0 flex items-center justify-center w-[22px] h-[22px]">
                                    <SubIcon className="h-[18px] w-[18px]" />
                                  </div>
                                )}
                                {!SubIcon && (
                                  <div className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-lg border-[1.5px] border-gray-300 text-gray-500">
                                    <span className="font-bold text-[9px]">
                                      D
                                    </span>
                                  </div>
                                )}
                                <span>{t(subItem.label)}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Area */}
      {cabinetName && userName && (
        <div className="mx-3 pt-2">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <div className="py-4 px-2 flex items-center xl:justify-between md:justify-center justify-between border-t border-border-subtle cursor-pointer hover:bg-gray-50 transition-colors rounded-b-3xl">
                <UserProfile
                  username={userName}
                  email={userEmail}
                  avatar={userAvatar}
                  hideStatus={true}
                />

                <div className="xl:flex md:hidden hidden h-8 w-8 items-center justify-center bg-[#F2F2F2] rounded-full shrink-0">
                  <span
                    className={cn(
                      "icon-bottom-arrow text-[10px] text-[#80858A] transition-transform duration-200 block",
                      open && "rotate-180"
                    )}
                  />
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[288px]">
              <DropdownMenuLabel
                className={`}py-2 text-xl font-medium text-center ${
                  cabinetName ? "text-primary-500" : "text-secondary-500"
                }`}
              >
                {t("sidebar.myProfiles")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {profiles?.map((p: any) => {
                  const profileName = p.cabinetName || "Profil Sans Nom";
                  const profileSubtitle = p.profileType || "";

                  console.log(p);

                  return (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl hover:bg-[#F9FBFA] hover:cursor-pointer"
                      onClick={() => onProfileClick?.(p)}
                    >
                      <UserProfile
                        username={userName}
                        email={profileSubtitle}
                        avatar={p.avatar || null}
                        isActiveProfile={activeProfileId ? p.id === activeProfileId : false} // Detects active state from data attribute
                      />
                    </div>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="py-2.5 text-[#414246] hover:cursor-pointer"
                onClick={() => router.push("/create-profile")}
              >
                <Plus></Plus>
                <span className="text-base">{t("sidebar.addProfile")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="py-2.5 text-destructive hover:cursor-pointer"
                onClick={() => setShowLogoutAlert(true)}
              >
                <LogOut></LogOut>
                <span className="text-base">{t("sidebar.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <CustomAlert
        isOpen={showLogoutAlert}
        onOpenChange={setShowLogoutAlert}
        icon={<LogOut className="h-8 w-8" />}
        description={t("sidebar.logoutConfirmation")}
        confirmText={t("sidebar.logoutConfirmBtn")}
        cancelText={t("sidebar.logoutCancelBtn")}
        color="red"
        onConfirm={() => {
          onLogout?.();
          setShowLogoutAlert(false);
        }}
      />
    </div>
  );
}
