"use client";

import {
  DashboardStatCard,
  MonthlyRevenueChart,
  PlanStats,
  DashboardCard,
  CustomTable,
} from "@physio-connect-frontend/shared-ui";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme";
import { Briefcase, Users, UserCheck, CalendarCheck } from "lucide-react";

// Dummy data for the revenue chart
const revenueData = [
  { month: "Jan", revenue: 8000 },
  { month: "Fev", revenue: 9500 },
  { month: "Mars", revenue: 9000 },
  { month: "Apr", revenue: 11000 },
  { month: "Mai", revenue: 13000 },
  { month: "Jui", revenue: 15000 },
  { month: "Jul", revenue: 14000 },
  { month: "Aug", revenue: 19000 },
  { month: "Sep", revenue: 21000 },
  { month: "Oct", revenue: 23000 },
  { month: "Nov", revenue: 25000 },
  { month: "Dec", revenue: 28000 },
];

// Dummy data for plans
const planData = [
  { name: "Basic", value: 15, color: "#8B5CF6" },
  { name: "Entreprise", value: 300, color: "#06B6D4" },
  { name: "Premium", value: 257, color: "#D946EF" },
  { name: "Customisé", value: 20, color: "#3B82F6" },
];

// Dummy data for urgent requests
const urgentRequests = [
  {
    id: "DEF57",
    name: "Lucas Martin",
    topic: "L'application ne se charge pas correctement",
    status: "new",
  },
  {
    id: "DEF60",
    name: "Claire Dufresne",
    topic: "Je ne peux pas accéder à mon compte",
    status: "pending",
  },
  {
    id: "DEF61",
    name: "Antoine Leroy",
    topic: "Les notifications ne s'affichent pas",
    status: "pending",
  },
];

export default function DashboardPage() {

  return (
    <>
      {/* PAGE HEADER */}
      <HeaderLayout
        title="Tableau de bord"
        icon={<i className="icon-dashboard text-[30px]" />}
        showGradient={true}
      />
      <div className="flex flex-col flex-1 h-full overflow-y-auto p-3 sm:p-5 font-sans">
        {/* DASHBOARD CONTENT AREA */}
        <div className="space-y-4 mt-4">
          {/* STAT CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <DashboardStatCard
              title="Cabinets Actifs"
              value="52"
              icon={<Briefcase />}
              variant="minimal"
            />
            <DashboardStatCard
              title="Kinés Actifs"
              value="168"
              icon={<Users />}
              variant="minimal"
            />
            <DashboardStatCard
              title="Patients Suivis"
              value="2.3k"
              icon={<UserCheck />}
              variant="minimal"
            />
            <DashboardStatCard
              title="Seances Réalisé"
              value="10k"
              icon={<CalendarCheck />}
              variant="minimal"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start pb-10">
            {/* LEFT COLUMN: URGENT REQUESTS TABLE */}
            <DashboardCard
              title={
                <span className="text-red-500 flex items-center gap-2">
                  Demandes en urgences
                </span>
              }
              className=" rounded-[24px] bg-white"
            >
              <div className="mt-4 overflow-x-auto">
                <CustomTable
                  columns={[
                    { key: "id", header: "ID Ticket", accessor: "id" },
                    { key: "name", header: "Nom de kiné", accessor: "name" },
                    {
                      key: "topic",
                      header: "Topic",
                      accessor: "topic",
                      render: (value: string) =>
                        value.length > 8
                          ? `${value.substring(0, 8)}...`
                          : value,
                    },
                    { key: "status", header: "Statut", accessor: "status" },
                  ]}
                  data={urgentRequests}
                  actions={[
                    {
                      key: "view",
                      icon: "eye",
                      handleClick: (row) => console.log("View", row),
                    },
                  ]}
                  statusStyle="circle-button"
                  language="fr"
                />
              </div>
            </DashboardCard>

            {/* RIGHT COLUMN: REVENUE ANALYTICS */}
            <div className="flex flex-col gap-5">
              <MonthlyRevenueChart
                title="Revenus récurrents mensuels"
                data={revenueData}
                series={{
                  key: "revenue",
                  label: "Revenu Mensuel",
                  color: "#336DFD",
                }}
                xAxisKey="month"
                yAxisDomain={[8000, 30000]}
                height={150}
                className="rounded-[24px]"
              />

              <PlanStats
                data={planData}
                showOnlyRight={true}
                titleRight="Revenus par plan"
                maxAmount={300}
                className="rounded-[24px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
