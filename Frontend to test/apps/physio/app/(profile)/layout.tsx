import { Poppins } from "next/font/google";
import "../globals.css";
import StoreProvider from "@/components/providers/store-provider";
import ProtectedRoute from "@/components/guards/protected-route";
import { Toaster } from "../../../../libs/shared/ui/src/components/sonner";

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "100", "200", "300", "500", "600", "700", "800", "900"] 
});

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={poppins.className} suppressHydrationWarning>
        <StoreProvider>
          <ProtectedRoute>{children}</ProtectedRoute>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
