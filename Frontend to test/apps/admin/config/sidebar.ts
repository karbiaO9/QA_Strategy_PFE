import { SidebarItem } from "@physio-connect-frontend/shared-ui";
import { ROUTES } from "./routes";

export const adminSidebarItems: SidebarItem[] = [
  {
    label: "sidebar.dashboard",
    href: ROUTES.DASHBOARD,
    icon: "Dashboard" as const,
  },
  {
    label: "sidebar.accessManagement",
    icon: "AccessManagement" as const,
    subItems: [
      {
        label: "sidebar.modules",
        href: ROUTES.ACCESS_MODULES,
        icon: "AccessManagement" as const,
      },
      {
        label: "sidebar.permissions",
        href: ROUTES.ACCESS_PERMISSIONS,
        icon: "AccessManagement" as const,
      },
      {
        label: "sidebar.actions",
        href: ROUTES.ACCESS_ACTIONS,
        icon: "AccessManagement" as const,
      },
    ],
  },
  {
    label: "sidebar.roles",
    href: ROUTES.ROLES,
    icon: "Roles" as const,
  },
  {
    label: "sidebar.users",
    href: ROUTES.USERS,
    icon: "Users" as const,
  },
  {
    label: "sidebar.clinics",
    href: ROUTES.CLINICS,
    icon: "Clinics" as const,
  },
  {
    label: "sidebar.library",
    href: ROUTES.LIBRARY,
    icon: "Library" as const,
  },
  {
    label: "sidebar.notifications",
    href: ROUTES.NOTIFICATIONS,
    icon: "Bell" as const,
  },
  {
    label: "sidebar.aiSupervision",
    href: ROUTES.AI_SUPERVISION,
    icon: "AiSupervision" as const,
  },
  {
    label: "sidebar.plans",
    href: ROUTES.PLANS,
    icon: "Plans" as const,
  },
  {
    label: "sidebar.faqs",
    href: ROUTES.FAQS,
    icon: "Faqs" as const,
  },
  {
    label: "sidebar.support",
    href: ROUTES.SUPPORT,
    icon: "Support" as const,
  },
];
