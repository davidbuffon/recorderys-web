"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell error-page">
      <nav className="dashboard__nav">
        <Brand />
        <Link className="button button-secondary" href="/dashboard">
          Dashboard
        </Link>
      </nav>

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
    </main>
  );
}
