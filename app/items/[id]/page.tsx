import "./detail.css";
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
      <div className="product-detail">
        <Link className="pd-back" href="/dashboard">← Volver a Biblioteca</Link>
        <header className="product-heading">
          <div><p className="product-category">{item.categories?.name || "Tu biblioteca"}</p><h1>{item.name}</h1><p>{[item.brand, item.store].filter(Boolean).join(" · ")}</p></div>
          <Link className="pd-button pd-button--primary" href={`/items/${item.id}/edit`}>Editar compra</Link>
        </header>
        <div className="product-overview">
          <div className="product-cover">{coverImageHref ? <img src={coverImageHref} alt={item.name} /> : <p>Sin foto del producto</p>}</div>
          <div className="product-summary"><span className={statusBadgeClass(status)}>{statusLabel(status)}</span><h2>Tu compra, de un vistazo.</h2><dl><div><dt>Comprado en</dt><dd>{item.store || "No registrado"}</dd></div><div><dt>Fecha de compra</dt><dd>{formatShortDate(purchaseDate)}</dd></div><div><dt>Fin de devolución</dt><dd>{returnUntil ? formatShortDate(returnUntil) : "No registrado"}</dd></div><div><dt>Fin de garantía</dt><dd>{warrantyUntil ? formatShortDate(warrantyUntil) : "No registrado"}</dd></div></dl>
          {receiptMeta && receiptMeta.duplicate_status !== "clear" && <p className="product-review">{receiptMeta.review_notes || "Este ticket está siendo revisado."}</p>}
          </div>
        </div>
        <nav className="product-sections" aria-label="Información de la compra">
          <a href="#ticket"><span aria-hidden="true">▤</span> Ticket</a><a href="#plazos"><span aria-hidden="true">◷</span> Plazos</a><a href="#fotos"><span aria-hidden="true">▧</span> Fotos</a><a href="#datos"><span aria-hidden="true">ⓘ</span> Datos</a>
        </nav>
        <div className="product-information">
          <section id="ticket" className="product-section"><p className="product-kicker">01 / DOCUMENTOS</p><h2>Todo lo que acredita tu compra.</h2><p className="product-help">Abre tus documentos originales en una nueva pestaña.</p><div className="product-documents">
            {receiptHref ? <a href={receiptHref} target="_blank" rel="noreferrer"><span className="product-document-icon" aria-hidden="true">▤</span><span><strong>Ticket original</strong><small>Justificante de compra</small></span><span aria-hidden="true">↗</span></a> : <div className="product-empty"><strong>Ticket no adjunto</strong><p>Puedes añadirlo al editar la compra.</p></div>}
            {paymentReceiptHref ? <a href={paymentReceiptHref} target="_blank" rel="noreferrer"><span className="product-document-icon" aria-hidden="true">▤</span><span><strong>Justificante de pago</strong><small>Recibo del datáfono</small></span><span aria-hidden="true">↗</span></a> : <div className="product-empty"><strong>Sin justificante de pago adicional</strong><p>Es un documento opcional.</p></div>}
          </div></section>
          <section id="plazos" className="product-section"><p className="product-kicker">02 / PLAZOS</p><h2>Las fechas importantes.</h2><p className="product-help">Cronología de los plazos registrados para esta compra.</p>{timeline.length ? <ol className="product-timeline">{timeline.map(step => <li key={step.label}><span className={step.done ? "product-milestone completed" : "product-milestone"} aria-hidden="true">{step.done ? "✓" : "○"}</span><div><strong>{step.label}</strong><time dateTime={step.date}>{formatShortDate(step.date)}</time><small>{step.label === "Compra realizada" ? "Compra registrada" : step.done ? "Fecha pasada" : "Próxima fecha"}</small></div></li>)}</ol> : <p className="product-empty">No hay fechas registradas. Puedes completarlas al editar la compra.</p>}</section>
          <section id="fotos" className="product-section"><p className="product-kicker">03 / FOTOS</p><h2>Reconoce tu producto.</h2><div className="product-photo-gallery">{[coverImageHref, ...(!hasSupabaseEnv() ? item.user_photos || [] : [])].filter(Boolean).map((photo: string, index: number) => <a key={`${photo}-${index}`} href={photo} target="_blank" rel="noreferrer" aria-label={`Abrir foto ${index + 1} de ${item.name}`}><img loading="lazy" src={photo} alt={`${item.name}, foto ${index + 1}`} /><span>{index === 0 ? "Foto principal" : `Foto ${index + 1}`} ↗</span></a>)}</div>{!coverImageHref && <p className="product-empty">Todavía no hay una foto principal. Añádela al editar la compra.</p>}</section>
          <section id="datos" className="product-section"><p className="product-kicker">04 / DATOS</p><h2>Los detalles que conviene guardar.</h2><dl className="product-data">{[["Producto",item.name],["Marca",item.brand],["Tienda",item.store],["Categoría",item.categories?.name],["Modelo",item.model],["Número de serie",item.serial_number]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || "No registrado"}</dd></div>)}</dl><div className="product-notes"><h3>Tus notas</h3><p>{item.description || "No has añadido notas a esta compra."}</p></div><Link className="pd-button pd-button--secondary" href={`/items/${item.id}/edit`}>Editar los datos de esta compra</Link></section>
        </div>
      </div>
    </AppShell>
  );
}
