import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Política de cookies | RECORDERYS",
  description: "Información sobre cookies y preferencias en RECORDERYS.",
};

export default function CookiesPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <Link href="/" aria-label="Volver a Recorderys">
          <Brand />
        </Link>
        <span className="legal-eyebrow">Cookies</span>
        <h1>Política de cookies</h1>
        <p>
          Esta política explica qué cookies y tecnologías similares puede usar
          RECORDERYS y cómo puedes aceptar, rechazar o configurar su uso.
        </p>
      </header>

      <section className="legal-card">
        <h2>Qué son las cookies</h2>
        <p>
          Las cookies son pequeños archivos o tecnologías similares que permiten
          almacenar o recuperar información en el dispositivo de la persona que
          visita una web o utiliza una aplicación.
        </p>
      </section>

      <section className="legal-card">
        <h2>Tipos de cookies</h2>
        <ul>
          <li>
            <strong>Técnicas:</strong> necesarias para que la web funcione,
            mantener la sesión, recordar preferencias esenciales o proteger el
            servicio.
          </li>
          <li>
            <strong>Analíticas:</strong> ayudan a entender el uso agregado de la
            web para mejorar la experiencia. Solo se activarán si das tu
            consentimiento.
          </li>
          <li>
            <strong>Marketing o partners:</strong> podrían utilizarse para medir
            campañas, acuerdos de marca o contenidos patrocinados. Solo se
            activarán si das tu consentimiento.
          </li>
        </ul>
      </section>

      <section className="legal-card">
        <h2>Gestión del consentimiento</h2>
        <p>
          Puedes aceptar, rechazar o configurar las cookies desde el banner
          inicial. También puedes cambiar tu decisión en cualquier momento desde
          el enlace "Preferencias de cookies" situado en el pie de página.
        </p>
      </section>

      <section className="legal-card">
        <h2>Cookies previstas</h2>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Finalidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Técnicas</td>
                <td>Funcionamiento, seguridad y preferencias básicas.</td>
                <td>Siempre activas</td>
              </tr>
              <tr>
                <td>Analíticas</td>
                <td>Medición agregada de uso y rendimiento.</td>
                <td>Opcionales</td>
              </tr>
              <tr>
                <td>Marketing/partners</td>
                <td>Medición de campañas o acuerdos comerciales.</td>
                <td>Opcionales</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
