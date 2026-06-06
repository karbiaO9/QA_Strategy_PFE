"use client";

import React from "react";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme";
import { Search, Filter } from "lucide-react";
import {
  CustomTable,
  TableAction,
  TablePagination,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Button,
  Switch,
  pillClasses,
} from "@physio-connect-frontend/shared-ui";

// --- Sample Data ---
const ROLES_DATA = [
  {
    id: "83829",
    role: "Super Admin",
    lastConnection: "Lundi 24 Decembre 2025",
    status: "active",
  },
  {
    id: "83829",
    role: "IT Support",
    lastConnection: "Mardi 25 Decembre 2025",
    status: "active",
  },
  {
    id: "83829",
    role: "kiné",
    lastConnection: "Mercredi 26 Decembre 2025",
    status: "active",
  },
  {
    id: "83829",
    role: "Financier",
    lastConnection: "Jeudi 27 Decembre 2025",
    status: "active",
  },
  {
    id: "83829",
    role: "IT Support",
    lastConnection: "Vendredi 28 Decembre 2025",
    status: "active",
  },
  {
    id: "83829",
    role: "Super Admin",
    lastConnection: "Samedi 29 Decembre 2025",
    status: "active",
  },
];

export default function AccessRolesPage() {
  const [activeToggle, setActiveToggle] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "super admin":
        return "blue";
      case "it support":
        return "pink";
      case "kiné":
        return "yellow";
      case "financier":
        return "teal";
      default:
        return "secondary";
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      accessor: "id",
      render: (value: string) => (
        <span className="font-bold text-[16px] text-[#070C0C]">{value}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      accessor: "role",
      render: (value: string) => (
        <span className={pillClasses(getRoleColor(value))}>{value}</span>
      ),
    },
    {
      key: "lastConnection",
      header: "Dernière Connexion",
      accessor: "lastConnection",
      render: (value: string) => (
        <span className="text-[#070C0C] text-[16px] font-medium">{value}</span>
      ),
    },
    { key: "status", header: "Statut", accessor: "status" },
  ];

  const actions: TableAction[] = [
    {
      key: "view",
      icon: "eye",
      handleClick: (row) => console.log("View", row),
    },
    {
      key: "edit",
      icon: "edit",
      handleClick: (row) => console.log("Edit", row),
    },
    {
      key: "delete",
      icon: "delete",
      handleClick: (row) => console.log("Delete", row),
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <HeaderLayout
        title="Gestion de rôles"
        icon={<i className="icon-roles text-[30px]" />}
        showGradient={true}
        action={
          <Button
            variant="outline"
            className="rounded-xl border-secondary-500 text-secondary-500 font-bold flex items-center gap-2"
          >
            <i className="icon-add text-[20px]" />
            Ajouter Role
          </Button>
        }
      />

      <div className="flex-1 flex flex-col p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* --- Toolbar --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 ">
          <h2 className="text-[17px] font-bold text-gray-900">
            Liste de roles
          </h2>

          <div className="flex items-center gap-4">
            {/* Switch toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={activeToggle}
                onCheckedChange={setActiveToggle}
              />
              <span className="text-[14px] font-medium text-gray-600">
                Active/Not Active
              </span>
            </div>

            <Button
              variant="outline"
              className="rounded-xl border-gray-200 text-gray-400 px-6 h-10 font-medium"
            >
              En Masse
            </Button>

            <div className="flex items-center gap-2 h-10">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-gray-200 text-gray-400 rounded-xl"
              >
                <Filter className="h-5 w-5" />
              </Button>

              <InputGroup className="w-64 border-gray-200 group-focus-within:border-secondary-400 h-10">
                <InputGroupInput
                  placeholder="Chercher ici"
                  className="text-[14px] placeholder:text-gray-200"
                />
                <InputGroupAddon align="inline-end">
                  <Search className="h-5 w-5 text-gray-200" />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>

        {/* --- Table --- */}
        <div className="flex-1 overflow-y-auto">
          <CustomTable
            selectable
            columns={columns}
            data={ROLES_DATA}
            actions={actions}
            statusStyle="circle-button"
          />
        </div>

        {/* --- Pagination --- */}
        <TablePagination
          currentPage={currentPage}
          totalPages={5}
          totalItems={13}
          selectedLineView={10}
          onPageChange={setCurrentPage}
          className="mt-4"
        />
      </div>
    </div>
  );
}
