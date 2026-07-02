import type { Metadata } from "next";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recorderys — Guarda tickets, garantías y devoluciones en un solo sitio",
  description: "Guarda tus tickets, controla devoluciones y nunca pierdas una garantía. Tu postcompra, organizada y siempre a mano.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand-icons/browser.png",
    shortcut: "/brand-icons/browser.png",
    apple: "/brand-icons/iphone.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RECORDERYS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="site-content">{children}</div>
        <CookieConsent />
      </body>
    </html>
  );
}
