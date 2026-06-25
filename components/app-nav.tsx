import Link from "next/link";
import { Brand } from "@/components/brand";

type AppNavProps = {
  /** Enlace contextual de "volver" cuando el destino no está ya en la navegación global. */
  backHref?: string;
  backLabel?: string;
  isAdmin?: boolean;
};

/**
 * Navegación superior común a toda pantalla autenticada.
 * Mantiene siempre el mismo conjunto de accesos (Dashboard, Soporte, Perfil,
 * Revisar tickets si es admin) y Cerrar sesión con un peso visual menor que
 * la acción principal de cada pantalla.
 */
export function AppNav({ backHref, backLabel, isAdmin = false }: AppNavProps) {
  return (
    <nav className="dashboard__nav">
      <Brand />
      <div className="dashboard__nav-actions">
        {backHref ? (
          <Link className="button button-secondary" href={backHref}>
            {backLabel ?? "Volver"}
          </Link>
        ) : null}
        <Link className="button button-secondary" href="/dashboard">
          Dashboard
        </Link>
        <Link
          className="button button-secondary"
          href={isAdmin ? "/admin/messages" : "/messages"}
        >
          Soporte
        </Link>
        {isAdmin ? (
          <Link className="button button-secondary" href="/admin/receipts">
            Revisar tickets
          </Link>
        ) : null}
        <Link className="button button-secondary" href="/profile">
          Perfil
        </Link>
        <form action="/auth/signout" method="post">
          <button className="nav-signout" type="submit">
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}
