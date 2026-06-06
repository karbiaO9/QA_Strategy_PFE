import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

interface AuthPasswordLayoutProps {
  children: React.ReactNode;
}

export function AuthPasswordLayout({ children }: AuthPasswordLayoutProps) {
  const router = useRouter();

  return (
    <div className="h-screen w-full py-8 md:px-8 px-4 flex flex-col items-end bg-white">
      <div className="w-full mb-10 flex items-center justify-between">
        <ArrowLeft 
          className='text-primary hover:cursor-pointer'
          onClick={() => router.push('/login')}
        ></ArrowLeft>

        <Image
          src="/logo.png"
          alt="Logo Clinique"
          width={100}
          height={40}
          className="inline-block"
          priority
        />
      </div>  

      <div className="h-full w-full mt-10 md:px-6 flex justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}