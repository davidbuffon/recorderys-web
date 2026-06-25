import { BrandHomeLink } from "@/components/brand-home-link";

export const metadata = {
  title: "Aviso legal | RECORDERYS",
  description: "Información legal sobre el titular y condiciones de uso de RECORDERYS.",
};

export default function AvisoLegalPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <BrandHomeLink />
        <span className="legal-eyebrow">Información legal</span>
        <h1>Aviso legal</h1>
        <p>
          Información obligatoria conforme a la Ley 34/2002, de 11 de julio,
          de Servicios de la Sociedad de la Información y de Comercio
          Electrónico (LSSI-CE).
        </p>
      </header>

      <section className="legal-card">
        <h2>Titular del sitio</h2>
        <p>Titular: <strong>[Nombre o razón social — pendiente antes del lanzamiento]</strong></p>
        <p>NIF/CIF: <strong>[NIF/CIF — pendiente antes del lanzamiento]</strong></p>
        <p>Domicilio: <strong>[Domicilio social — pendiente antes del lanzamiento]</strong></p>
        <p>Email de contacto: <strong>[Email — pendiente antes del lanzamiento]</strong></p>
      </section>

      <section className="legal-card">
        <h2>Objeto del servicio</h2>
        <p>
          RECORDERYS es un servicio para guardar, organizar y localizar
          información de compras importantes: tickets, garantías, plazos de
          devolución, documentos y datos de producto.
        </p>
        <p>
          El acceso y uso de la web implica la aceptación de este aviso legal
          y de las condiciones particulares de cada funcionalidad.
        </p>
      </section>

      <section className="legal-card">
        <h2>Edad mínima</h2>
        <p>
          El uso de RECORDERYS está reservado a personas mayores de 14 años,
          conforme al artículo 7 de la LOPDGDD. Los menores de esa edad
          necesitan el consentimiento expreso de su representante legal para
          crear una cuenta o usar el servicio.
        </p>
      </section>

      <section className="legal-card">
        <h2>Uso correcto del servicio</h2>
        <p>
          La persona usuaria se compromete a usar RECORDERYS de forma diligente
          y lícita. Queda prohibido subir documentos falsos o alterados,
          incorporar datos de terceros sin autorización, usar el servicio con
          fines fraudulentos o intentar vulnerar la seguridad de la plataforma.
        </p>
      </section>

      <section className="legal-card">
        <h2>Propiedad intelectual</h2>
        <p>
          Los textos, diseños, elementos visuales, marca, logotipos y código de
          RECORDERYS pertenecen a su titular o se usan con licencia suficiente.
          Queda prohibido copiarlos, distribuirlos, modificarlos o explotarlos
          comercialmente sin autorización expresa, salvo lo permitido por la ley.
        </p>
      </section>

      <section className="legal-card">
        <h2>Responsabilidad</h2>
        <p>
          RECORDERYS ayuda a organizar información de compras, pero no sustituye
          la garantía legal ni las condiciones de venta de tiendas, marcas o
          fabricantes. La validez de tickets, garantías y devoluciones depende
          de cada comercio y de la normativa aplicable en cada caso.
        </p>
        <p>
          El titular no responde de interrupciones del servicio por causas
          ajenas a su control, ni de los contenidos subidos por las personas
          usuarias.
        </p>
      </section>

      <section className="legal-card">
        <h2>Legislación aplicable y jurisdicción</h2>
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier
          controversia, las partes se someten a los juzgados y tribunales del
          domicilio de la persona usuaria cuando esta tenga la condición de
          consumidora, conforme a la normativa de protección de consumidores y
          usuarios.
        </p>
      </section>

      <section className="legal-card">
        <h2>Modificaciones</h2>
        <p>
          El titular puede modificar este aviso legal en cualquier momento.
          Los cambios relevantes se comunicarán mediante aviso en la web o por
          email. El uso continuado del servicio implica la aceptación de las
          condiciones vigentes en cada momento.
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
