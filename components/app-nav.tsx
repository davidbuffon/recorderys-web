"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";

type AppNavProps = {
  backHref?: string;
  backLabel?: string;
  isAdmin?: boolean;
};

export function AppNav({ backHref, backLabel, isAdmin = false }: AppNavProps) {
  const pathname = usePathname();

  function navClass(...hrefs: string[]) {
    const active = hrefs.some(
      (href) => pathname === href || pathname.startsWith(href + "/"),
    );
    return active ? "button button-nav-active" : "button button-nav";
  }

  return (
    <nav className="dashboard__nav">
      <Brand />
      <div className="dashboard__nav-actions">
        {backHref ? (
          <Link className="button button-nav" href={backHref}>
            {backLabel ?? "Volver"}
          </Link>
        ) : null}
        <Link className={navClass("/dashboard")} href="/dashboard">
          Panel
        </Link>
        <Link
          className={navClass("/messages", "/admin/messages")}
          href={isAdmin ? "/admin/messages" : "/messages"}
        >
          Soporte
        </Link>
        {isAdmin ? (
          <Link className={navClass("/admin/receipts")} href="/admin/receipts">
            Tickets
          </Link>
        ) : null}
        <Link className={navClass("/profile")} href="/profile">
          Perfil
        </Link>
      </div>
    </nav>
  );
}
