"use client"

import { useRegisterMutation } from "@/store/api/auth-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, Input, showToast } from "@physio-connect-frontend/shared-ui";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const MAX_FILE_SIZE = 5000000; // 5 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const studentFormSchema = z.object({
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type StudentFormValues = z.infer<typeof studentFormSchema>

export default function AdminForm({ cguAccepted, onLoading }: { cguAccepted: boolean, onLoading: (val: boolean) => void }) {
  const [registerApi, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  useEffect(() => {
    onLoading(isLoading);
  }, [isLoading, onLoading]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      school: '',
      city: '',
      academicYear: ''
    }
  })

  const onSubmit = async (data: StudentFormValues) => {
    if (!cguAccepted) return showToast("Veuillez accepter les conditions d'utilisation.", "error");

    const formData = new FormData();
    formData.append('profileType', 'STUDENT');
    formData.append('cguAccepted', String(true));
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('passwordConfirmation', data.confirmPassword);
    formData.append('school', data.school);
    formData.append('city', data.city);
    formData.append('academicYear', data.academicYear);

    if (data.justificatif && data.justificatif[0]) {
      formData.append('justificatif', data.justificatif[0]);
    }

    try {
      await registerApi(formData).unwrap();
      router.push('/login');
    } catch (err) {
      console.log("Erreur d'inscription:", err);
    }
  };

  return (
    <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="contents">
      <Field>
        <FieldLabel htmlFor="lastName">Nom*</FieldLabel>
        <Input id="lastName" autoComplete="off" {...register("lastName")} placeholder="Entrer votre nom" />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="firstName">Prénom*</FieldLabel>
        <Input id="firstName" autoComplete="off" {...register("firstName")} placeholder="Entrer votre prénom" />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Adresse email*</FieldLabel>
        <Input id="email" type="email" {...register("email")} autoComplete="off" placeholder="Entrer l'adresse email" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">Numéro de Téléphone*</FieldLabel>
        <Input id="phone" autoComplete="off" {...register("phone")} placeholder="Entrer Numéro de téléphone" />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Entrer Mot de passe*</FieldLabel>
        <Input id="password" type="password" autoComplete="off" {...register("password")} placeholder="Entrer mot de passe" />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="confirmPassword">Confirmer Mot de passe*</FieldLabel>
        <Input id="confirmPassword" type="password" autoComplete="off" {...register("confirmPassword")} placeholder="Confirmer mot de passe" />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="school">École*</FieldLabel>
        <Input id="school" autoComplete="off" {...register("school")} placeholder="Entrer votre école" />
        {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="city">Ville*</FieldLabel>
        <Input id="city" autoComplete="off" {...register("city")} placeholder="Entrer votre ville" />
        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="academicYear">Année d'études*</FieldLabel>
        <Input id="academicYear" autoComplete="off" {...register("academicYear")} placeholder="Entrer votre année" />
        {errors.academicYear && <p className="text-red-500 text-sm mt-1">{errors.academicYear.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="justificatif">Justificatif*</FieldLabel>
        <Input id="justificatif" type="file" autoComplete="off" {...register("justificatif")} accept=".pdf,.jpg,.jpeg,.png" placeholder="Choisir un justificatif" />
        {errors.justificatif && <p className="text-red-500 text-sm mt-1">{errors.justificatif.message as string}</p>}
      </Field>
    </form>
  );
}