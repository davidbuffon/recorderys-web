"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
  isAdmin?: boolean;
};

const HomeIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const AddIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SettingsIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.03Z" />
  </svg>
);

const ReviewIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h13l3 3v15l-2-1.5L16 21l-2-1.5L12 21l-2-1.5L8 21l-2-1.5L4 21Z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

const LogoutIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function AppShell({ children, isAdmin = false }: AppShellProps) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Inicio", icon: HomeIcon },
    { href: "/items/new", label: "Añadir", icon: AddIcon },
    ...(isAdmin
      ? [{ href: "/admin/receipts", label: "Revisar", icon: ReviewIcon }]
      : []),
    { href: "/profile", label: "Ajustes", icon: SettingsIcon },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/items/") && !pathname.startsWith("/items/new");
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link
          aria-label="Ir a la página de inicio de Recorderys"
          className="app-sidebar__logo"
          href="/"
          title="Página de inicio"
        >
          <img alt="" src="/brand-icons/browser.png" />
        </Link>
        <div className="app-sidebar__items">
          {items.map((item) => (
            <Link
              className={`app-sidebar__item ${isActive(item.href) ? "app-sidebar__item--active" : ""}`}
              href={item.href}
              key={item.href}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <form action="/auth/signout" method="post" className="app-sidebar__logout">
          <button aria-label="Cerrar sesión" title="Cerrar sesión" type="submit">
            {LogoutIcon}
          </button>
        </form>
      </aside>

      <main className="app-main">{children}</main>

      <nav className="app-tabbar">
        {items.map((item) => (
          <Link
            className={`app-tabbar__item ${isActive(item.href) ? "app-tabbar__item--active" : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
