'use client';

import { Poppins } from 'next/font/google';
import '../globals.css';
import StoreProvider from '@/components/providers/store-provider';
import { MainLayout } from '@/components/layouts/main-layout';
import { physioSidebarItems } from '@/config/sidebar';
import { Toaster } from "../../../../libs/shared/ui/src/components/sonner";

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "100", "200", "300", "500", "600", "700", "800", "900"] 
});

export default function ProtectedLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {

  return (
    <html lang='fr' className='h-screen overflow-hidden'>
      <body className={`${poppins.className} antialiased h-screen overflow-hidden`} suppressHydrationWarning>
        <StoreProvider>
          <MainLayout sidebarItems={physioSidebarItems}>
            {children}
          </MainLayout>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}