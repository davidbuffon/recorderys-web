import Link from "next/link";
import { Brand } from "@/components/brand";

const purchases = [
  {
    name: "Cafetera DeLonghi",
    image: "/demo/product-cafetera.svg?v=4",
    meta: "El Corte Inglés · 229,99 €",
    status: "Garantía hasta 2029",
    tone: "green",
  },
  {
    name: "Zapatillas Nordikas",
    image: "/demo/product-zapatillas.svg?v=4",
    meta: "Nordikas · 89,95 €",
    status: "Devolución: 4 días",
    tone: "yellow",
  },
  {
    name: "Auriculares Sony",
    image: "/demo/product-auriculares.svg?v=4",
    meta: "Amazon · 149,90 €",
    status: "Ticket guardado",
    tone: "blue",
  },
];

const partnerProducts = [
  {
    brand: "DeLonghi",
    category: "Hogar",
    name: "Cafetera automática",
    image: "/demo/product-cafetera.svg?v=4",
    note: "Garantía y ticket siempre a mano",
    store: "El Corte Inglés",
  },
  {
    brand: "Nordikas",
    category: "Calzado",
    name: "Zapatillas de casa",
    image: "/demo/product-zapatillas.svg?v=4",
    note: "Plazos de devolución bajo control",
    store: "Nordikas",
  },
  {
    brand: "Sony",
    category: "Electrónica",
    name: "Auriculares inalámbricos",
    image: "/demo/product-auriculares.svg?v=4",
    note: "Compra localizada en segundos",
    store: "Amazon",
  },
  {
    brand: "Recorderys",
    category: "Ticket",
    name: "Justificante guardado",
    image: "/demo/ticket-cafetera.svg",
    note: "Documento, producto y garantía conectados",
    store: "Compra demo",
  },
];

export default function HomePage() {
  return (
    <main className="public-landing">
      <nav className="public-nav" aria-label="Navegación principal">
        <Link href="/" aria-label="Inicio de Recorderys">
          <Brand />
        </Link>
        <div className="public-nav__actions">
          <Link className="public-link" href="/login">
            Entrar
          </Link>
          <Link className="button button-primary" href="/login?mode=register">
            Crear cuenta
          </Link>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero__copy">
          <p className="public-eyebrow">Tu postcompra, bajo control</p>
          <h1>Nunca pierdas una garantía.</h1>
          <p className="public-hero__lead">
            Guarda tickets, controla devoluciones y encuentra cualquier compra
            importante justo cuando la necesitas.
          </p>
          <div className="public-hero__actions">
            <Link className="button button-primary public-cta" href="/login?mode=register">
              Guardar mi primera compra
            </Link>
            <Link className="button button-secondary" href="/dashboard">
              Explorar la demo
            </Link>
          </div>
          <div className="public-trust" aria-label="Ventajas principales">
            <span>Privado</span>
            <span>Fácil de encontrar</span>
            <span>Avisos a tiempo</span>
          </div>
        </div>

        <div className="product-preview" aria-label="Vista previa de Recorderys">
          <div className="product-preview__bar">
            <div>
              <span>Mi biblioteca</span>
              <strong>Todo sigue en su sitio</strong>
            </div>
            <span className="product-preview__count">4 compras</span>
          </div>

          <div className="product-preview__grid">
            {purchases.map((purchase, index) => (
              <article
                className={`purchase-preview purchase-preview--${index + 1}`}
                key={purchase.name}
              >
                <div className="purchase-preview__media">
                  <img src={purchase.image} alt={purchase.name} />
                </div>
                <div className="purchase-preview__body">
                  <span className={`status-pill status-pill--${purchase.tone}`}>
                    {purchase.status}
                  </span>
                  <strong>{purchase.name}</strong>
                  <small>{purchase.meta}</small>
                </div>
              </article>
            ))}
          </div>

          <div className="product-alert">
            <span className="product-alert__icon">!</span>
            <div>
              <strong>No dejes pasar una devolución</strong>
              <small>Recorderys destaca lo que necesita tu atención.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-strip">
        <div className="problem-strip__heading">
          <span>Postcompra real</span>
          <p>Una compra no termina cuando pagas.</p>
        </div>
        <div className="problem-strip__items">
          <span>
            <strong>Ticket localizado.</strong>
            <small>Sin rebuscar en chats, cajones o correos.</small>
          </span>
          <span>
            <strong>Garantía vigente.</strong>
            <small>Sabes hasta cuándo estás cubierto.</small>
          </span>
          <span>
            <strong>Devolución controlada.</strong>
            <small>Recorderys te avisa antes de que sea tarde.</small>
          </span>
        </div>
      </section>

      <section className="public-section public-section--how" id="como-funciona">
        <div className="public-section__heading">
          <p className="public-eyebrow">Así de sencillo</p>
          <h2>Tres pasos. Años de tranquilidad.</h2>
        </div>
        <div className="how-grid">
          <article className="how-step">
            <div className="how-step__copy">
              <span>01</span>
              <h3>Fotografía el ticket</h3>
              <p>Añade la compra y conserva el justificante en un lugar seguro.</p>
            </div>
            <div className="how-ticket-visual" aria-label="Ticket de una compra">
              <div className="how-ticket-visual__row">
                <strong>Total</strong>
                <strong>229,99 EUR</strong>
              </div>
              <div className="how-ticket-visual__line" />
              <p>Pago tarjeta ****1284</p>
              <p>Gracias por tu compra</p>
            </div>
          </article>
          <article className="how-step">
            <div className="how-step__copy">
              <span>02</span>
              <h3>Todo queda conectado</h3>
              <p>Producto, tienda, fecha, ticket y garantía en una sola ficha.</p>
            </div>
            <div className="how-product-visual" aria-label="Producto registrado">
              <div className="how-product-visual__media">
                <img src="/demo/product-cafetera-wide.svg" alt="" />
              </div>
            </div>
          </article>
          <article className="how-step">
            <div className="how-step__copy">
              <span>03</span>
              <h3>Actúa antes de que sea tarde</h3>
              <p>Detecta de un vistazo qué compras necesitan tu atención.</p>
            </div>
            <div className="how-step__notice">
              <strong>Quedan 4 días</strong>
              <small>Plazo de devolución</small>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section brand-showcase" aria-label="Productos reales">
        <div className="brand-showcase__heading">
          <div>
            <p className="public-eyebrow">Biblioteca visual</p>
            <h2>Productos reales. Tickets reales. Todo localizado.</h2>
          </div>
          <p>
            Una biblioteca visual para las compras que quieres tener siempre bajo
            control.
          </p>
        </div>
        <div className="brand-carousel" aria-label="Ejemplos de compras guardadas">
          {partnerProducts.map((product) => (
            <article className="brand-product-card" key={`${product.brand}-${product.name}`}>
              <div className="brand-product-card__media">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="brand-product-card__body">
                <span>{product.category}</span>
                <strong>{product.name}</strong>
                <small>{product.brand} · {product.store}</small>
                <p>{product.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-final-cta">
        <div>
          <p className="public-eyebrow">Siempre localizado</p>
          <h2>Guarda lo que importa. Encuentra lo que necesitas.</h2>
          <p>
            Tickets, garantías, devoluciones y documentos de tus compras importantes,
            siempre localizados.
          </p>
        </div>
        <Link className="button button-primary public-cta" href="/login?mode=register">
          Guardar mi primera compra
        </Link>
      </section>
    </main>
  );
}
