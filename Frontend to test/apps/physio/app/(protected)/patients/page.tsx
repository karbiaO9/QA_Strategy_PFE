"use client"

import React from "react"
import { useRouter } from "next/navigation";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"
import { CustomTable, CustomTableColumn, TableAction, TablePagination } from "@physio-connect-frontend/shared-ui"
import { Input } from "../../../../../libs/shared/ui/src/components/input"
import { Field, FieldGroup, FieldLabel } from "@physio-connect-frontend/shared-ui"
import { Funnel, Search, User, UserRoundPlus } from "lucide-react"
import { FormDialog } from "@/components/shared/form-dialog"
import { ResponsiveTable } from "@/components/shared/responsive-table";

const ExamplePagination = () => {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Simulation appel /api
    console.log(
      `Page changed: fetching /api/data?page=${newPage}&limit=${rowsPerPage}`,
    );
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    setRowsPerPage(newLimit);
    setPage(1); // On repasse à la première page
    // Simulation appel /api
    console.log(`Rows changed: fetching /api/data?page=1&limit=${newLimit}`);
  };

  return (
    <TablePagination
      currentPage={page}
      totalPages={100}
      onPageChange={handlePageChange}
      lineView={[5, 10, 25, 50]}
      selectedLineView={rowsPerPage}
      onLineViewChange={handleRowsPerPageChange}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COLUMNS
// ─────────────────────────────────────────────────────────────────────────────

const appointmentColumns: CustomTableColumn[] = [
  { key: "name", header: "Nom", accessor: "name", width: "260px" },
  { key: "program", header: "Programme affecté", accessor: "program" },
  { key: "status", header: "Statut", accessor: "status" },
  { key: "sessionEnd", header: "Dernier séance", accessor: "sessionEnd" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const appointmentsData = [
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      name: "Alonso",
      description: "Prochain rendez-vous : 31 Mai - 2:40 PM",
    },
    program: "-",
    status: "new",
    sessionEnd: "24 Mai - 1:30 PM",
  },
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alonso",
      name: "Jean Pierre",
      description: "Prochain rendez-vous : 31 Mai - 2:40 PM",
    },
    program: "Nom de programme",
    status: "active",
    sessionEnd: "24 Mai - 1:30 PM",
  },
];

export default function PatientsPage() {

  const router = useRouter();
  
  const eyeAction: TableAction[] = [
    {
      key: "view",
      icon: "eye",
      label: "Voir",
      handleClick: (row) => {
        router.push(`/patients/1`);
      },
    },
  ];

  return (
    <>
      <HeaderLayout
        title="Patients"
        subtitle="Gestion de vos patients"
        icon={<User className="h-6 w-6" />}
        showNotification
      />
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10">
        <div className="flex justify-between gap-2.5">
          <div className="flex gap-2.5">
            <button className="flex items-center py-2 pl-4 lg:pr-4 pr-2 border border-input text-input-foreground rounded-xl">
              <Funnel className="w-4 h-4 mr-2" />
              <span className="hidden lg:block">Filtres</span>
            </button>
            <Input 
              id="search" 
              autoComplete="off" 
              placeholder="Chercher par nom ou ID"
              leftIcon={<Search className="h-4 w-4" />}  
            />
          </div>

          <FormDialog
            trigger={
              <button className="flex items-center py-2 pl-4 lg:pr-4 pr-2 border border-primary text-primary rounded-xl">
                <UserRoundPlus className="w-4 h-4 mr-2" />
                <span className="hidden lg:block">Ajouter un patient</span>
              </button>
            }
            title="Ajouter un nouveau patient"
            onCancel={() => console.log("Cancelled Modal")}
            onConfirm={() => console.log("Saved Modal")}
          >
            <FieldGroup>
              <Field>
                  <FieldLabel htmlFor="name">Entrer ID <span className="text-destructive">*</span></FieldLabel>
                  <Input id="fullname" autoComplete="off" placeholder="Identifiant reçu par le patient" />
              </Field>
            </FieldGroup>
          </FormDialog>
        </div>
        
        {/* Appointments */}
        <ResponsiveTable
          columns={appointmentColumns}
          data={appointmentsData}
          actions={eyeAction} // For desktop CustomTable
          pagination={<ExamplePagination />}
          variant="default"
          statusStyle="square-with-label"
        />
      </div>
    </>
  );
}