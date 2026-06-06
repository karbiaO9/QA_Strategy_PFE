'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { useResetPasswordMutation } from '@/store/api/auth-api'

import { AuthHeader } from '@/components/auth/auth-header'
import { Field, FieldGroup, FieldLabel, Input } from '@physio-connect-frontend/shared-ui'
import { AuthPasswordLayout } from '@/components/auth/auth-password-layout'

const resetPasswordSchema = z.object({
  password: z.string()
    .min(1, 'Ce champ est obligatoire')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
    .min(1, 'Ce champ est obligatoire'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams() // Now this is safely inside Suspense
  
  const email = searchParams.get('email') || ''
  const resetToken = searchParams.get('token') || ''

  const [resetPassword, { isLoading: isApiLoading }] = useResetPasswordMutation()

  useEffect(() => {
    if (!email || !resetToken) {
      router.replace('/forgot-password')
    }
  }, [email, resetToken, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await resetPassword({
        email,
        resetToken,
        newPassword: data.password 
      }).unwrap()
      router.push('/login')
    } catch (error: any) {
      console.log("ResetPassword failed", error)
    }
  }

  const isLoading = isSubmitting || isApiLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">
            Nouveau mot de passe <span className="text-destructive">*</span>
          </FieldLabel>
          <Input 
            id="password" 
            type="password"
            autoComplete="new-password" 
            {...register("password")}
            disabled={isLoading}
            placeholder="Entrer le nouveau mot de passe" 
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Confirmer le mot de passe <span className="text-destructive">*</span>
          </FieldLabel>
          <Input 
            id="confirmPassword" 
            type="password"
            autoComplete="new-password" 
            {...register("confirmPassword")}
            disabled={isLoading}
            placeholder="Confirmer le mot de passe" 
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </Field>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors duration-200 mt-4"
        >
          {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
        </button>
      </FieldGroup>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthPasswordLayout>
      <AuthHeader 
        title='Nouveau mot de passe'
        subtitle='Veuillez choisir un mot de passe solide pour sécuriser votre compte'
      />
      <Suspense fallback={
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      }>
        <ResetPasswordFormInner />
      </Suspense>
    </AuthPasswordLayout>
  )
}