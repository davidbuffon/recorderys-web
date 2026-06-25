import { BrandHomeLink } from "@/components/brand-home-link";

export const metadata = {
  title: "Política de privacidad | RECORDERYS",
  description: "Cómo RECORDERYS trata tus datos personales y documentos de compras.",
};

export default function PrivacidadPage() {
  return (
    <main className="legal-page">
      <header className="legal-hero">
        <BrandHomeLink />
        <span className="legal-eyebrow">Privacidad</span>
        <h1>Política de privacidad</h1>
        <p>
          RECORDERYS está pensado para guardar información sensible de compras.
          Por eso explicamos de forma clara qué datos tratamos y para qué,
          conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica
          3/2018 (LOPDGDD).
        </p>
      </header>

      <section className="legal-card">
        <h2>Responsable del tratamiento</h2>
        <p>Responsable: <strong>[Nombre o razón social — pendiente antes del lanzamiento]</strong></p>
        <p>Domicilio: <strong>[Domicilio social — pendiente antes del lanzamiento]</strong></p>
        <p>
          Email de privacidad:{" "}
          <strong>[Email de privacidad — pendiente antes del lanzamiento]</strong>
        </p>
        <p>
          No existe obligación legal de designar Delegado de Protección de Datos
          en este momento, pero cualquier consulta relativa al tratamiento puede
          dirigirse al email de privacidad indicado.
        </p>
      </section>

      <section className="legal-card">
        <h2>Edad mínima</h2>
        <p>
          El servicio está reservado a personas mayores de 14 años (art. 7
          LOPDGDD). No recogemos datos de menores de esa edad de forma
          consciente. Si detectamos que se ha creado una cuenta por un menor
          sin autorización, procederemos a eliminarla.
        </p>
      </section>

      <section className="legal-card">
        <h2>Datos que tratamos</h2>
        <ul>
          <li>
            <strong>Datos de cuenta:</strong> email, identificador de usuario y
            proveedor de autenticación (Google, Apple o email/contraseña).
          </li>
          <li>
            <strong>Datos de perfil opcionales:</strong> nombre, teléfono y
            dirección, que la persona usuaria puede añadir voluntariamente.
          </li>
          <li>
            <strong>Datos de compras:</strong> producto, tienda, marca, importe,
            fecha de compra, plazos de garantía y devolución, categoría y notas.
          </li>
          <li>
            <strong>Documentos subidos:</strong> tickets, facturas, garantías,
            fotografías y archivos relacionados con compras.
          </li>
          <li>
            <strong>Datos de uso técnico:</strong> dirección IP, tipo de
            dispositivo y navegador, registros de acceso y actividad necesaria
            para la seguridad y el correcto funcionamiento del servicio.
          </li>
          <li>
            <strong>Datos extraídos por OCR:</strong> si la lectura automática
            de tickets está activa, se extraen datos como tienda, fecha e
            importe del ticket para pre-rellenar la ficha de compra. Estos datos
            se asocian únicamente a la cuenta de la persona usuaria.
          </li>
        </ul>
      </section>

      <section className="legal-card">
        <h2>Finalidades del tratamiento</h2>
        <ul>
          <li>Crear y gestionar la cuenta de usuario.</li>
          <li>Guardar, ordenar, buscar y mostrar compras e información asociada.</li>
          <li>Controlar y avisar sobre plazos de garantía y devolución.</li>
          <li>Generar resúmenes visuales de tickets y documentos (OCR/IA).</li>
          <li>Detectar y prevenir duplicados, errores o usos fraudulentos.</li>
          <li>Atender solicitudes de soporte y mejorar la experiencia.</li>
          <li>Cumplir obligaciones legales aplicables.</li>
        </ul>
      </section>

      <section className="legal-card">
        <h2>Base jurídica</h2>
        <ul>
          <li>
            <strong>Ejecución del contrato (art. 6.1.b RGPD):</strong> el
            tratamiento principal de la cuenta y los datos de compras es
            necesario para prestar el servicio solicitado.
          </li>
          <li>
            <strong>Interés legítimo (art. 6.1.f RGPD):</strong> los controles
            de seguridad, detección de fraude y registros técnicos se basan en
            el interés legítimo de proteger la plataforma y a sus usuarios.
          </li>
          <li>
            <strong>Consentimiento (art. 6.1.a RGPD):</strong> funciones
            opcionales como cookies analíticas o comunicaciones de marketing
            solo se activarán si la persona usuaria otorga su consentimiento
            explícito, que puede retirar en cualquier momento.
          </li>
        </ul>
      </section>

      <section className="legal-card">
        <h2>Encargados del tratamiento y transferencias internacionales</h2>
        <p>
          RECORDERYS utiliza proveedores externos que actúan como encargados del
          tratamiento, con quienes se han suscrito o se suscribirán los
          contratos de encargo exigidos por el art. 28 RGPD:
        </p>
        <ul>
          <li>
            <strong>Supabase Inc.</strong> — base de datos, autenticación y
            almacenamiento de archivos. Servidores en la Unión Europea
            (Frankfurt, Alemania). Política de privacidad:{" "}
            <a href="https://supabase.com/privacy" rel="noopener noreferrer" target="_blank">
              supabase.com/privacy
            </a>
          </li>
          <li>
            <strong>Vercel Inc.</strong> — hospedaje y distribución de la
            aplicación web. Con sede en EEUU; las transferencias se amparan en
            las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.
            Política de privacidad:{" "}
            <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer" target="_blank">
              vercel.com/legal/privacy-policy
            </a>
          </li>
        </ul>
        <p>
          En caso de activarse funciones adicionales (analítica, envío de
          comunicaciones u otros), esta sección se actualizará con los nuevos
          proveedores antes de su puesta en marcha.
        </p>
      </section>

      <section className="legal-card">
        <h2>Conservación de los datos</h2>
        <p>
          Los datos se conservarán mientras la cuenta esté activa o mientras
          sean necesarios para prestar el servicio. La persona usuaria puede
          eliminar compras, documentos o solicitar la baja completa de su cuenta
          desde el apartado Perfil de la aplicación.
        </p>
        <p>
          Tras la baja, los datos se eliminarán en un plazo razonable, salvo
          aquellos que deban conservarse por obligaciones legales (contables,
          fiscales o de otra índole) durante el período que establezca la
          normativa aplicable.
        </p>
      </section>

      <section className="legal-card">
        <h2>Derechos de las personas usuarias</h2>
        <p>
          Puedes ejercer los siguientes derechos escribiendo al email de
          privacidad indicado en esta política, identificándote y especificando
          tu solicitud:
        </p>
        <ul>
          <li><strong>Acceso:</strong> conocer qué datos tratamos sobre ti.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> solicitar el borrado de tus datos cuando proceda.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
          <li><strong>Limitación:</strong> restringir el tratamiento en ciertos supuestos.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado y legible por máquina.</li>
          <li><strong>Retirada del consentimiento:</strong> en cualquier momento, sin que afecte al tratamiento previo.</li>
        </ul>
        <p>
          Responderemos en el plazo máximo de un mes desde la recepción, con
          posibilidad de prórroga de dos meses adicionales en casos complejos,
          notificándolo dentro del primer mes.
        </p>
        <p>
          Si consideras que el tratamiento no se ajusta a la normativa, puedes
          reclamar ante la{" "}
          <a href="https://www.aepd.es" rel="noopener noreferrer" target="_blank">
            Agencia Española de Protección de Datos (aepd.es)
          </a>
          .
        </p>
      </section>

      <section className="legal-card">
        <h2>Modificaciones de esta política</h2>
        <p>
          Podemos actualizar esta política cuando sea necesario. Los cambios
          relevantes se comunicarán mediante aviso en la aplicación o por email
          con antelación suficiente. La versión vigente siempre estará
          disponible en esta página.
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
