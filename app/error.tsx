"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>

      <section className="card error-card">
        <span className="chip chip-yellow">RECORDERYS</span>
        <h1>No hemos podido cargar esta pantalla</h1>
        <p className="muted">
          Puede ser un archivo demasiado pesado, una conexión móvil inestable o
          una carga que se ha quedado a medias.
        </p>
        <div className="error-card__actions">
          <button className="button button-primary" onClick={reset} type="button">
            Intentar de nuevo
          </button>
          <Link className="button button-secondary" href="/dashboard">
            Volver al dashboard
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
