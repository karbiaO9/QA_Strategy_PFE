"use client"

import { useRegisterMutation } from "@/store/api/auth-api";
import { isValidLuhn } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, Input, showToast } from "@physio-connect-frontend/shared-ui";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const liberalFormSchema = z.object({
  firstName: z.string()
    .min(1, 'Ce champ est obligatoire'),
  lastName: z.string()
    .min(1, 'Ce champ est obligatoire'),
  email: z.string()
    .min(1, 'Ce champ est obligatoire')
    .refine((val) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, {
      message: 'Veuillez entrer un email valide',
    }),
  phone: z.string()
    .min(1, 'Ce champ est obligatoire')
    .refine((val) => {
      const normalized = val.replace(/\s|-/g, ''); // remove spaces and dashes
      return /^(0\d{9}|\+33\d{9})$/.test(normalized);
    }, {
      message: 'Veuillez entrer un numéro de téléphone français valide',
    }),
  password: z.string()
    .min(1, 'Ce champ est obligatoire')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
    .min(1, 'Ce champ est obligatoire')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
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
  isReplacement: z.boolean()
    .default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type LiberalFormValues = z.input<typeof liberalFormSchema>

export default function AdminForm({ cguAccepted, onLoading }: { cguAccepted: boolean, onLoading: (val: boolean) => void }) {
  const [registerApi, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  useEffect(() => {
    onLoading(isLoading);
  }, [isLoading, onLoading]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LiberalFormValues>({
    resolver: zodResolver(liberalFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      cabinetName: '',
      professionalNumber: '',
      siret: '',
      street: '',
      postalCode: '',
      city: '',
      isReplacement: false,
    }
  })

  const onSubmit = async (data: LiberalFormValues) => {
    if (!cguAccepted) return showToast("Veuillez accepter les conditions d'utilisation.", "error");

    const { confirmPassword, ...payload } = data;

    try {
      await registerApi({
        profileType: 'LIBERAL',
        cguAccepted: true,
        passwordConfirmation : confirmPassword,
        ...payload
      }).unwrap();
      router.push('/login');
    } catch (err) {
      console.log("Erreur d'inscription:", err);
    }
  };

  return (
    <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="contents">
      <Field>
        <FieldLabel htmlFor="lastName">Nom*</FieldLabel>
        <Input id="lastName" {...register("lastName")} placeholder="Entrer votre nom" />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="firstName">Prénom*</FieldLabel>
        <Input id="firstName" {...register("firstName")} placeholder="Entrer votre prénom" />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Adresse email*</FieldLabel>
        <Input id="email" type="email" {...register("email")} placeholder="Entrer l'adresse email" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">Numéro de Téléphone*</FieldLabel>
        <Input id="phone" {...register("phone")} placeholder="Entrer Numéro de téléphone" />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Mot de passe*</FieldLabel>
        <Input id="password" type="password" {...register("password")} placeholder="Entrer mot de passe" />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="confirmPassword">Confirmer Mot de passe*</FieldLabel>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="Confirmer mot de passe" />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="cabinetName">Nom du cabinet*</FieldLabel>
        <Input id="cabinetName" {...register("cabinetName")} placeholder="Entrer nom du cabinet" />
        {errors.cabinetName && <p className="text-red-500 text-sm mt-1">{errors.cabinetName.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="professionalNumber">Numéro ADELI/RPPS*</FieldLabel>
        <Input id="professionalNumber" {...register("professionalNumber")} placeholder="Entrer Numéro ADELI/RPPS" />
        {errors.professionalNumber && <p className="text-red-500 text-sm mt-1">{errors.professionalNumber.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="siret">SIRET*</FieldLabel>
        <Input id="siret" {...register("siret")} placeholder="Entrer votre SIRET" />
        {errors.siret && <p className="text-red-500 text-sm mt-1">{errors.siret.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="street">Adresse*</FieldLabel>
        <Input id="street" {...register("street")} placeholder="Entrer votre adresse" />
        {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="postalCode">Code Postal*</FieldLabel>
        <Input id="postalCode" {...register("postalCode")} placeholder="Entrer votre code postal" />
        {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="city">Ville*</FieldLabel>
        <Input id="city" {...register("city")} placeholder="Entrer votre ville" />
        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
      </Field>

      <label className="flex items-center gap-2.5 cursor-pointer sm:col-span-2">
        <input type="checkbox" {...register("isReplacement")} className="w-4 h-4 border-gray-300 rounded focus:ring-ring cursor-pointer" />
        <span className="text-sm font-medium underline">J'exerce en tant que remplaçant</span>
      </label>
    </form>
  );
}