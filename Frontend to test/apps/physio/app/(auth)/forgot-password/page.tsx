'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useForgotPasswordMutation } from '@/store/api/auth-api' 
import { AuthHeader } from '@/components/auth/auth-header'
import { Field, FieldGroup, FieldLabel, Input } from '@physio-connect-frontend/shared-ui'
import { AuthPasswordLayout } from '@/components/auth/auth-password-layout'

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Ce champ est obligatoire')
    .refine((val) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, {
      message: 'Veuillez entrer un email valide',
    }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [forgotPassword, { isLoading: isApiLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  })

  // 2. Optimized Submit Handler
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(data.email).unwrap();
      router.push(`/verify-code?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.log("ForgotPassword request failed", error);
    }
  }

  const isLoading = isSubmitting || isApiLoading;

  return (
    <AuthPasswordLayout>
      <AuthHeader 
        title='Mot de passe oublié?'
        subtitle='Veuillez tapez votre adresse email pour avoir le code de réinitialisation de mot de passe'
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">
              Adresse email <span className="text-destructive">*</span>
            </FieldLabel>
            <Input 
              id="email" 
              type="email"
              autoComplete="email" 
              {...register("email")}
              disabled={isLoading}
              placeholder="Entrer l'adresse email" 
            />
            {/* Display Zod validation errors */}
            {errors.email && (
              <span className="text-xs text-destructive mt-1">
                {errors.email.message}
              </span>
            )}
          </Field>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mt-4"
          >
            {isLoading ? 'Envoi en cours...' : 'Récupérer code'}
          </button>
        </FieldGroup>
      </form>
    </AuthPasswordLayout>
  )
}