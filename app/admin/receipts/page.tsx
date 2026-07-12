import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { InfinityMark } from "@/components/infinity-mark";
import { demoReceipts, hasSupabaseEnv } from "@/lib/demo";
import { formatShortDate } from "@/lib/format-date";
import { createClient } from "@/lib/supabase-server";

type ReceiptReview = {
  id: string;
  item_id: string;
  item_name: string;
  owner_email: string;
  duplicate_status: "clear" | "possible_duplicate" | "confirmed_duplicate" | "under_review";
  trust_score: number;
  normalized_store: string | null;
  normalized_purchase_date: string | null;
  review_notes: string | null;
  created_at: string;
};

type ReceiptRow = {
  id: string;
  item_id: string;
  duplicate_status: "clear" | "possible_duplicate" | "confirmed_duplicate" | "under_review";
  trust_score: number;
  normalized_store: string | null;
  normalized_purchase_date: string | null;
  review_notes: string | null;
  created_at: string;
  items: { name: string } | { name: string }[] | null;
  profiles: { email: string } | { email: string }[] | null;
};

async function updateReceiptReview(formData: FormData) {
  "use server";

  if (!hasSupabaseEnv()) {
    redirect("/admin/receipts");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const receiptId = String(formData.get("receipt_id") || "");
  const duplicateStatus = String(formData.get("duplicate_status") || "");
  const reviewNotes = String(formData.get("review_notes") || "");
  const trustScore = Number(formData.get("trust_score") || "0");

  const { error } = await supabase
    .from("receipts")
    .update({
      duplicate_status: duplicateStatus,
      review_notes: reviewNotes || null,
      trust_score: trustScore,
    })
    .eq("id", receiptId);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/receipts");
}

export default async function AdminReceiptsPage() {
  let receipts: ReceiptReview[] = demoReceipts as ReceiptReview[];
  let isDemo = true;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect("/dashboard");
    }

    const { data } = await supabase
      .from("receipts")
      .select(
        "id,item_id,duplicate_status,trust_score,normalized_store,normalized_purchase_date,review_notes,created_at,items(name),profiles!receipts_owner_user_id_fkey(email)",
      )
      .in("duplicate_status", ["possible_duplicate", "under_review", "confirmed_duplicate"])
      .order("created_at", { ascending: false });

    receipts =
      (data as ReceiptRow[] | null)?.map((receipt) => {
        const relatedItem = Array.isArray(receipt.items)
          ? receipt.items[0]
          : receipt.items;
        const relatedProfile = Array.isArray(receipt.profiles)
          ? receipt.profiles[0]
          : receipt.profiles;

        return {
          id: receipt.id,
          item_id: receipt.item_id,
          item_name: relatedItem?.name ?? "Artículo sin nombre",
          owner_email: relatedProfile?.email ?? "Usuario oculto",
        duplicate_status: receipt.duplicate_status,
        trust_score: receipt.trust_score,
        normalized_store: receipt.normalized_store,
        normalized_purchase_date: receipt.normalized_purchase_date,
        review_notes: receipt.review_notes,
        created_at: receipt.created_at,
        };
      }) ?? [];
    isDemo = false;
  }

  return (
    <AppShell isAdmin>

      <section className="card form-card admin-panel" style={{ marginTop: 28, maxWidth: 980 }}>
        <div>
          <span className="chip chip-yellow">Revisión manual</span>
          <h1>Tickets sospechosos</h1>
          <p className="muted">
            RECORDERYS agrupa aquí los tickets con huellas duplicadas o señales
            que requieren validación manual.
          </p>
          {isDemo ? (
            <p className="auth-message">
              Estás viendo datos demo. Cuando conectes Supabase y tengas una
              cuenta admin, esta pantalla servirá para revisar casos reales.
            </p>
          ) : null}
        </div>

        {receipts.length ? (
          <div className="review-list">
            {receipts.map((receipt) => (
              <article className="date-block review-card" key={receipt.id}>
                <div className="review-card__header">
                  <div>
                    <span
                      className={`chip ${
                        receipt.duplicate_status === "under_review"
                          ? "chip-yellow"
                          : "chip-red"
                      }`}
                    >
                      {receipt.duplicate_status === "under_review"
                        ? "En revisión"
                        : receipt.duplicate_status === "confirmed_duplicate"
                          ? "Duplicado confirmado"
                          : "Posible duplicado"}
                    </span>
                    <h2>{receipt.item_name}</h2>
                  </div>
                  <strong>Confianza: {receipt.trust_score}/100</strong>
                </div>

                <p className="muted">
                  {receipt.owner_email} · {receipt.normalized_store || "Tienda no detectada"} ·{" "}
                  {receipt.normalized_purchase_date || "Fecha no detectada"}
                </p>
                <p className="muted">{formatShortDate(receipt.created_at)}</p>
                <p>{receipt.review_notes || "Sin notas de revisión."}</p>

                {isDemo ? (
                  <div className="hero__actions">
                    <Link className="button button-secondary" href={`/items/${receipt.item_id}`}>
                      Ver artículo
                    </Link>
                  </div>
                ) : (
                  <form action={updateReceiptReview} className="review-form">
                    <input name="receipt_id" type="hidden" value={receipt.id} />
                    <label>
                      Estado
                      <select defaultValue={receipt.duplicate_status} name="duplicate_status">
                        <option value="possible_duplicate">Posible duplicado</option>
                        <option value="under_review">En revisión</option>
                        <option value="confirmed_duplicate">Duplicado confirmado</option>
                        <option value="clear">Limpio</option>
                      </select>
                    </label>
                    <label>
                      Confianza
                      <input
                        defaultValue={receipt.trust_score}
                        max="100"
                        min="0"
                        name="trust_score"
                        type="number"
                      />
                    </label>
                    <label>
                      Notas
                      <textarea
                        defaultValue={receipt.review_notes ?? ""}
                        name="review_notes"
                        placeholder="Añade una decisión o contexto"
                      />
                    </label>
                    <button className="button button-primary" type="submit">
                      Guardar revisión
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <InfinityMark />
            <h2>No hay tickets sospechosos</h2>
            <p className="muted">
              Todos los tickets analizados están limpios por ahora.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
