import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Política de privacidad | RECORDERYS",
  description: "Como RECORDERYS trata datos personales y documentos de compras.",
};

export default function PrivacidadPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <Link href="/" aria-label="Volver a Recorderys">
          <Brand />
        </Link>
        <span className="legal-eyebrow">Privacidad</span>
        <h1>Política de privacidad</h1>
        <p>
          RECORDERYS esta pensado para guardar información sensible de compras.
          Por eso explicamos de forma clara que datos tratamos y para que.
        </p>
      </header>

      <section className="legal-card">
        <h2>Responsable del tratamiento</h2>
        <p>
          Responsable: <strong>[Pendiente de completar]</strong>
        </p>
        <p>
          Contacto de privacidad: <strong>[Pendiente de completar]</strong>
        </p>
      </section>

      <section className="legal-card">
        <h2>Datos que podemos tratar</h2>
        <ul>
          <li>Datos de cuenta: email, identificador de usuario y preferencias.</li>
          <li>
            Datos de compras: producto, tienda, importe, fecha, categoría,
            garantía, devolución y notas asociadas.
          </li>
          <li>
            Documentos subidos: tickets, facturas, garantías, fotografías y
            archivos relacionados con compras.
          </li>
          <li>
            Datos técnicos: dirección IP, dispositivo, navegador, registros de
            seguridad y actividad necesaria para prestar el servicio.
          </li>
        </ul>
      </section>

      <section className="legal-card">
        <h2>Finalidades</h2>
        <ul>
          <li>Crear y gestionar la cuenta de usuario.</li>
          <li>Guardar, ordenar, buscar y mostrar compras importantes.</li>
          <li>Recordar plazos de garantía o devolución.</li>
          <li>Mostrar resumenes visuales de tickets y documentos.</li>
          <li>Prevenir duplicados, errores o usos fraudulentos del servicio.</li>
          <li>Atender solicitudes de soporte y mejorar la experiencia.</li>
        </ul>
      </section>

      <section className="legal-card">
        <h2>Base juridica</h2>
        <p>
          El tratamiento principal se basa en la ejecución del servicio
          solícitado por la persona usuaria. Algunas comunicaciones o funciones
          opcionales podrán basarse en el consentimiento. Determinados controles
          de seguridad podrán apoyarse en el interes legitimo de proteger la
          plataforma y evitar abusos.
        </p>
      </section>

      <section className="legal-card">
        <h2>Proveedores</h2>
        <p>
          RECORDERYS puede apoyarse en proveedores técnicos para alojamiento,
          autenticacion, base de datos, almacenamiento, analítica, envio de
          comunicaciones u OCR/IA si se activa la lectura automatica de tickets.
        </p>
        <p>
          Proveedores previstos o pendientes de confirmar: Supabase, Vercel y
          otros servicios necesarios para operar la aplicación.
        </p>
      </section>

      <section className="legal-card">
        <h2>Conservación</h2>
        <p>
          Los datos se conservarán mientras la cuenta este activa o mientras
          sean necesarios para prestar el servicio. La persona usuaria podrá
          eliminar compras, documentos o solícitar la baja de la cuenta, sin
          perjuicio de obligaciones legales de conservacion que puedan aplicar.
        </p>
      </section>

      <section className="legal-card">
        <h2>Derechos</h2>
        <p>
          Puedes solícitar acceso, rectificacion, supresión, oposición,
          limitación y portabilidad de tus datos escribiendo al contacto de
          privacidad indicado en esta política. También puedes reclamar ante la
          Agencia Española de Protección de Datos si consideras que el
          tratamiento no se ajusta a la normativa.
        </p>
      </section>
    </main>
  );
}
