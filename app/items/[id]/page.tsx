import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { InfinityMark } from "@/components/infinity-mark";
import { TicketDocumentViewer } from "@/components/ticket-document-viewer";
import { TicketSummaryCard } from "@/components/ticket-summary-card";
import { getIsAdmin } from "@/lib/admin";
import { demoItems, hasSupabaseEnv } from "@/lib/demo";
import { formatShortDate, isPastDate } from "@/lib/format-date";
import { createClient } from "@/lib/supabase-server";

type Params = Promise<{ id: string }>;

export default async function ItemDetailPage({ params }: { params: Params }) {
  let coverImageHref: string | null = null;
  let paymentReceiptHref: string | null = null;
  let receiptHref: string | null = null;
  let receiptMeta: {
    duplicate_status: string;
    trust_score: number;
    review_notes: string | null;
    ocr_status?: string;
    extraction_confidence?: number;
    extracted_store?: string | null;
    extracted_purchase_date?: string | null;
    extracted_total_amount?: number | null;
    extracted_ticket_number?: string | null;
  } | null = null;
  const { id } = await params;
  let item: any = null;
  let isAdmin = false;

  if (!hasSupabaseEnv()) {
    isAdmin = true;
    item = demoItems.find((entry) => entry.id === id);
    coverImageHref = item?.cover_image_path || item?.photo_path || null;
    receiptHref = item?.receipt_path ?? null;
    receiptMeta = item?.receipts?.[0]
      ? {
          duplicate_status: item.receipts[0].duplicate_status,
          trust_score: item.receipts[0].trust_score,
          review_notes:
            item.receipts[0].duplicate_status === "possible_duplicate"
              ? "La huella del ticket coincide con otra cuenta y requiere revisión."
              : item.receipts[0].duplicate_status === "under_review"
                ? "Este ticket está en revisión manual por señales de posible duplicado."
                : null,
          ocr_status: item.receipts[0].ocr_status,
          extraction_confidence: item.receipts[0].extraction_confidence,
          extracted_store: item.receipts[0].extracted_store,
          extracted_purchase_date: item.receipts[0].extracted_purchase_date,
          extracted_total_amount: item.receipts[0].extracted_total_amount,
          extracted_ticket_number: item.receipts[0].extracted_ticket_number,
        }
      : null;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    isAdmin = await getIsAdmin(supabase, user.id);

    const { data } = await supabase
      .from("items")
      .select("*,categories(name,slug,color),receipts(duplicate_status,trust_score,review_notes,ocr_status,extraction_confidence,extracted_store,extracted_purchase_date,extracted_total_amount,extracted_ticket_number)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    item = data;
    receiptMeta = data?.receipts?.[0] ?? null;

    if (data?.photo_path) {
      const { data: signedPhoto } = await supabase.storage
        .from("item-photos")
        .createSignedUrl(data.photo_path, 60 * 10);
      coverImageHref = signedPhoto?.signedUrl ?? null;
    }

    if (data?.receipt_path) {
      const { data: signedReceipt } = await supabase.storage
        .from("receipts")
        .createSignedUrl(data.receipt_path, 60 * 10);
      receiptHref = signedReceipt?.signedUrl ?? null;
    }

    if (data?.payment_receipt_path) {
      const { data: signedPaymentReceipt } = await supabase.storage
        .from("receipts")
        .createSignedUrl(data.payment_receipt_path, 60 * 10);
      paymentReceiptHref = signedPaymentReceipt?.signedUrl ?? null;
    }
  }

  if (!item) {
    notFound();
  }

  const customerPhotos = coverImageHref ? [coverImageHref] : [];
  const returnExpired = isPastDate(item.return_until);

  return (
    <main className="shell">
      <AppNav isAdmin={isAdmin} />

      <section className="card detail-header" style={{ marginTop: 28 }}>
        <div className="detail-header__copy">
          <div className="item-card__top">
            <span className="chip chip-blue">
              {item.categories?.name ?? "Sin categoría"}
            </span>
            {receiptMeta ? (
              <span
                className={`chip ${
                  receiptMeta.duplicate_status === "clear"
                    ? "chip-green"
                    : receiptMeta.duplicate_status === "under_review"
                      ? "chip-yellow"
                      : "chip-red"
                }`}
              >
                {receiptMeta.duplicate_status === "clear"
                  ? "Ticket limpio"
                  : receiptMeta.duplicate_status === "under_review"
                    ? "Ticket en revisión"
                    : "Posible duplicado"}
              </span>
            ) : null}
          </div>
          <h1>{item.name}</h1>
          <p className="muted">
            {[item.brand, item.store].filter(Boolean).join(" · ") ||
              "Compra guardada"}
          </p>
        </div>

        <div className="detail-header__actions">
          <Link className="button button-secondary" href={`/items/${item.id}/edit`}>
            Editar artículo
          </Link>
          <Link className="button button-primary" href="/messages">
            Contactar con RECORDERYS
          </Link>
          <Link className="button button-secondary" href="/dashboard">
            Ver artículos
          </Link>
        </div>
      </section>

      <section className="detail-grid">
        <div className="card detail-hero">
          {coverImageHref ? (
            <img alt="" src={coverImageHref} />
          ) : (
            <div className="detail-hero__placeholder">
              <InfinityMark />
              <span>{item.categories?.name ?? "Artículo guardado"}</span>
              <strong>{item.name}</strong>
              <small>
                {[item.brand, item.store].filter(Boolean).join(" · ") ||
                  "Foto pendiente de guardar"}
              </small>
            </div>
          )}
        </div>
        <div className="card detail-panel">
          <div className="date-blocks">
            <div className="date-block">
              <div className="date-block__hero">
                <span className={`chip ${returnExpired ? "chip-red" : "chip-yellow"}`}>
                  {returnExpired ? "Devolución caducada" : "Fin de devolución"}
                </span>
                <strong>{formatShortDate(item.return_until)}</strong>
              </div>
              <p className="muted">{item.return_source}</p>
            </div>
            <div className="date-block">
              <div className="date-block__hero">
                <span className="chip chip-green">Fin de garantía</span>
                <strong>{formatShortDate(item.warranty_until)}</strong>
              </div>
              <p className="muted">{item.warranty_source ?? "estimada legal"}</p>
            </div>
          </div>

          <div>
            <h2>Datos de compra</h2>
            <p>Compra: {formatShortDate(item.purchase_date)}</p>
            <p className="muted">{item.description || "Sin notas añadidas."}</p>
          </div>

          <TicketSummaryCard
            confidence={receiptMeta?.extraction_confidence}
            date={receiptMeta?.extracted_purchase_date || item.purchase_date}
            href={receiptHref}
            paymentLabel={
              receiptMeta?.ocr_status === "processed" ? "Tarjeta detectada" : null
            }
            statusLabel={
              receiptMeta?.ocr_status === "processed"
                ? "Ticket resumido"
                : receiptMeta?.ocr_status === "failed"
                  ? "Revisión pendiente"
                  : receiptHref
                    ? "Ticket guardado"
                    : "Resumen de compra"
            }
            store={receiptMeta?.extracted_store || item.store}
            ticketNumber={receiptMeta?.extracted_ticket_number}
            total={receiptMeta?.extracted_total_amount}
          />

          {paymentReceiptHref ? (
            <div className="payment-receipt-card">
              <div>
                <span className="chip chip-blue">Justificante de pago</span>
                <h2>Recibo datáfono</h2>
                <p className="muted">
                  Copia opcional del pago por tarjeta para cambios o
                  justificaciones.
                </p>
              </div>
              <TicketDocumentViewer
                emptyMessage="El recibo datáfono aún no está disponible."
                href={paymentReceiptHref}
                title="Recibo datáfono"
              />
            </div>
          ) : null}

          {customerPhotos.length ? (
            <div>
              <div className="detail-section__header">
                <h2>Fotos del cliente</h2>
                <span className="chip chip-blue">{customerPhotos.length} prueba{customerPhotos.length > 1 ? "s" : ""}</span>
              </div>
              <div className="detail-gallery">
                {customerPhotos.map((photo: string, index: number) => (
                  <div className="detail-gallery__item" key={`${photo}-${index}`}>
                    <img alt={`Foto del cliente ${index + 1}`} src={photo} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {receiptMeta ? (
            <div className="date-block">
              <span
                className={`chip ${
                  receiptMeta.duplicate_status === "clear"
                    ? "chip-green"
                    : receiptMeta.duplicate_status === "under_review"
                      ? "chip-yellow"
                      : "chip-red"
                }`}
              >
                {receiptMeta.duplicate_status === "clear"
                  ? "Ticket limpio"
                  : receiptMeta.duplicate_status === "under_review"
                    ? "Ticket en revisión"
                    : "Posible duplicado"}
              </span>
              <strong>Confianza: {receiptMeta.trust_score}/100</strong>
              <p className="muted">
                {receiptMeta.review_notes ||
                  "No se han detectado duplicados del ticket entre cuentas."}
              </p>
            </div>
          ) : null}

          {receiptMeta ? (
            <div className="date-block">
              <span
                className={`chip ${
                  receiptMeta.ocr_status === "processed"
                    ? "chip-blue"
                    : receiptMeta.ocr_status === "failed"
                      ? "chip-red"
                      : "chip-yellow"
                }`}
              >
                {receiptMeta.ocr_status === "processed"
                  ? "Datos extraídos"
                  : receiptMeta.ocr_status === "failed"
                    ? "OCR fallido"
                    : "OCR pendiente"}
              </span>
              <strong>
                Extracción: {receiptMeta.extraction_confidence ?? 0}/100
              </strong>
              <p className="muted">
                Tienda: {receiptMeta.extracted_store || "sin detectar"} · Fecha:{" "}
                {formatShortDate(receiptMeta.extracted_purchase_date || null)}
              </p>
              <p className="muted">
                Importe:{" "}
                {receiptMeta.extracted_total_amount != null
                  ? `${receiptMeta.extracted_total_amount} €`
                  : "sin detectar"}{" "}
                · Ticket: {receiptMeta.extracted_ticket_number || "sin detectar"}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
