"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, Input } from "@physio-connect-frontend/shared-ui";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const MAX_FILE_SIZE = 5000000; // 5 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const studentFormSchema = z.object({
  school: z.string()
    .min(1, 'Ce champ est obligatoire'),
  city: z.string()
    .min(1, 'Ce champ est obligatoire'),
  academicYear: z.string()
    .min(1, 'Ce champ est obligatoire')
    .regex(/^\d+$/, 'Année académique invalide')
    .refine((val) => Number(val) <= 5, {
      message: 'L’année académique ne doit pas dépasser 5',
    }),
  justificatif: z.any()
    .refine((files) => files?.length === 1, "Le justificatif est requis.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `La taille max est de 5Mo.`)
    .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Seuls les formats .pdf, .jpg, .jpeg, .png sont acceptés."),
})

type StudentFormValues = z.input<typeof studentFormSchema>

export default function StudentForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  // React Hook Form handles all state and validation optimally
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      school: '',
      city: '',
      academicYear: ''
    }
  })

  return (
    <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="contents">
      <Field>
        <FieldLabel>École*</FieldLabel>
        <Input {...register("school")} placeholder="Entrer votre école" />
        {errors.school && <p className="text-red-500 text-xs">{errors.school.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>Ville*</FieldLabel>
        <Input {...register("city")} placeholder="Entrer votre ville" />
        {errors.city && <p className="text-red-500 text-xs">{errors.city.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>Année d'études*</FieldLabel>
        <Input type="number" {...register("academicYear")} placeholder="Entrer votre année" />
        {errors.academicYear && <p className="text-red-500 text-xs">{errors.academicYear.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel>Justificatif (PDF, JPG, PNG)*</FieldLabel>
        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register("justificatif")} />
        {errors.justificatif && <p className="text-red-500 text-xs">{errors.justificatif.message as string}</p>}
      </Field>
    </form>
  );
}