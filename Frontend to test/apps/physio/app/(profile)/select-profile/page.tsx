"use client";

import { CustomAvatar } from "@physio-connect-frontend/shared-ui";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SelectProfilePage() {
  const router = useRouter();

  const UserProfile = ({ username, email }: { username: string; email: string }) => (
    <div className="flex items-center gap-3">
      <CustomAvatar
        src={undefined}
        fallbackText={username?.charAt(0)?.toUpperCase()}
        variant="circle"
        showBorder
        borderColor="primary"
        className="h-12 w-12 bg-white text-primary-500 shadow-sm"
      />
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-lg font-bold text-[#344054] truncate leading-tight">
          {username}
        </p>
        <p className="text-base text-gray-400 truncate leading-tight mt-0.5">
          {email}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-[100vh] p-10 flex items-center justify-center bg-white">
      <div className="w-[400px] border border-gray-100 rounded-xl">
        <div className="w-full flex justify-center mt-6 mb-8">
          <Image
            src="/logo.png"
            alt="Logo Clinique"
            width={120}
            height={60}
            className="inline-block"
            priority
          />
        </div>

        <h3 className="px-5 font-medium text-[15px] text-[#414246]">Veuillez sélectionner le profil que vous souhaitez utiliser.</h3>

        <div className="pt-4 pb-3 space-y-1.5">
          <div 
            className="px-5 py-2.5 rounded-xl hover:bg-[#F9FBFA] hover:cursor-pointer"
            onClick={() => router.push('/')}
          >
            <UserProfile username="John Doe" email="john@example.com" />
          </div>
          <div 
            className="px-5 py-2.5 rounded-xl hover:bg-[#F9FBFA] hover:cursor-pointer"
            onClick={() => router.push('/')}
          >
            <UserProfile username="Jane Doe" email="jane@example.com" />
          </div>
        </div>

        <div 
          className="p-5 flex items-center gap-2.5 text-[#414246] border-t border-t-gray-100 hover:bg-[#F9FBFA] hover:cursor-pointer"
          onClick={() => router.push('/create-profile')}
        >
          <Plus className="h-4 w-4"></Plus>
          <span className="text-base">Ajouter un profil</span>
        </div>
      </div>
    </div>
  );
}