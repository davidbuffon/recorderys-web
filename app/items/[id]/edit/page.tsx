import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getIsAdmin } from "@/lib/admin";
import { demoCategories, hasSupabaseEnv } from "@/lib/demo";
import {
  buildInitialExtractionSignals,
  buildReceiptSignals,
} from "@/lib/receipt-antifraud";
import { createClient } from "@/lib/supabase-server";
import { uploadUserFile } from "@/lib/storage";
import type { Category } from "@/lib/types";

type Params = Promise<{ id: string }>;

async function updateItem(id: string, formData: FormData) {
  "use server";

  if (!hasSupabaseEnv()) {
    redirect(`/items/${id}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const itemName = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("category_id") || "");
  const description = String(formData.get("description") || "").trim();
  const store = String(formData.get("store") || "").trim();
  const brand = String(formData.get("brand") || "").trim();
  const purchaseDate = String(formData.get("purchase_date") || "");
  const returnUntil = String(formData.get("return_until") || "");
  const warrantyManual = String(formData.get("warranty_until_manual") || "");
  const photoFile = formData.get("customer_photo") as File | null;
  const receiptFile = formData.get("receipt") as File | null;
  const paymentReceiptFile = formData.get("payment_receipt") as File | null;

  if (!itemName || !purchaseDate) {
    redirect(`/items/${id}/edit`);
  }

  const [photoPath, receiptPath, paymentReceiptPath] = await Promise.all([
    uploadUserFile({
      supabase,
      userId: user.id,
      bucket: "item-photos",
      file: photoFile,
      prefix: "item-photo",
    }),
    uploadUserFile({
      supabase,
      userId: user.id,
      bucket: "receipts",
      file: receiptFile,
      prefix: "receipt",
    }),
    uploadUserFile({
      supabase,
      userId: user.id,
      bucket: "receipts",
      file: paymentReceiptFile,
      prefix: "payment-receipt",
    }),
  ]);

  const updatePayload: {
    category_id: string | null;
    name: string;
    description: string;
    brand: string;
    store: string;
    purchase_date: string;
    return_until: string | null;
    warranty_until_manual: string | null;
    return_source: "manual" | "undefined";
    warranty_source: "manual" | "legal_estimate";
    photo_path?: string;
    receipt_path?: string;
    payment_receipt_path?: string;
  } = {
    category_id: categoryId || null,
    name: itemName,
    description,
    brand,
    store,
    purchase_date: purchaseDate,
    return_until: returnUntil || null,
    warranty_until_manual: warrantyManual || null,
    return_source: returnUntil ? "manual" : "undefined",
    warranty_source: warrantyManual ? "manual" : "legal_estimate",
  };

  if (photoPath) {
    updatePayload.photo_path = photoPath;
  }

  if (receiptPath) {
    updatePayload.receipt_path = receiptPath;
  }

  if (paymentReceiptPath) {
    updatePayload.payment_receipt_path = paymentReceiptPath;
  }

  const { error } = await supabase
    .from("items")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  if (receiptPath && receiptFile && receiptFile.size > 0) {
    const receiptSignals = await buildReceiptSignals({
      file: receiptFile,
      store,
      purchaseDate,
      itemName,
      brand,
    });
    const extractionSignals = buildInitialExtractionSignals({
      store,
      purchaseDate,
    });

    const { data: existingReceipt } = await supabase
      .from("receipts")
      .select("id,owner_user_id")
      .or(
        `file_sha256.eq.${receiptSignals.fileSha256},metadata_fingerprint.eq.${receiptSignals.metadataFingerprint}`,
      )
      .neq("owner_user_id", user.id)
      .limit(1)
      .maybeSingle();

    const duplicateStatus = existingReceipt ? "possible_duplicate" : "clear";
    const trustScore = existingReceipt ? 35 : 100;

    const { error: receiptError } = await supabase.from("receipts").upsert(
      {
        owner_user_id: user.id,
        item_id: id,
        storage_path: receiptPath,
        original_filename: receiptSignals.originalFilename,
        mime_type: receiptSignals.mimeType,
        file_size: receiptSignals.fileSize,
        file_sha256: receiptSignals.fileSha256,
        metadata_fingerprint: receiptSignals.metadataFingerprint,
        normalized_store: receiptSignals.normalizedStore,
        normalized_purchase_date: receiptSignals.normalizedPurchaseDate,
        extracted_store: extractionSignals.extractedStore,
        extracted_purchase_date: extractionSignals.extractedPurchaseDate,
        extracted_total_amount: extractionSignals.extractedTotalAmount,
        extracted_ticket_number: extractionSignals.extractedTicketNumber,
        extracted_payment_tail: extractionSignals.extractedPaymentTail,
        ocr_status: extractionSignals.ocrStatus,
        extraction_confidence: extractionSignals.extractionConfidence,
        duplicate_status: duplicateStatus,
        trust_score: trustScore,
        duplicate_of_receipt_id: existingReceipt?.id ?? null,
        review_notes: existingReceipt
          ? "Se detectó una coincidencia de huella con un ticket de otra cuenta."
          : null,
      },
      { onConflict: "item_id" },
    );

    if (receiptError) {
      throw new Error(receiptError.message);
    }
  }

  redirect(`/items/${id}`);
}

export default async function EditItemPage({ params }: { params: Params }) {
  const { id } = await params;
  let categories: Category[] = demoCategories;
  let item: {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    brand: string | null;
    store: string | null;
    purchase_date: string;
    return_until: string | null;
    warranty_until_manual: string | null;
  } | null = null;
  let isAdmin = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    isAdmin = await getIsAdmin(supabase, user.id);

    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id,name,slug,color")
      .eq("is_active", true)
      .order("sort_order");

    categories = (categoriesData ?? []) as Category[];

    const { data } = await supabase
      .from("items")
      .select(
        "id,category_id,name,description,brand,store,purchase_date,return_until,warranty_until_manual",
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    item = data;
  }

  if (!item) {
    notFound();
  }

  const action = updateItem.bind(null, item.id);

  return (
    <AppShell isAdmin={isAdmin}>
      <Link className="pd-back" href={`/items/${item.id}`}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Volver al artículo
      </Link>

      <section className="card form-card edit-item-card" style={{ marginTop: 28 }}>
        <div>
          <span className="chip chip-yellow">Editar artículo</span>
          <h1>Actualiza esta compra</h1>
          <p className="muted">
            Puedes corregir datos y subir de nuevo la foto o el ticket si no se
            guardaron antes.
          </p>
        </div>

        <form action={action} className="edit-item-form">
          <div className="form-row">
            <label>
              <span>Nombre</span>
              <input name="name" required defaultValue={item.name} />
            </label>
            <label>
              <span>Categoría</span>
              <select name="category_id" defaultValue={item.category_id ?? ""}>
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Marca</span>
              <input name="brand" defaultValue={item.brand ?? ""} />
            </label>
            <label>
              <span>Tienda</span>
              <input name="store" defaultValue={item.store ?? ""} />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Fecha de compra</span>
              <input
                name="purchase_date"
                required
                type="date"
                defaultValue={item.purchase_date}
              />
            </label>
            <label>
              <span>Fin de devolución</span>
              <input
                name="return_until"
                type="date"
                defaultValue={item.return_until ?? ""}
              />
            </label>
          </div>

          <label>
            <span>Fecha de fin de garantía</span>
            <input
              name="warranty_until_manual"
              type="date"
              defaultValue={item.warranty_until_manual ?? ""}
            />
          </label>

          <label>
            <span>Notas</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={item.description ?? ""}
            />
          </label>

          <div className="form-row">
            <label>
              <span>Nueva foto del artículo</span>
              <input accept="image/*" name="customer_photo" type="file" />
            </label>
            <label>
              <span>Nuevo ticket o factura</span>
              <input accept="image/*,application/pdf" name="receipt" type="file" />
            </label>
          </div>

          <label>
            <span>Nuevo recibo datáfono</span>
            <input
              accept="image/*,application/pdf"
              name="payment_receipt"
              type="file"
            />
          </label>

          <div className="edit-item-form__actions">
            <button className="button button-primary" type="submit">
              Guardar cambios
            </button>
            <Link className="button button-secondary" href={`/items/${item.id}`}>
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
