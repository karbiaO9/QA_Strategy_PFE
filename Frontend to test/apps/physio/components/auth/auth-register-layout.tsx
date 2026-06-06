'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { AuthHeader } from './auth-header';
import { FieldGroup } from '@physio-connect-frontend/shared-ui';

interface AuthRegisterLayoutProps {
  title: string;
  confirmText: string;
  children: React.ReactNode;
  isLoading?: boolean; 
}

export function AuthRegisterLayout({ title, confirmText, children, isLoading }: AuthRegisterLayoutProps) {
  const router = useRouter();

  return (
    <div className="w-full h-full min-h-[100vh] py-8 md:px-8 px-4 !pb-24 flex flex-col items-end bg-white">
      <div className="w-full mb-10">
        <Image src="/logo.png" alt="Logo" width={100} height={40} className="inline-block" priority />
      </div>  

      <div className="h-full w-full md:px-6 sm:px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <AuthHeader title={title} />

          <FieldGroup>
              {children}

              <div className='grid sm:grid-cols-2 sm:gap-5 gap-1'>
                <button
                  type="button"
                  className="w-full bg-[#F2F2F2] hover:bg-gray-200 font-medium py-2.5 rounded-lg transition-colors duration-200 mt-4"
                  onClick={() => router.push('/login')}
                >
                  J'ai un compte, <span className='underline'>Se connecter</span>
                </button>
                <button
                  type="submit"
                  form="register-form"
                  disabled={isLoading}
                  className="w-full bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors duration-200 mt-4"
                >
                  {isLoading ? 'Chargement...' : confirmText}
                </button>
              </div>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}