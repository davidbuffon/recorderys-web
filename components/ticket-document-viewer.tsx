"use client";

import { useState } from "react";

type TicketDocumentViewerProps = {
  emptyMessage?: string;
  href?: string | null;
  title: string;
};

export function TicketDocumentViewer({
  emptyMessage = "El documento original aún no está disponible.",
  href,
  title,
}: TicketDocumentViewerProps) {
  const [shareMessage, setShareMessage] = useState("");

  async function handleShareTicket() {
    if (!href) return;

    const shareData = {
      text: `${title} guardado en Recorderys`,
      title,
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
      setShareMessage("No se pudo compartir. Abre el documento en una pestaña nueva.");
    }
  }

  if (!href) {
    return <p className="ticket-summary__empty">{emptyMessage}</p>;
  }

  return (
    <details className="ticket-original">
      <summary>Ver ticket original</summary>
      <div className="ticket-original__frame">
        <iframe src={href} title={title} />
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
  );
}
