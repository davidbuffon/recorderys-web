import type { Metadata } from "next";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Entrar — Recorderys",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LegalFooter />
    </>
  );
}
