import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Aviso legal | RECORDERYS",
  description: "Información legal sobre el titular y condiciones de uso de RECORDERYS.",
};

export default function AvisoLegalPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <Link href="/" aria-label="Volver a Recorderys">
          <Brand />
        </Link>
        <span className="legal-eyebrow">Información legal</span>
        <h1>Aviso legal</h1>
        <p>
          Esta página recoge la información general sobre el titular de
          RECORDERYS y las condiciones básicas de uso de la web y la aplicación.
        </p>
      </header>

      <section className="legal-card">
        <h2>Titular del sitio</h2>
        <p>
          Titular: <strong>[Pendiente de completar]</strong>
        </p>
        <p>
          NIF/CIF: <strong>[Pendiente de completar]</strong>
        </p>
        <p>
          Domicilio: <strong>[Pendiente de completar]</strong>
        </p>
        <p>
          Email de contacto: <strong>[Pendiente de completar]</strong>
        </p>
      </section>

      <section className="legal-card">
        <h2>Objeto</h2>
        <p>
          RECORDERYS es un servicio orientado a guardar, organizar y localizar
          información asociada a compras importantes, como tickets, garantías,
          devoluciones, documentos y datos básicos de producto.
        </p>
        <p>
          El acceso y uso de la web implica la aceptación de este aviso legal,
          sin perjuicio de las condiciones particulares que puedan aplicarse a
          funcionalidades concretas.
        </p>
      </section>

      <section className="legal-card">
        <h2>Uso correcto del servicio</h2>
        <p>
          La persona usuaria se compromete a utilizar RECORDERYS de forma
          diligente, lícita y respetuosa con la normativa aplicable. No debe
          subir documentos falsos, datos de terceros sin autorización o
          contenidos que puedan utilizarse con fines fraudulentos.
        </p>
      </section>

      <section className="legal-card">
        <h2>Propiedad intelectual</h2>
        <p>
          Los textos, diseños, elementos visuales, marca, logotipos y código de
          la web pertenecen a su titular o se utilizan con licencia suficiente.
          No está permitido copiarlos, distribuirlos o transformarlos sin
          autorización expresa, salvo en los casos permitidos por la ley.
        </p>
      </section>

      <section className="legal-card">
        <h2>Responsabilidad</h2>
        <p>
          RECORDERYS ayuda a organizar información de compras, pero no sustituye
          la garantía legal, las condiciones de venta ni la atención oficial de
          tiendas, marcas o fabricantes. La validez de tickets, garantías y
          devoluciones dependerá de cada comercio o proveedor.
        </p>
      </section>
    </main>
  );
}
