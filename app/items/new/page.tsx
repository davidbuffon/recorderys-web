import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { AppNav } from "@/components/app-nav";
import { NewItemForm } from "@/components/new-item-form";
import { getIsAdmin } from "@/lib/admin";
import { demoCategories, hasSupabaseEnv } from "@/lib/demo";
import {
  buildInitialExtractionSignals,
  buildReceiptSignals,
} from "@/lib/receipt-antifraud";
import { createClient } from "@/lib/supabase-server";
import { uploadUserFile } from "@/lib/storage";

async function createItem(formData: FormData) {
  "use server";

  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categoryId = String(formData.get("category_id") || "");
  const itemName = String(formData.get("name") || "");
  const description = String(formData.get("description") || "");
  const store = String(formData.get("store") || "");
  const storeSource = String(formData.get("store_source") || "manual");
  const brand = String(formData.get("brand") || "");
  const purchaseDate = String(formData.get("purchase_date") || "");
  const purchaseDateSource = String(
    formData.get("purchase_date_source") || "manual",
  );
  const returnUntil = String(formData.get("return_until") || "");
  const returnUntilSource = String(
    formData.get("return_until_source") || "manual",
  );
  const warrantyManual = String(formData.get("warranty_until_manual") || "");
  const warrantyUntilSource = String(
    formData.get("warranty_until_source") || "legal_estimate",
  );
  const customerPhotos = formData
    .getAll("customer_photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const coverPhotoIndex = Number(formData.get("cover_photo_index") || 0);
  const photoFile =
    customerPhotos[coverPhotoIndex] ?? customerPhotos[0] ?? null;
  const receiptFile = formData.get("receipt") as File | null;
  const paymentReceiptFile = formData.get("payment_receipt") as File | null;
  const receiptSignals = receiptFile
    ? await buildReceiptSignals({
        file: receiptFile,
        store,
        purchaseDate,
        itemName,
        brand,
      })
    : null;
  const extractionSignals = buildInitialExtractionSignals({
    store,
    purchaseDate,
  });

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

  const insertPayload: {
    user_id: string;
    category_id: string | null;
    name: string;
    description: string;
    brand: string;
    store: string;
    purchase_date: string;
    return_until: string | null;
    warranty_until_manual: string | null;
    return_source: "estimated" | "manual" | "undefined";
    warranty_source: "manual" | "legal_estimate";
    photo_path: string | null;
    receipt_path: string | null;
    payment_receipt_path?: string;
  } = {
    user_id: user.id,
    category_id: categoryId || null,
    name: itemName,
    description,
    brand,
    store,
    purchase_date: purchaseDate,
    return_until: returnUntil || null,
    warranty_until_manual: warrantyManual || null,
    return_source: returnUntil
      ? returnUntilSource === "estimated"
        ? "estimated"
        : "manual"
      : "undefined",
    warranty_source:
      warrantyManual && warrantyUntilSource === "manual"
        ? "manual"
        : "legal_estimate",
    photo_path: photoPath,
    receipt_path: receiptPath,
  };

  if (paymentReceiptPath) {
    insertPayload.payment_receipt_path = paymentReceiptPath;
  }

  const { data: insertedItem, error } = await supabase
    .from("items")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (insertedItem && receiptPath && receiptSignals) {
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

    const { error: receiptError } = await supabase.from("receipts").insert({
      owner_user_id: user.id,
      item_id: insertedItem.id,
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
    });

    if (receiptError) {
      throw new Error(receiptError.message);
    }
  }

  redirect("/dashboard");
}

export default async function NewItemPage() {
  noStore();

  let categories: { id: string; name: string }[] = [];
  let isAdmin = false;

  if (!hasSupabaseEnv()) {
    isAdmin = true;
    categories = demoCategories.map(({ id, name }) => ({ id, name }));
  } else {
    let hasUser = false;

    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not load user for new item page", userError.message);
      }

      hasUser = Boolean(user);

      if (hasUser && user) {
        isAdmin = await getIsAdmin(supabase, user.id);

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id,name")
          .eq("is_active", true)
          .order("sort_order");

        if (categoriesError) {
          console.error(
            "Could not load categories for new item page",
            categoriesError.message,
          );
        }

        categories = categoriesData ?? [];
      }
    } catch (error) {
      console.error("Could not prepare new item page", error);
    }

    if (!hasUser) {
      redirect("/login");
    }
  }

  return (
    <main className="shell">
      <AppNav isAdmin={isAdmin} />

      <section className="card form-card new-item-card" style={{ marginTop: 28 }}>
        <div>
          <span className="chip chip-yellow">Nuevo artículo</span>
          <h1>Guarda una compra importante</h1>
          <p className="muted">
            Primero creamos la ficha manual. Después añadiremos subida de ticket e IA de clasificación.
          </p>
          {!hasSupabaseEnv() ? (
            <p className="auth-message">
              Estás en modo demo. El formulario sirve para revisar la UX, pero
              aún no guarda datos persistentes.
            </p>
          ) : null}
          <p className="muted">
            RECORDERYS genera una huella del ticket para detectar duplicados y
            marcar posibles fraudes entre cuentas.
          </p>
          <p className="muted">
            La extracción automática del ticket queda preparada para capturar
            tienda, fecha, importe y número de ticket en la siguiente fase.
          </p>
        </div>

        <NewItemForm action={createItem} categories={categories} />
      </section>
    </main>
  );
}
