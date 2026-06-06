"use client";

import React from "react";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme";
import { Search, Filter } from "lucide-react";
import {
  CustomCard,
  DashedCreateCard,
  ToggleGroupTabs,
  ToggleGroupTabsList,
  ToggleGroupTabsTrigger,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Button,
} from "@physio-connect-frontend/shared-ui";

// --- Mock Data ---
const PROGRAMS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800",
    title: "Reprise Progressive de l'Activité Physique",
    stats: [
      { value: "4", label: "Semaines :" },
      { value: "3", label: "Seance" },
    ],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=800",
    title: "Reprise Progressive de l'Activité Physique",
    stats: [
      { value: "4", label: "Semaines :" },
      { value: "3", label: "Seance" },
    ],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800",
    title: "Reprise Progressive de l'Activité Physique",
    stats: [
      { value: "4", label: "Semaines :" },
      { value: "3", label: "Seance" },
    ],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800",
    title: "Reprise Progressive de l'Activité Physique",
    stats: [
      { value: "4", label: "Semaines :" },
      { value: "3", label: "Seance" },
    ],
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800",
    title: "Reprise Progressive de l'Activité Physique",
    stats: [
      { value: "4", label: "Semaines :" },
      { value: "3", label: "Seance" },
    ],
  },
];

export default function LibraryPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <HeaderLayout
        title="Ma Bibliothèque"
        subtitle="Téléversez des vidéos, créez des programmes et modifiez-les."
        icon={<i className="icon-library text-[30px]" />}
        showNotification={true}
        showGradient={true}
      />

      <div className="flex-1 flex flex-col p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* --- Toolbar --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ToggleGroupTabs defaultValue="programmes" className="w-auto">
            <ToggleGroupTabsList>
              <ToggleGroupTabsTrigger value="programmes">
                Programmes
              </ToggleGroupTabsTrigger>
              <ToggleGroupTabsTrigger value="seances">
                Seances
              </ToggleGroupTabsTrigger>
              <ToggleGroupTabsTrigger value="exercices">
                Exercices
              </ToggleGroupTabsTrigger>
              <ToggleGroupTabsTrigger value="test">
                bibliotheque de test
              </ToggleGroupTabsTrigger>
            </ToggleGroupTabsList>
          </ToggleGroupTabs>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 border-gray-200 text-gray-400 rounded-xl"
            >
              <Filter className="h-5 w-5" />
            </Button>

            <InputGroup className="w-72 border-gray-100 group-focus-within:border-[#00BEBB]/50 h-11">
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

        {/* --- Content Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-8">
          {/* Create Button Card */}
          <div className="h-auto">
             <DashedCreateCard 
                label="Créer un programme" 
                onClick={() => console.log("Create clicked")}
                className="h-full"
              />
          </div>

          {/* Program Cards */}
          {PROGRAMS.map((program) => (
            <CustomCard
              key={program.id}
              image={program.image}
              title={program.title}
              stats={program.stats}
              showActions={true}
              className="hover:shadow-lg transition-all duration-300 h-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
