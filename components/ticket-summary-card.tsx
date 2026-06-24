"use client";

import { useState } from "react";
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
  const [shareMessage, setShareMessage] = useState("");

  async function handleShareTicket() {
    if (!href) return;

    const shareData = {
      text: "Ticket guardado en Recorderys",
      title: "Ticket original",
      url: href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("");
        return;
      }

      await navigator.clipboard.writeText(href);
      setShareMessage("Enlace copiado. Puedes pegarlo en un email o mensaje.");
    } catch {
      setShareMessage("No se pudo compartir. Abre el ticket en una pestaña nueva.");
    }
  }

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

      {href ? (
        <details className="ticket-original">
          <summary>Ver ticket original</summary>
          <div className="ticket-original__frame">
            <iframe src={href} title="Ticket original" />
          </div>
          <div className="ticket-original__actions">
            <button className="button button-primary" onClick={handleShareTicket} type="button">
              Compartir o enviar
            </button>
            <a className="button button-secondary" href={href} rel="noreferrer" target="_blank">
              Abrir para imprimir
            </a>
          </div>
          {shareMessage ? <p className="ticket-original__message">{shareMessage}</p> : null}
        </details>
      ) : (
        <p className="ticket-summary__empty">El ticket original aún no está disponible.</p>
      )}
    </section>
  );
}
