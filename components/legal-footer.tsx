import Link from "next/link";
import { Brand } from "@/components/brand";
import { hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";

const legalLinks = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/terminos", label: "Términos" },
];

async function getBrandHref() {
  if (!hasSupabaseEnv()) {
    return "/dashboard";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? "/dashboard" : "/";
}

export async function LegalFooter() {
  const brandHref = await getBrandHref();

  return (
    <footer className="legal-footer">
      <div className="legal-footer__brand">
        <Link className="legal-footer__brand-link" href={brandHref}>
          <Brand tagline="Tu App de garantía." />
        </Link>
      </div>

      <nav className="legal-footer__links" aria-label="Enlaces legales">
        {legalLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
        <button type="button" data-cookie-settings>
          Preferencias de cookies
        </button>
      </nav>
    </footer>
  );
}
