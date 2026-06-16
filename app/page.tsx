import Link from "next/link";
import { Brand } from "@/components/brand";
import { InfinityMark } from "@/components/infinity-mark";

export default function HomePage() {
  return (
    <main className="shell landing">
      <nav className="topbar">
        <Brand />
        <div className="hero__actions">
          <Link className="button button-secondary" href="/login">
            Entrar
          </Link>
          <Link className="button button-primary" href="/login">
            Empezar
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero__copy">
          <span className="chip chip-yellow">Tu app de garantía</span>
          <h1>Tu postcompra, por fin, bajo control.</h1>
          <p>
            Guarda tickets, centraliza artículos, detecta duplicados y llega a
            tiempo a devoluciones y garantías desde un dashboard visual y
            privado.
          </p>
          <div className="hero__actions">
            <Link className="button button-primary" href="/login">
              Crear mi cuenta
            </Link>
            <a className="button button-secondary" href="#como-funciona">
              Ver cómo funciona
            </a>
          </div>
        </div>

        <div className="hero__stack">
          <div className="card hero__panel" aria-label="Vista previa dashboard">
            <div className="hero__panel-header">
              <span className="chip chip-blue">Dashboard</span>
              <span className="chip chip-green">Garantías activas</span>
            </div>
            <div className="mock-grid">
              {["Cafetera", "Zapatillas", "Aspiradora", "Auriculares"].map(
                (item) => (
                  <div className="mock-card" key={item}>
                    <InfinityMark />
                    <strong>{item}</strong>
                    <small>Todo bajo control</small>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="hero__floating-grid">
            <div className="card floating-note">
              <span className="chip chip-red">Antifraude</span>
              <strong>Ticket duplicado detectado</strong>
              <p>La huella del ticket se ha comparado con otras cuentas.</p>
            </div>
            <div className="card floating-note">
              <span className="chip chip-yellow">Próximo hito</span>
              <strong>Devolución en 4 días</strong>
              <p>RECORDERYS destaca lo urgente antes de que se te pase.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="card benefit-card">
          <span className="chip chip-blue">Biblioteca</span>
          <h2>Un lugar para todas tus compras relevantes</h2>
          <p>Producto, ticket, garantía, devolución y notas en una sola ficha.</p>
        </div>
        <div className="card benefit-card">
          <span className="chip chip-yellow">Acción</span>
          <h2>No solo guardas, también reaccionas a tiempo</h2>
          <p>Busca, revisa vencimientos y actúa antes de perder un derecho.</p>
        </div>
        <div className="card benefit-card">
          <span className="chip chip-red">Confianza</span>
          <h2>Diseñado para reducir trampas y duplicados</h2>
          <p>La huella del ticket ayuda a detectar usos sospechosos entre cuentas.</p>
        </div>
      </section>

      <section className="steps" id="como-funciona">
        <div className="card step">
          <span>1</span>
          <h2>Sube el ticket</h2>
          <p>Guarda factura o recibo junto a la foto del producto.</p>
        </div>
        <div className="card step">
          <span>2</span>
          <h2>La IA clasifica</h2>
          <p>RECORDERYS sugiere categoría y prepara la extracción del ticket.</p>
        </div>
        <div className="card step">
          <span>3</span>
          <h2>Busca y filtra</h2>
          <p>Encuentra artículos por producto, tienda, marca o categoría.</p>
        </div>
      </section>
    </main>
  );
}
