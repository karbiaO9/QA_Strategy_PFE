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
} from "@physio-connect-frontend/shared-ui";

// --- Sample Data ---
const MODULES_DATA = [
  {
    id: "83829",
    name: "Gestion de kiné",
    code: "Kine_gestion",
    description: "Lorem ipsum dolar imet set sen consecudar",
    status: "active",
  },
  {
    id: "83829",
    name: "Suivi de patients",
    code: "Patient_tracking",
    description:
      "Outils pour surveiller l'évolution des patients et leur récupération.",
    status: "inactive",
  },
  {
    id: "83829",
    name: "Planification de séances",
    code: "Session_planning",
    description: "Calendrier pour organiser les rendez-vous avec les patients.",
    status: "active",
  },
  {
    id: "83829",
    name: "Gestion des factures",
    code: "Invoice_management",
    description:
      "Système pour créer et suivre les factures des services rendus.",
    status: "active",
  },
  {
    id: "83829",
    name: "Rapports de performanc...",
    code: "Performance_reports",
    description: "Analyse des résultats et des progrès des traitements.",
    status: "active",
  },
  {
    id: "83829",
    name: "Dossier médical électron...",
    code: "Electronic_health_record",
    description:
      "Base de données pour stocker les informations médicales des patients.",
    status: "active",
  },
  {
    id: "83829",
    name: "Communication avec les...",
    code: "Patient_communication",
    description:
      "Outils pour envoyer des rappels et des notifications aux patients.",
    status: "active",
  },
];

export default function AccessModulesPage() {
  const [activeToggle, setActiveToggle] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

  const columns = [
    { key: "id", header: "ID", accessor: "id" },
    {
      key: "name",
      header: "Nom de module",
      accessor: "name",
      render: (value: string) => (
        <span className="font-bold text-[16px] text-[#070C0C]">{value}</span>
      ),
    },
    { key: "code", header: "Code", accessor: "code" },
    {
      key: "description",
      header: "Description",
      accessor: "description",
      render: (value: string) => (
        <span className="text-gray-400 line-clamp-1">{value}</span>
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
        title="Gestion de Modules"
        icon={<i className="icon-access-management text-[30px]" />}
        showGradient={true}
        action={
          <Button
            variant="outline"
            className="rounded-xl border-secondary-500 text-secondary-500 font-bold flex items-center gap-2"
          >
            <i className="icon-add text-[20px]" />
            Ajouter Module
          </Button>
        }
      />

      <div className="flex-1 flex flex-col p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* --- Toolbar --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <h2 className="text-[17px] font-bold text-gray-900">
            Liste de modules
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
              className="rounded-xl border-gray-200 text-gray-400 px-6 h-10"
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

              <InputGroup className="w-64 border-gray-200 group-focus-within:border-secondary-400">
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
            data={MODULES_DATA}
            actions={actions}
            statusStyle="circle-button"
            language="fr"
          />
        </div>

        {/* --- Pagination --- */}
        <TablePagination
          currentPage={currentPage}
          totalPages={3}
          totalItems={13}
          selectedLineView={10}
          onPageChange={setCurrentPage}
          className="mt-4"
        />
      </div>
    </div>
  );
}
