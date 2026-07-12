import Link from "next/link";
import { BrandHomeLink } from "@/components/brand-home-link";
import { LegalFooter } from "@/components/legal-footer";

const library = [
  {
    name: "Cafetera DeLonghi",
    meta: "El Corte Inglés · 229,99 €",
    badge: "Garantía 2029",
    tone: "warranty",
  },
  {
    name: "Zapatillas Nordikas",
    meta: "Nordikas · 89,95 €",
    badge: "4 días",
    tone: "return",
  },
  {
    name: "Auriculares Sony",
    meta: "Amazon · 149,90 €",
    badge: "Ticket",
    tone: "saved",
  },
];

const examples = [
  {
    category: "Hogar",
    name: "Aspiradora sin cable",
    meta: "Dyson · MediaMarkt",
    note: "Garantía y ticket siempre a mano",
  },
  {
    category: "Calzado",
    name: "Zapatillas de casa",
    meta: "Nordikas · Nordikas",
    note: "Plazos de devolución bajo control",
  },
  {
    category: "Electrónica",
    name: "Auriculares inalámbricos",
    meta: "Sony · Amazon",
    note: "Compra localizada en segundos",
  },
];

export default function HomePage() {
  return (
    <>
      <header className="home-nav">
        <BrandHomeLink tagline="Tu App de garantía." />
        <nav className="home-nav__center" aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
        </nav>
        <div className="home-nav__actions">
          <Link className="home-nav__login" href="/login">
            Entrar
          </Link>
          <Link className="home-nav__cta" href="/login?mode=register">
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="home-v2">
        <section className="home-hero">
          <div className="home-hero__copy">
            <span className="home-eyebrow-chip">
              <i aria-hidden="true" />
              Tu postcompra, bajo control
            </span>
            <h1>Nunca pierdas una garantía.</h1>
            <p className="home-hero__lead">
              Guarda tickets, controla devoluciones y encuentra cualquier compra
              importante justo cuando la necesitas.
            </p>
            <div className="home-hero__actions">
              <Link className="home-btn home-btn--primary" href="/login?mode=register">
                Guardar mi primera compra
              </Link>
              <a className="home-btn home-btn--ghost" href="#como-funciona">
                Ver cómo funciona
              </a>
            </div>
            <ul className="home-trust" aria-label="Ventajas principales">
              <li>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
                Privado
              </li>
              <li>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
                Fácil de encontrar
              </li>
              <li>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l2.5 2.5" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Avisos a tiempo
              </li>
            </ul>
          </div>

          <aside className="home-library card-v2" aria-label="Vista previa de Recorderys">
            <div className="home-library__head">
              <strong>Mi biblioteca</strong>
              <span>5 compras</span>
            </div>
            <div className="home-library__list">
              {library.map((entry) => (
                <div className="home-library__row" key={entry.name}>
                  <span className="home-library__thumb" aria-hidden="true" />
                  <div className="home-library__copy">
                    <strong>{entry.name}</strong>
                    <small>{entry.meta}</small>
                  </div>
                  <span className={`status-badge status-badge--${entry.tone} home-library__badge`}>
                    {entry.badge}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="home-section">
          <p className="home-eyebrow">Postcompra real</p>
          <h2>Una compra no termina cuando pagas.</h2>
          <div className="home-values">
            <article className="home-value card-v2">
              <span className="home-value__icon home-value__icon--cyan" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 3h13l3 3v15l-2-1.5L16 21l-2-1.5L12 21l-2-1.5L8 21l-2-1.5L4 21Z" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </span>
              <h3>Ticket localizado.</h3>
              <p>Sin rebuscar en chats, cajones o correos.</p>
            </article>
            <article className="home-value card-v2">
              <span className="home-value__icon home-value__icon--cyan" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <h3>Garantía vigente.</h3>
              <p>Sabes hasta cuándo estás cubierto.</p>
            </article>
            <article className="home-value card-v2">
              <span className="home-value__icon home-value__icon--yellow" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l2.5 2.5" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <h3>Devolución controlada.</h3>
              <p>Recorderys te avisa antes de que sea tarde.</p>
            </article>
          </div>
        </section>

        <section className="home-steps" id="como-funciona">
          <p className="home-eyebrow home-eyebrow--yellow">Así de sencillo</p>
          <h2>Tres pasos. Años de tranquilidad.</h2>
          <div className="home-steps__grid">
            <article>
              <span>01</span>
              <h3>Fotografía el ticket</h3>
              <p>Añade la compra y conserva el justificante en un lugar seguro.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Todo queda conectado</h3>
              <p>Producto, tienda, fecha, ticket y garantía en una sola ficha.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Actúa antes de que sea tarde</h3>
              <p>Detecta de un vistazo qué compras necesitan tu atención.</p>
            </article>
          </div>
        </section>

        <section className="home-section">
          <p className="home-eyebrow">Ejemplos reales</p>
          <h2>Productos reales. Tickets reales. Todo localizado.</h2>
          <div className="home-examples">
            {examples.map((product) => (
              <article className="home-example card-v2" key={product.name}>
                <span className="home-example__media" aria-hidden="true" />
                <div className="home-example__body">
                  <span className="home-example__category">{product.category}</span>
                  <strong>{product.name}</strong>
                  <small>{product.meta}</small>
                  <p>{product.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-final">
          <h2>Guarda lo que importa. Encuentra lo que necesitas.</h2>
          <p>
            Tickets, garantías, devoluciones y documentos de tus compras
            importantes, siempre localizados.
          </p>
          <Link className="home-btn home-btn--inverse" href="/login?mode=register">
            Guardar mi primera compra
          </Link>
        </section>
      </main>
      <LegalFooter />
    </>
  );
}
