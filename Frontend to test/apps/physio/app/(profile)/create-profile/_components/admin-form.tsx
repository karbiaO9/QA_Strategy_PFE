"use client"

import { RootState } from "@/store/store";
import { isValidLuhn } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, Input } from "@physio-connect-frontend/shared-ui";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import z from "zod";

const adminFormSchema = z.object({
  cabinetName: z.string()
    .min(1, 'Ce champ est obligatoire'),
  professionalNumber: z.string()
    .min(1, 'Ce champ est obligatoire')    
    .regex(/^\d+$/, 'Le numéro professionnel doit contenir uniquement des chiffres')
    .refine((val) => [9, 11].includes(val.length), {
      message: 'Le numéro professionnel doit contenir 9 chiffres (ADELI) ou 11 chiffres (RPPS)',
    }),
  siret: z.string()
    .min(1, 'Ce champ est obligatoire')
    .regex(/^\d+$/, 'Le SIRET doit contenir uniquement des chiffres')
    .length(14, 'Le SIRET doit contenir exactement 14 chiffres')
    .refine((val) => isValidLuhn(val), {
      message:
        'Le numéro SIRET doit être valide (14 chiffres et contrôle Luhn)',
    }),
  street: z.string()
    .min(1, 'Ce champ est obligatoire'),
  postalCode: z.string()
    .min(1, 'Ce champ est obligatoire'),
  city: z.string()
    .min(1, 'Ce champ est obligatoire'),
})

type AdminFormValues = z.input<typeof adminFormSchema>

export default function AdminForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const savedProfessionalNumber = useSelector((state: RootState) => state.auth.user?.professionalNumber);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      cabinetName: '',
      professionalNumber: '',
      siret: '',
      street: '',
      postalCode: '',
      city: '',
    }
  })

  useEffect(() => {
    if (savedProfessionalNumber) {
      setValue("professionalNumber", savedProfessionalNumber);
    }
  }, [savedProfessionalNumber, setValue]);

  return (
    <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="contents">
      <Field>
        <FieldLabel htmlFor="cabinetName">Nom du cabinet*</FieldLabel>
        <Input id="cabinetName" {...register("cabinetName")} placeholder="Entrer nom du cabinet" />
        {errors.cabinetName && <p className="text-red-500 text-xs">{errors.cabinetName.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="professionalNumber">Numéro ADELI/RPPS*</FieldLabel>
        <Input id="professionalNumber" {...register("professionalNumber")} placeholder="Entrer Numéro ADELI/RPPS" readOnly={!!savedProfessionalNumber} />
        {errors.professionalNumber && <p className="text-red-500 text-xs">{errors.professionalNumber.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="siret">SIRET*</FieldLabel>
        <Input id="siret" {...register("siret")} placeholder="Entrer SIRET" />
        {errors.siret && <p className="text-red-500 text-xs">{errors.siret.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="street">Adresse*</FieldLabel>
        <Input id="street" {...register("street")} placeholder="Entrer votre adresse" />
        {errors.street && <p className="text-red-500 text-xs">{errors.street.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="postalCode">Code Postal*</FieldLabel>
        <Input id="postalCode" {...register("postalCode")} placeholder="Entrer votre code postal" />
        {errors.postalCode && <p className="text-red-500 text-xs">{errors.postalCode.message as string}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="city">Ville*</FieldLabel>
        <Input id="city" {...register("city")} placeholder="Entrer votre ville" />
        {errors.city && <p className="text-red-500 text-xs">{errors.city.message as string}</p>}
      </Field>
    </form>
  );
}