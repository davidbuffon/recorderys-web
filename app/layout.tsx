import type { Metadata, Viewport } from "next";
import { Baloo_2, Inter } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eff8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1928" },
  ],
};

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

const themeInitScript = `(function(){try{var t=localStorage.getItem("recorderys_theme");if(t==="dark"){document.documentElement.dataset.theme="dark"}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${baloo.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <div className="site-content">{children}</div>
        <CookieConsent />
      </body>
    </html>
  );
}
