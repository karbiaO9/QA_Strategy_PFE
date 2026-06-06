import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin - Login",
  description: "Admin login page",
};

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}
