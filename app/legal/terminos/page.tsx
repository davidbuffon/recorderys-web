import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Términos y condiciones | RECORDERYS",
  description: "Condiciones básicas de uso del servicio RECORDERYS.",
};

export default function TérminosPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <Link href="/" aria-label="Volver a Recorderys">
          <Brand />
        </Link>
        <span className="legal-eyebrow">Condiciones</span>
        <h1>Términos y condiciones</h1>
        <p>
          Estas condiciones regulan el uso de RECORDERYS como biblioteca privada
          para compras, tickets, garantías y documentos relacionados.
        </p>
      </header>

      <section className="legal-card">
        <h2>Servicio</h2>
        <p>
          RECORDERYS permite guardar información de compras, crear fichas de
          producto, conservar documentos, consultar tickets y recibir avisos
          relacionados con garantías o devoluciones.
        </p>
      </section>

      <section className="legal-card">
        <h2>Cuenta de usuario</h2>
        <p>
          Para usar determinadas funciones puede ser necesario crear una cuenta.
          La persona usuaria debe mantener sus credenciales seguras y avisar si
          detecta un uso no autorizado.
        </p>
      </section>

      <section className="legal-card">
        <h2>Documentos y contenido subido</h2>
        <p>
          La persona usuaria declara que tiene derecho a subir los tickets,
          facturas, imágenes y documentos que almacena en RECORDERYS. No debe
          incorporar documentos de terceros sin autorización ni utilizar el
          servicio para generar o justificar operaciones fraudulentas.
        </p>
      </section>

      <section className="legal-card">
        <h2>Limitaciones</h2>
        <p>
          RECORDERYS puede ayudar a localizar información y recordar plazos,
          pero no garantiza que una tienda, marca o fabricante acepte una
          devolución, reparación o garantía. Las condiciones aplicables son las
          de cada comercio, fabricante y normativa vigente.
        </p>
      </section>

      <section className="legal-card">
        <h2>Disponibilidad</h2>
        <p>
          Se trabajará para mantener el servicio disponible y seguro, aunque
          pueden producirse interrupciones por mantenimiento, incidencias
          técnicas o causas ajenas al titular.
        </p>
      </section>

      <section className="legal-card">
        <h2>Baja y eliminacion</h2>
        <p>
          La persona usuaria podrá solícitar la baja de su cuenta o eliminar
          compras y documentos desde las opciones disponibles o mediante el
          contacto de soporte indicado por RECORDERYS.
        </p>
      </section>
    </main>
  );
}
