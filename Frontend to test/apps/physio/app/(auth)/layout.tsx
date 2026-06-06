import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";
import PublicRoute from "@/components/guards/public-route";
import StoreProvider from "@/components/providers/store-provider";
import { Toaster } from "../../../../libs/shared/ui/src/components/sonner";

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "100", "200", "300", "500", "600", "700", "800", "900"] 
});

export const metadata: Metadata = {
  title: "XXX - Auth",
  description: "XXX Authentication",
};

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={poppins.className} suppressHydrationWarning>
        <StoreProvider>
          <PublicRoute>{children}</PublicRoute>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
