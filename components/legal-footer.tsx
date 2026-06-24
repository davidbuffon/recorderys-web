import Link from "next/link";
import { Brand } from "@/components/brand";

const legalLinks = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/terminos", label: "Términos" },
];

export function LegalFooter() {
  return (
    <footer className="legal-footer">
      <div className="legal-footer__brand">
        <Brand tagline="Tu App de garantía." />
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
