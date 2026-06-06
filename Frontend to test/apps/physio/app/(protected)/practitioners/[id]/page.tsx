"use client"

import React from "react"
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"
import { CustomAlert, CustomTable, CustomTableColumn, TableAction, TablePagination } from "@physio-connect-frontend/shared-ui"
import Image from "next/image";
import { ArrowLeft, CircleStar, CreditCard, Edit, Mail, ReceiptText, Smartphone, Trash } from "lucide-react";
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
      totalPages={50}
      onPageChange={handlePageChange}
      lineView={[5, 10, 25, 50]}
      selectedLineView={rowsPerPage}
      onLineViewChange={handleRowsPerPageChange}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const eyeAction: TableAction[] = [
  {
    key: "view",
    icon: "eye",
    label: "Voir",
    handleClick: (row) => console.log("View", row),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COLUMNS
// ─────────────────────────────────────────────────────────────────────────────

const appointmentColumns: CustomTableColumn[] = [
  { key: "name", header: "Nom", accessor: "name", width: "260px" },
  { key: "status", header: "Statut", accessor: "status" },
  { key: "nextSession", header: "Prochaine séance", accessor: "nextSession" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const appointmentsData = [
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      name: "Ali Bayoudh",
      description: "alibayoudh44@gmail.com",
    },
    status: "active",
    nextSession: "24 Mai - 1:30 PM"
  },
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alonso",
      name: "Aliça Fernandez",
      description: "alicafernandez@gmail.com",
    },
    status: "active",
    nextSession: "24 Mai - 1:30 PM"
  },
];

export default function PractitionersPage() {
  return (
    <>
      <HeaderLayout
        title="Profile de kiné"
        icon={<ArrowLeft className="!text-gray-300 text-[24px]" />}
        action={
          <CustomAlert
            trigger={
              <Trash className="h-12 w-12 p-2.5 rounded-full text-destructive border border-destructive hover:cursor-pointer" />
            }
            icon={<i className="icon icon-worning" />}
            description="Voulez-vous vraiment désactiver le profil de kiné XXX?"
            color="red"
            cancelText="Annuler"
            confirmText="Supprimer"
            onConfirm={() => console.log("Deleted!")}
          />
        }
      />
      <div className="flex-1 overflow-y-auto sm:!pl-0 p-4 space-y-10">
        <div className="flex lg:flex-row flex-col h-full lg:gap-2 gap-2.5">
          <div className="p-3 mx-auto flex flex-col items-center gap-5 sm:max-w-sm">
            <div className="flex flex-col items-center gap-4">
              <Image
                src="/avatar6.png"
                alt="avatar"
                width={105}
                height={107}
                className="rounded-xl border-2 border-primary"
              />

              <h3 className="xl:text-2xl text-[22px] text-neutral-950 font-medium text-center">Ali Bayoudh</h3>

              <div className="h-0.5 w-32 bg-primary-300"></div>
            </div>

            <div className="w-full flex items-center justify-between gap-4">
              <span className="text-sm text-foreground-muted font-medium">Infos Kiné</span>
              <Edit className="!text-[#9A91E4] sm:text-lg text-base" />
            </div>
            
            <ul className="space-y-6">
              <li className="flex items-center gap-5">
                <Mail className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-basetext-sm font-medium">alibayoudh44@gmail.com</span>
              </li>
              <li className="flex items-center gap-5">
                <Smartphone className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-basetext-sm font-medium">1466</span>
              </li>
              <li className="flex items-center gap-5">
                <ReceiptText className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-basetext-sm font-medium">164324726</span>
              </li>
              <li className="flex items-center gap-5">
                <CircleStar className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-basetext-sm font-medium">Normal</span>
              </li>
              <li className="flex items-center gap-5">
                <CreditCard className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-basetext-sm font-medium">
                  <span className="text-primary">Abonnement Actif</span>
                  <br />
                  <span className="!text-sm text-foreground-muted">Prochain : 30 Oct 2025</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="h-full w-0.5 min-w-0.5 bg-primary-100"></div>

          {/* Appointments */}
          <div className="w-full">
            <ResponsiveTable
              columns={appointmentColumns}
              data={appointmentsData}
              actions={eyeAction} // For desktop CustomTable
              pagination={<ExamplePagination />}
              variant="default"
              statusStyle="progress-bar"
            />
          </div>
        </div>
      </div>
    </>
  );
}