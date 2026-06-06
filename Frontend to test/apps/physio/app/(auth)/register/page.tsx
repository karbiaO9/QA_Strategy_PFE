'use client'

import { useState } from 'react';
import { AuthRegisterLayout } from '@/components/auth/auth-register-layout'
import { Field, FieldLabel, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@physio-connect-frontend/shared-ui'
import LiberalForm from './_components/liberal-form';
import AdminForm from './_components/admin-form';
import StudentForm from './_components/student-form';

export default function SignupPage() {
  const [profile, setProfile] = useState<string>('LIBERAL');
  const [cguAccepted, setCguAccepted] = useState<boolean>(false);
  const [isFormLoading, setIsFormLoading] = useState(false); // Sync loading state

  return (
    <AuthRegisterLayout
      title='Créer un compte'
      confirmText='Créer mon compte'
      isLoading={isFormLoading}
    >
      <Field>
        <FieldLabel htmlFor="profil">Choisir votre profil*</FieldLabel>
        <Select defaultValue="LIBERAL" onValueChange={setProfile}>
          <SelectTrigger className='bg-white mb-2.5'><SelectValue /></SelectTrigger>
          <SelectContent position='popper' className="w-[var(--radix-select-trigger-width)]">
            <SelectGroup>
              <SelectItem value="LIBERAL">Praticien libéral</SelectItem>
              <SelectItem value="ADMIN_GROUP">Cabinet de groupe (administrateur)</SelectItem>
              <SelectItem value="STUDENT">Etudiant</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <div className='grid sm:grid-cols-2 gap-x-5 sm:gap-y-7 gap-y-6'>
        {profile === 'LIBERAL' && <LiberalForm cguAccepted={cguAccepted} onLoading={setIsFormLoading} />}
        {profile === 'ADMIN_GROUP' && <AdminForm cguAccepted={cguAccepted} onLoading={setIsFormLoading} />}
        {profile === 'STUDENT' && <StudentForm cguAccepted={cguAccepted} onLoading={setIsFormLoading} />}
      </div>

      {/* Checkbox remains here */}
      <label className="flex items-center gap-2.5 cursor-pointer mt-1.5">
        <input
          type="checkbox"
          checked={cguAccepted}
          onChange={(e) => setCguAccepted(e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
        />
        <span className="text-sm">J'accepte les conditions générales d'utilisation</span>
      </label>
    </AuthRegisterLayout>
  )
}