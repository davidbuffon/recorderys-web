import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RECORDERYS",
  description: "Guarda tus compras importantes y controla devoluciones y garantías.",
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
      <body>{children}</body>
    </html>
  );
}
