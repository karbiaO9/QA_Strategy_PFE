"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"
import { Checkbox, CustomTableColumn, DialogModal, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, TableAction, TablePagination } from "@physio-connect-frontend/shared-ui"
import { Input } from "@physio-connect-frontend/shared-ui"
import { Field, FieldLabel } from "@physio-connect-frontend/shared-ui"
import { Funnel, Search, User, UserRoundPlus } from "lucide-react";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddPractitionerMutation } from "@/store/api/auth-api";

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

const appointmentColumns: CustomTableColumn[] = [
  { key: "name", header: "Nom", accessor: "name", width: "260px" },
  { key: "nbPatients", header: "Nbr de patients", accessor: "nbPatients" },
  { key: "numLicence", header: "Numero de licence", accessor: "numLicence" },
  { key: "dateStart", header: "date debut", accessor: "dateStart" },
  { key: "dateEnd", header: "date fin", accessor: "dateEnd" },
  { key: "rpps", header: "N° RPPS", accessor: "rpps" },
  { key: "role", header: "Rôle dans l'application", accessor: "role" },
];

const appointmentsData = [
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      name: "Ali Bayoudh",
      description: "alibayoudh44@gmail.com",
    },
    nbPatients: "24",
    numLicence: "164324726",
    dateStart: "14-08-2024",
    dateEnd: "13-08-2025",
    rpps: "1466",
    role: "Normal",
  },
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alonso",
      name: "Aliça Fernandez",
      description: "alicafernandez@gmail.com",
    },
    nbPatients: "24",
    numLicence: "164324726",
    dateStart: "14-08-2024",
    dateEnd: "13-08-2025",
    rpps: "1466",
    role: "Normal",
  },
];

const practitionerFormSchema = z.object({
  firstName: z.string()
    .min(1, 'Ce champ est obligatoire'),
  email: z.string()
    .min(1, 'Ce champ est obligatoire')
    .refine((val) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, {
      message: 'Veuillez entrer un email valide',
    }),
})

type PractitionerFormValues = z.input<typeof practitionerFormSchema>

export default function PractitionersPage() {
  const [addPractitionerApi, { isLoading }] = useAddPractitionerMutation();
  const [profileType, setProfileType] = useState<string>('MEMBER');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const eyeAction: TableAction[] = [
    {
      key: "view",
      icon: "eye",
      label: "Voir",
      handleClick: (row) => {
        router.push(`/practitioners/1`);
      },
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PractitionerFormValues>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      firstName: '',
      email: '',
    }
  })

  const onSubmit = async (data: PractitionerFormValues) => {
    try {
      await addPractitionerApi({
        targetProfileType: profileType,
        ...data,
      }).unwrap();
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.log("Erreur d'ajout:", err);
    }
  };

  return (
    <>
      <HeaderLayout
        title="kinés"
        subtitle="Gestion des profils des praticiens du cabinet dans l'application"
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

          <DialogModal
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) {
                reset();
                setProfileType('MEMBER');
              }
            }}
            trigger={
              <button className="bg-white flex items-center py-2 pl-4 lg:pr-4 pr-2 border border-primary text-primary rounded-xl">
                <UserRoundPlus className="w-4 h-4 mr-2" />
                <span className="hidden lg:block">Ajouter un praticien</span>
              </button>
            }
            title="Ajouter un praticien"
            color="primary"
            cancelText="Annuler"
            confirmText="Ajouter praticien"
            isConfirmDisabled={isLoading}
          >
            <div>
              <Field>
                <FieldLabel htmlFor="profil">Type du practition*</FieldLabel>
                <Select defaultValue="MEMBER" onValueChange={setProfileType}>
                  <SelectTrigger className='bg-white mb-2.5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position='popper' className="w-[var(--radix-select-trigger-width)]">
                    <SelectGroup>
                      <SelectItem value="MEMBER">Kinésithérapeute dans un cabinet de groupe</SelectItem>
                      <SelectItem value="ASSISTANT">Assistant</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <form id="dialog-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Field>
                    <FieldLabel htmlFor="firstName">Prénom du praticien *</FieldLabel>
                    <Input id="firstName" autoComplete="off" {...register("firstName")} placeholder="Entrer le prénom" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">Adresse email*</FieldLabel>
                    <Input id="email" autoComplete="off" {...register("email")} placeholder="Entrer adresse email" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </Field>
              </form>
            </div>
          </DialogModal>
        </div>
        
        {/* Appointments */}
        <ResponsiveTable
          columns={appointmentColumns}
          data={appointmentsData}
          actions={eyeAction} // For desktop CustomTable
          pagination={<ExamplePagination />}
          variant="default"
          statusStyle="progress-bar"
        />
      </div>
    </>
  );
}