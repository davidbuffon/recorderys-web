import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getIsAdmin } from "@/lib/admin";
import { demoItems, hasSupabaseEnv } from "@/lib/demo";
import { formatShortDate } from "@/lib/format-date";
import { getItemStatus, statusBadgeClass, statusLabel } from "@/lib/item-status";
import { createClient } from "@/lib/supabase-server";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    const item = demoItems.find((entry) => entry.id === id);
    return { title: item ? `${item.name} — Recorderys` : "Artículo — Recorderys" };
  }

  const supabase = await createClient();
  const { data } = await supabase.from("items").select("name").eq("id", id).single();
  return { title: data?.name ? `${data.name} — Recorderys` : "Artículo — Recorderys" };
}

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

  const status = getItemStatus(item);
  const purchaseDate = item.purchase_date as string | null;
  const returnUntil = item.return_until as string | null;
  const warrantyUntil = (item.warranty_until_manual ?? item.warranty_until) as string | null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeline = [
    purchaseDate
      ? { label: "Compra realizada", date: purchaseDate, done: true }
      : null,
    returnUntil
      ? {
          label: "Fin de devolución",
          date: returnUntil,
          done: new Date(returnUntil) < today,
        }
      : null,
    warrantyUntil
      ? {
          label: "Fin de garantía",
          date: warrantyUntil,
          done: new Date(warrantyUntil) < today,
        }
      : null,
  ].filter(Boolean) as { label: string; date: string; done: boolean }[];

  return (
    <AppShell isAdmin={isAdmin}>
      <Link className="pd-back" href="/dashboard">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a tus compras
      </Link>

      <div className="pd-grid">
        <div className="pd-media">
          <div className="pd-image card-v2">
            {coverImageHref ? (
              <img alt={item.name} src={coverImageHref} />
            ) : (
              <span className="item-card-v2__placeholder">sin-foto</span>
            )}
          </div>

          {receiptHref ? (
            <a className="pd-ticket card-v2" href={receiptHref} rel="noreferrer" target="_blank">
              <span className="pd-ticket__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 3h13l3 3v15l-2-1.5L16 21l-2-1.5L12 21l-2-1.5L8 21l-2-1.5L4 21Z" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </span>
              <span className="pd-ticket__copy">
                <strong>Ticket original</strong>
                <small>
                  {purchaseDate ? `Guardado el ${formatShortDate(purchaseDate)}` : "Disponible"}
                </small>
              </span>
              <svg aria-hidden="true" className="pd-ticket__download" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          ) : null}

          {paymentReceiptHref ? (
            <a className="pd-ticket card-v2" href={paymentReceiptHref} rel="noreferrer" target="_blank">
              <span className="pd-ticket__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </span>
              <span className="pd-ticket__copy">
                <strong>Recibo datáfono</strong>
                <small>Justificante de pago</small>
              </span>
              <svg aria-hidden="true" className="pd-ticket__download" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          ) : null}
        </div>

        <div className="pd-info">
          <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
          <h1>{item.name}</h1>
          <p className="pd-info__meta">
            {[item.store, item.brand].filter(Boolean).join(" · ") || "Compra guardada"}
          </p>

          {timeline.length > 0 && (
            <section className="pd-timeline card-v2" aria-label="Cronología">
              <h2>Cronología</h2>
              <ol>
                {timeline.map((step) => (
                  <li className={step.done ? "pd-timeline__step pd-timeline__step--done" : "pd-timeline__step"} key={step.label}>
                    <span className="pd-timeline__dot" aria-hidden="true">
                      {step.done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="pd-timeline__copy">
                      <strong>{step.label}</strong>
                      <small>{formatShortDate(step.date)}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {receiptMeta && receiptMeta.duplicate_status !== "clear" ? (
            <p className="pd-review-note">
              {receiptMeta.review_notes || "Este ticket está siendo revisado."}
            </p>
          ) : null}

          <div className="pd-actions">
            <Link className="pd-button pd-button--primary" href={`/items/${item.id}/edit`}>
              Editar artículo
            </Link>
            {receiptHref ? (
              <a className="pd-button pd-button--secondary" href={receiptHref} rel="noreferrer" target="_blank">
                Descargar ticket
              </a>
            ) : null}
          </div>

          {item.description ? (
            <p className="pd-notes">{item.description}</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
