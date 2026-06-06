import { SidebarItem } from "@physio-connect-frontend/shared-ui";

export const physioSidebarItems: SidebarItem[] = [
  {
    label: "Tableau de bord",
    href: "/",
    icon: "Dashboard" as const,
  },
  {
    label: "Patients",
    href: "/patients",
    icon: "Users" as const,
  },
  {
    label: "Calendrier",
    href: "/calendar",
    icon: "Calendar" as const,
  },
  {
    label: "Bibliothèque",
    href: "/library",
    icon: "Book" as const,
  },
  {
    label: "Programmes affectés",
    href: "/programs",
    icon: "FileText" as const,
  },
  {
    label: "Praticiens",
    href: "/practitioners",
    icon: "Users" as const,
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: "Settings" as const,
  },
];
