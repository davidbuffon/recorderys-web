import { BrandHomeLink } from "@/components/brand-home-link";

export const metadata = {
  title: "Política de cookies | RECORDERYS",
  description: "Información sobre cookies y tecnologías similares en RECORDERYS.",
};

export default function CookiesPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <BrandHomeLink />
        <span className="legal-eyebrow">Cookies</span>
        <h1>Política de cookies</h1>
        <p>
          Esta política explica qué cookies y tecnologías similares usa
          RECORDERYS, con qué finalidad y cómo puedes gestionar tus
          preferencias, conforme a la Ley 34/2002 (LSSI-CE) y a las directrices
          de la Agencia Española de Protección de Datos (AEPD).
        </p>
      </header>

      <section className="legal-card">
        <h2>Qué son las cookies</h2>
        <p>
          Las cookies son pequeños archivos que se almacenan en tu dispositivo
          cuando visitas una web o usas una aplicación. Permiten que el servicio
          recuerde información entre visitas o durante una sesión.
        </p>
        <p>
          Además de cookies, RECORDERYS usa <strong>almacenamiento local
          (localStorage)</strong> del navegador para guardar tus preferencias de
          cookies. El localStorage no es una cookie y no se transmite al
          servidor en cada petición.
        </p>
      </section>

      <section className="legal-card">
        <h2>Cookies que utiliza RECORDERYS</h2>
        <p>
          En la actualidad, RECORDERYS solo instala cookies estrictamente
          necesarias para el funcionamiento del servicio. No se utilizan cookies
          de analítica ni de publicidad o marketing.
        </p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Proveedor</th>
                <th>Finalidad</th>
                <th>Tipo</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>sb-*-auth-token</code></td>
                <td>Supabase</td>
                <td>
                  Mantiene la sesión de usuario autenticada. Sin esta cookie el
                  servicio no puede identificar al usuario entre peticiones.
                </td>
                <td>Técnica / Esencial — propia</td>
                <td>Sesión (se renueva automáticamente mientras se usa la app)</td>
              </tr>
              <tr>
                <td><code>sb-*-auth-token-code-verifier</code></td>
                <td>Supabase</td>
                <td>
                  Verifica el flujo de autenticación OAuth (Google, Apple).
                  Se elimina automáticamente tras completar el inicio de sesión.
                </td>
                <td>Técnica / Esencial — propia</td>
                <td>Sesión</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: "0.9em" }} className="muted">
          El asterisco (*) en el nombre de las cookies representa el
          identificador interno del proyecto. Las cookies técnicas de sesión
          no requieren consentimiento previo conforme a la LSSI-CE.
        </p>
      </section>

      <section className="legal-card">
        <h2>Preferencias guardadas en localStorage</h2>
        <p>
          La decisión que tomas en el panel de cookies se guarda en el
          almacenamiento local de tu navegador bajo la clave{" "}
          <code>recorderys_cookie_preferences</code>. Este dato no abandona tu
          dispositivo y no es accesible por el servidor.
        </p>
      </section>

      <section className="legal-card">
        <h2>Cookies opcionales previstas</h2>
        <p>
          Si en el futuro se incorporan herramientas de analítica (medición
          agregada de uso) o de marketing (medición de campañas), esta política
          se actualizará con el detalle de cada cookie antes de su activación, y
          se solicitará tu consentimiento expreso a través del panel de
          preferencias.
        </p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Estado actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Técnicas / Esenciales</td>
                <td>Activas — no requieren consentimiento</td>
              </tr>
              <tr>
                <td>Analíticas</td>
                <td>No utilizadas en este momento</td>
              </tr>
              <tr>
                <td>Marketing / Publicidad</td>
                <td>No utilizadas en este momento</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="legal-card">
        <h2>Cómo gestionar tus preferencias</h2>
        <p>
          Puedes revisar o cambiar tus preferencias de cookies en cualquier
          momento haciendo clic en <strong>"Preferencias de cookies"</strong> en
          el pie de página.
        </p>
        <p>
          También puedes eliminar o bloquear cookies directamente desde la
          configuración de tu navegador. Ten en cuenta que bloquear las cookies
          técnicas puede impedir que el servicio funcione correctamente.
        </p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647" rel="noopener noreferrer" target="_blank">
              Gestionar cookies en Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" rel="noopener noreferrer" target="_blank">
              Gestionar cookies en Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" rel="noopener noreferrer" target="_blank">
              Gestionar cookies en Safari
            </a>
          </li>
        </ul>
      </section>

      <section className="legal-card">
        <h2>Modificaciones</h2>
        <p>
          Esta política puede actualizarse cuando se incorporen nuevas
          funcionalidades o proveedores. Cualquier cambio relevante se
          comunicará con antelación y quedará reflejado en la fecha de
          actualización que figura a continuación.
        </p>
      </section>

      <section className="legal-card">
        <p className="muted" style={{ fontSize: "0.85em" }}>
          Última actualización: junio de 2026.
        </p>
      </section>
    </main>
  );
}
