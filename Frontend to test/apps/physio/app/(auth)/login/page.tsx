'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AuthHeader } from '@/components/auth/auth-header'
import { Field, FieldGroup, FieldLabel, Input, showToast } from '@physio-connect-frontend/shared-ui'
import { useRouter, useSearchParams } from 'next/navigation'
// Import the login mutation
import { useLoginMutation } from '@/store/api/auth-api'

const loginSchema = z.object({
  emailOrPhone: z.string()
    .min(1, 'Ce champ est obligatoire')
    .refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^\d{8,15}$/.test(val.replace(/\D/g, ''));
      return isEmail || isPhone;
    }, {
      message: 'Veuillez entrer un email ou un numéro de téléphone valide',
    }),
  password: z.string()
    .min(1, 'Ce champ est obligatoire')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  rememberMe: z.boolean().default(false).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isInviteContext = searchParams.get('inviteContext') === 'true';

  const router = useRouter();
  
  const [login, { isLoading: isApiLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login({
        email: data.emailOrPhone,
        password: data.password
      }).unwrap();

      const pendingInviteId = sessionStorage.getItem('pc_invite_id');
      const pendingInviteProfileType = sessionStorage.getItem('pc_invite_target_profile_type');

      if (isInviteContext && pendingInviteId && pendingInviteProfileType) {
        const url =
          pendingInviteProfileType === 'MEMBER'
            ? '/invitation/complete-profile/practitioner'
            : '/invitation/complete-profile/assistant';

        router.push(url);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.log("Login failed:", error);
    }
  };

  const isLoading = isSubmitting || isApiLoading;

  return (
    <div className="h-screen bg-white p-4 flex overflow-hidden">
      {/* Section gauche - Formulaire */}
      <div className="w-full lg:w-2/5 flex flex-col py-3 md:px-3">
        <div className="mb-10">
          <Image
            src="/logo.png"
            alt="Logo Clinique"
            width={100}
            height={40}
            className="inline-block"
            priority
          />
        </div>  

        <div className="flex-1 flex items-center justify-center md:px-6">
          <div className="w-full max-w-md">
            <AuthHeader 
                title='Bienvenue'
                subtitle='Connectez-vous pour avoir accès à votre compte'
            />

            {/* 3. Wrap in a standard form with handleSubmit */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                  <Field>
                      <FieldLabel htmlFor="emailOrPhone">Numéro ou adresse email <span className="text-destructive">*</span></FieldLabel>
                      <Input 
                          id="emailOrPhone" 
                          type="text" // Changed from email to text to allow phone numbers
                          autoComplete="username" 
                          {...register("emailOrPhone")}
                          disabled={isLoading}
                          placeholder="Entrer Numéro ou adresse email" 
                      />
                      {errors.emailOrPhone && (
                        <p className="text-xs text-destructive mt-1">{errors.emailOrPhone.message}</p>
                      )}
                  </Field>

                  <Field>
                      <FieldLabel htmlFor="password">Mot de passe <span className="text-destructive">*</span></FieldLabel>
                      <Input 
                          id="password" 
                          type="password"
                          autoComplete="current-password" 
                          {...register("password")}
                          disabled={isLoading}
                          placeholder="Entrer mot de passe" 
                      />
                      {errors.password && (
                        <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                      )}
                  </Field>

                  <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mt-4"
                  >
                      {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('rememberMe')}
                          disabled={isLoading}
                          className="w-4 h-4 border-gray-300 rounded focus:ring-ring cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="ml-2 text-sm font-medium text-black">Se souvenir de moi</span>
                      </label>
                      <Link 
                      href="/forgot-password" 
                      className="text-sm text-right text-purple-600 hover:text-purple-700 font-medium"
                      >
                      Mot de passe oublié?
                      </Link>
                  </div>
              </FieldGroup>
            </form>

            <div className="text-center mt-10">
              <p className="text-sm text-black">
                Vous n'avez pas de compte ?{' '}
                <Link href="/register" className="text-cyan-500 hover:text-cyan-600 font-medium">
                  Inscrivez-vous ici
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Image */}
      <div className="hidden lg:flex lg:w-3/5">
        <div className="relative w-full h-full rounded-[20px] overflow-hidden">
          <Image
            src="/login.png"
            alt="Physiotherapy"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}