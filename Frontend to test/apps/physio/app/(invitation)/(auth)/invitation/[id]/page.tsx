'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePreviewInvitationQuery } from '@/store/api/auth-api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Image from 'next/image';

export default function InvitationRoutingPage() {
  const router = useRouter();
  const params = useParams();
  
  const invitationId = typeof params?.id === 'string' ? params.id : '';

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  const { data, error, isLoading } = usePreviewInvitationQuery(
    { invitationId }, 
    { skip: !invitationId }
  );

  useEffect(() => {
    if (!data || !invitationId) return;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pc_invite_id', invitationId);
      sessionStorage.setItem('pc_invite_email', data.invitedEmail || '');
      sessionStorage.setItem('pc_invite_first_name', data.invitedFirstName || '');
      sessionStorage.setItem('pc_invite_cabinet_name', data.cabinetName || '');
      sessionStorage.setItem('pc_invite_target_profile_type', data.targetProfileType || '');
      sessionStorage.setItem('pc_invite_requires_prof', String(data.requiresProfessionalNumber ?? false));
    }


    if (data.accountExists) {
      if (isAuthenticated) {
        const registrationUrl = data.targetProfileType === 'MEMBER' ? `/invitation/complete-profile/practitioner` : `/invitation/complete-profile/assistant`;
        router.push(registrationUrl);
      } else {
        router.push(`/login?inviteContext=true`);
      }
    } else {
      const registrationUrl = data.targetProfileType === 'MEMBER' ? `/invitation/register/practitioner` : `/invitation/register/assistant`;
      router.push(registrationUrl);
    }
  }, [data, invitationId, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-600">Vérification de votre invitation en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen py-8 md:px-8 px-4 flex flex-col items-end bg-gray-50">
        <div className="w-full flex items-start">
          <Image
            src="/logo.png"
            alt="Logo Clinique"
            width={100}
            height={40}
            className="inline-block"
            priority
            onClick={() => router.push('/login')}
          />
        </div>  
  
        <div className="h-full w-full flex items-center justify-center">
          <div className="max-w-md p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-red-500 font-semibold mb-2">Invitation Invalide ou Expirée</p>
            <p className="text-xs text-gray-500">Veuillez contacter votre administrateur de cabinet pour obtenir un nouveau lien.</p>
          </div>
        </div>
      </div>  
    );
  }

  return null;
}