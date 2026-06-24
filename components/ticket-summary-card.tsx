import { TicketDocumentViewer } from "@/components/ticket-document-viewer";
import { formatShortDate } from "@/lib/format-date";

type TicketSummaryCardProps = {
  confidence?: number | null;
  date?: string | null;
  href?: string | null;
  paymentLabel?: string | null;
  statusLabel: string;
  store?: string | null;
  ticketNumber?: string | null;
  total?: number | null;
};

function formatAmount(total: number | null | undefined) {
  if (total == null) return "Sin detectar";

  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    style: "currency",
  }).format(total);
}

export function TicketSummaryCard({
  confidence,
  date,
  href,
  paymentLabel,
  statusLabel,
  store,
  ticketNumber,
  total,
}: TicketSummaryCardProps) {
  return (
    <section className="ticket-summary" aria-label="Resumen del ticket">
      <div className="ticket-summary__top">
        <span className="chip chip-blue">{statusLabel}</span>
        {confidence != null ? <small>Lectura {confidence}/100</small> : null}
      </div>

      <div className="ticket-summary__amount">
        <span>Total</span>
        <strong>{formatAmount(total)}</strong>
      </div>

      <div className="ticket-summary__line" />

      <dl className="ticket-summary__facts">
        <div>
          <dt>Tienda</dt>
          <dd>{store || "Sin detectar"}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{formatShortDate(date)}</dd>
        </div>
        <div>
          <dt>Pago</dt>
          <dd>{paymentLabel || "Pendiente de detectar"}</dd>
        </div>
        <div>
          <dt>Ticket</dt>
          <dd>{ticketNumber || "Sin número"}</dd>
        </div>
      </dl>

      <TicketDocumentViewer
        emptyMessage="El ticket original aún no está disponible."
        href={href}
        title="Ticket original"
      />
    </section>
  );
}
