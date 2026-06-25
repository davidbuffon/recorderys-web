import { BrandHomeLink } from "@/components/brand-home-link";

export const metadata = {
  title: "Términos y condiciones | RECORDERYS",
  description: "Condiciones de uso del servicio RECORDERYS.",
};

export default function TerminosPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <BrandHomeLink />
        <span className="legal-eyebrow">Condiciones</span>
        <h1>Términos y condiciones</h1>
        <p>
          Estas condiciones regulan el uso de RECORDERYS como biblioteca privada
          para compras, tickets, garantías y documentos relacionados. Al crear
          una cuenta o usar el servicio, aceptas estas condiciones en su
          totalidad.
        </p>
      </header>

      <section className="legal-card">
        <h2>Edad mínima</h2>
        <p>
          Para usar RECORDERYS debes tener al menos 14 años. Si eres menor de
          esa edad, necesitas el consentimiento expreso de tu representante
          legal. Al registrarte declaras que cumples este requisito.
        </p>
      </section>

      <section className="legal-card">
        <h2>Descripción del servicio</h2>
        <p>
          RECORDERYS permite guardar información de compras, crear fichas de
          producto, conservar tickets y documentos, y recibir avisos
          relacionados con garantías o plazos de devolución.
        </p>
        <p>
          El servicio se presta en las condiciones descritas en estas
          condiciones y puede incorporar nuevas funcionalidades en el futuro,
          que se comunicarán oportunamente.
        </p>
      </section>

      <section className="legal-card">
        <h2>Cuenta de usuario</h2>
        <p>
          Para acceder a determinadas funciones es necesario crear una cuenta.
          La persona usuaria debe:
        </p>
        <ul>
          <li>Proporcionar información veraz al registrarse.</li>
          <li>Mantener sus credenciales en secreto y no compartirlas.</li>
          <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta.</li>
        </ul>
        <p>
          El titular no se responsabiliza de los daños derivados del
          incumplimiento de estas obligaciones por parte de la persona usuaria.
        </p>
      </section>

      <section className="legal-card">
        <h2>Documentos y contenido subido</h2>
        <p>
          La persona usuaria declara que tiene derecho a subir los tickets,
          facturas, imágenes y documentos que almacena en RECORDERYS. Queda
          expresamente prohibido:
        </p>
        <ul>
          <li>Incorporar documentos de terceros sin su autorización.</li>
          <li>Subir documentos falsos, alterados o manipulados.</li>
          <li>Usar el servicio para generar o justificar operaciones fraudulentas.</li>
        </ul>
        <p>
          El titular puede suspender o eliminar cuentas que incumplan estas
          condiciones, sin perjuicio de las acciones legales que pudieran
          corresponder.
        </p>
      </section>

      <section className="legal-card">
        <h2>Limitaciones del servicio</h2>
        <p>
          RECORDERYS ayuda a localizar información y recordar plazos, pero no
          garantiza que una tienda, marca o fabricante acepte una devolución,
          reparación o reclamación de garantía. Las condiciones aplicables son
          las de cada comercio, fabricante y la normativa de consumidores
          vigente en cada momento.
        </p>
        <p>
          RECORDERYS no presta asesoramiento legal, fiscal ni financiero.
        </p>
      </section>

      <section className="legal-card">
        <h2>Disponibilidad del servicio</h2>
        <p>
          Se trabajará para mantener RECORDERYS disponible y seguro, aunque
          pueden producirse interrupciones por mantenimiento programado,
          incidencias técnicas o causas ajenas al titular. Se comunicarán con
          antelación razonable las interrupciones planificadas que afecten de
          forma significativa al servicio.
        </p>
      </section>

      <section className="legal-card">
        <h2>Baja y eliminación de datos</h2>
        <p>
          La persona usuaria puede eliminar compras y documentos individualmente
          o solicitar la baja completa de su cuenta desde el apartado Perfil de
          la aplicación. Tras la baja, los datos se eliminarán en un plazo
          razonable, salvo los que deban conservarse por obligaciones legales.
        </p>
      </section>

      <section className="legal-card">
        <h2>Modificaciones de las condiciones</h2>
        <p>
          El titular puede modificar estas condiciones en cualquier momento. Los
          cambios relevantes se comunicarán mediante aviso en la aplicación o
          por email con una antelación mínima de 15 días, salvo en casos de
          urgencia por motivos de seguridad o legales. El uso continuado del
          servicio tras esa comunicación implica la aceptación de las nuevas
          condiciones. Si no estás de acuerdo, puedes dar de baja tu cuenta
          antes de que entren en vigor.
        </p>
      </section>

      <section className="legal-card">
        <h2>Legislación aplicable y jurisdicción</h2>
        <p>
          Estas condiciones se rigen por la legislación española. Para cualquier
          controversia derivada del uso de RECORDERYS, las partes se someten a
          los juzgados y tribunales del domicilio de la persona usuaria cuando
          esta tenga la condición de consumidora, conforme al Real Decreto
          Legislativo 1/2007 (TRLGDCU) y demás normativa aplicable en materia
          de protección de consumidores y usuarios.
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
