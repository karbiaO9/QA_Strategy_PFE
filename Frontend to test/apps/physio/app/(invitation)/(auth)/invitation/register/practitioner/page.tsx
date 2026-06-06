'use client'

import { AuthRegisterLayout } from '@/components/auth/auth-register-layout'
import { ConditionsDialog } from '@/components/auth/conditions-dialog';
import { useAcceptInvitationMutation } from '@/store/api/auth-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldLabel, Input, showToast } from '@physio-connect-frontend/shared-ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const practitionerFormSchema = z.object({
  cabinetName: z.string()
    .min(1, 'Ce champ est obligatoire'),
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
  professionalNumber: z.string()
    .min(1, 'Ce champ est obligatoire')    
    .regex(/^\d+$/, 'Le numéro professionnel doit contenir uniquement des chiffres')
    .refine((val) => [9, 11].includes(val.length), {
      message: 'Le numéro professionnel doit contenir 9 chiffres (ADELI) ou 11 chiffres (RPPS)',
    }),
  cguAccepted: z.boolean()
    .default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// We extract the TypeScript type directly from the Zod schema
type PractitionerFormValues = z.input<typeof practitionerFormSchema>

export default function PractitionerSignupPage() {
  const [acceptInvitation, { isLoading: isApiLoading }] = useAcceptInvitationMutation();
  const [inviteId, setInviteId] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    } = useForm<PractitionerFormValues>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      cabinetName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      professionalNumber: '',
      cguAccepted: false,
    }
  })

  useEffect(() => {
    const id = sessionStorage.getItem('pc_invite_id');
    const email = sessionStorage.getItem('pc_invite_email');
    const firstName = sessionStorage.getItem('pc_invite_first_name');
    const cabinetName = sessionStorage.getItem('pc_invite_cabinet_name');

    if (!id) {
      router.push('/login');
      return;
    }

    setInviteId(id);
    if (email) setValue('email', email);
    if (firstName) setValue('firstName', firstName);
    if (cabinetName) setValue('cabinetName', cabinetName);
  }, [setValue, router]);

  const onSubmit = async (data: PractitionerFormValues) => {
    if (!inviteId) return;

    const { cabinetName, email, confirmPassword, cguAccepted, ...payload } = data;

    if (!cguAccepted) return showToast("Veuillez accepter les conditions d'utilisation.", "error");

    try {
      await acceptInvitation({
        invitationId: inviteId,
        cguAccepted: true,
        passwordConfirmation : confirmPassword,
        ...payload
      }).unwrap();

      // Clean transactional space state parameters safely 
      sessionStorage.removeItem('pc_invite_id');
      router.push('/login');
    } catch (err: any) {
      console.log(err.data?.message || "Erreur lors de la création du compte.");
    }
  };

  return (
    <AuthRegisterLayout
      title='Créer un compte'
      confirmText='Créer mon compte'
      isLoading={isApiLoading}
    >
      <form id="register-form" onSubmit={handleSubmit(onSubmit)} className='grid sm:grid-cols-2 gap-x-5 sm:gap-y-7 gap-y-6'>
        <Field>
          <FieldLabel htmlFor="cabinetName">Nom du cabinet</FieldLabel>
          <Input id="cabinetName" autoComplete="off" {...register("cabinetName")} placeholder="Entrer nom du cabinet" />
          {errors.cabinetName && <p className="text-red-500 text-xs mt-1">{errors.cabinetName.message}</p>}
        </Field>
  
        <Field>
          <FieldLabel htmlFor="profileType">Votre profil</FieldLabel>
          <Input id="profileType" autoComplete="off" value={"Kinésithérapeute dans un cabinet de groupe"} disabled={true} />
        </Field>
  
        <Field>
          <FieldLabel htmlFor="lastName">Nom*</FieldLabel>
          <Input id="lastName" autoComplete="off" {...register("lastName")} placeholder="Entrer votre nom" />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </Field>
  
        <Field>
          <FieldLabel htmlFor="firstName">Prénom*</FieldLabel>
          <Input id="firstName" autoComplete="off" {...register("firstName")} placeholder="Entrer votre prénom" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </Field>
  
        <Field>
          <FieldLabel htmlFor="email">Adresse email*</FieldLabel>
          <Input id="email" type="email" autoComplete="off" {...register("email")} placeholder="Entrer l'adresse email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </Field>
  
        <Field>
          <FieldLabel htmlFor="phone">Numéro de Téléphone*</FieldLabel>
          <Input id="phone" autoComplete="off" {...register("phone")} placeholder="Entrer Numéro de téléphone" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </Field>
  
        <Field>
          <FieldLabel htmlFor="password">Entrer Mot de passe*</FieldLabel>
          <Input id="password" type="password" autoComplete="off" {...register("password")} placeholder="Entrer mot de passe" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </Field>
  
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmer Mot de passe*</FieldLabel>
          <Input id="confirmPassword" type="password" autoComplete="off" {...register("confirmPassword")} placeholder="Confirmer mot de passe" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </Field>

        <Field>
          <FieldLabel htmlFor="professionalNumber">Numéro ADELI/RPPS*</FieldLabel>
          <Input id="professionalNumber" autoComplete="off" {...register("professionalNumber")} placeholder="Entrer Numéro ADELI/RPPS" />
          {errors.professionalNumber && <p className="text-red-500 text-xs mt-1">{errors.professionalNumber.message}</p>}
        </Field>
      
        <label className="flex items-center gap-2.5 cursor-pointer sm:col-span-2">
          <input type="checkbox" {...register("cguAccepted")} className="w-4 h-4 border-gray-300 rounded focus:ring-ring cursor-pointer disabled:cursor-not-allowed" />
          <ConditionsDialog></ConditionsDialog>
        </label>
      </form>
    </AuthRegisterLayout>
  )
}