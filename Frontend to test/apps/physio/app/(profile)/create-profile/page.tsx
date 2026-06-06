'use client'

import { Field, FieldLabel, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, showToast } from '@physio-connect-frontend/shared-ui'
import { AuthRegisterLayout } from '@/components/auth/auth-register-layout'
import { useState } from 'react';
import LiberalForm from './_components/liberal-form';
import AdminForm from './_components/admin-form';
import StudentForm from './_components/student-form';
import { ConditionsDialog } from '@/components/auth/conditions-dialog';
import { useAddProfileMutation } from '@/store/api/auth-api';
import { useRouter } from 'next/navigation';

export default function CreateProfilePage() {
  const [profileType, setProfileType] = useState<string>('LIBERAL');
  const [cguAccepted, setCguAccepted] = useState<boolean>(false);
  const [addProfile, { isLoading }] = useAddProfileMutation();
  const router = useRouter();

  const handleFormSubmit = async (data: any) => {
    if (!cguAccepted) return showToast("Veuillez accepter les conditions d'utilisation.", "error");

    const formData = new FormData();
    
    // 1. Mandatory base fields
    formData.append('profileType', profileType);
    formData.append('cguAccepted', String(cguAccepted));

    // 2. Logic-based mapping
    Object.keys(data).forEach(key => {
      if (key === 'justificatif' && data[key][0]) {
        formData.append('justificatif', data[key][0]); // Append the File object
      } else if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    try {
      await addProfile(formData).unwrap();
      router.push('/');
    } catch (err) {
      console.log("Error adding profile. Please check your details.");
    }
  };

  return (
    <AuthRegisterLayout
      title='Créer un profil'
      confirmText='Créer mon profil'
      isLoading={isLoading}
    >
      <Field>
        <FieldLabel htmlFor="profil">Choisir votre profil*</FieldLabel>
        <Select defaultValue="LIBERAL" onValueChange={setProfileType}>
          <SelectTrigger className='bg-white mb-2.5'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position='popper' className="w-[var(--radix-select-trigger-width)]">
            <SelectGroup>
              <SelectItem value="LIBERAL">Praticien libéral dans un cabinet individuel</SelectItem>
              <SelectItem value="ADMIN_GROUP">Kinésithérapeute dans un cabinet de groupe (administrateur)</SelectItem>
              <SelectItem value="STUDENT">Etudiant en  masso-kinésithérapie</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <div className='grid sm:grid-cols-2 gap-x-5 sm:gap-y-7 gap-y-6'>
        {profileType === 'LIBERAL' && <LiberalForm onSubmit={handleFormSubmit} />}
        {profileType === 'ADMIN_GROUP' && <AdminForm onSubmit={handleFormSubmit} />}
        {profileType === 'STUDENT' && <StudentForm onSubmit={handleFormSubmit} />}
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={cguAccepted} 
          onChange={(e) => setCguAccepted(e.target.checked)}
          className="w-4 h-4 border-gray-300 rounded focus:ring-ring cursor-pointer disabled:cursor-not-allowed"
        />
        <ConditionsDialog></ConditionsDialog>
      </label>
    </AuthRegisterLayout>
  )
}