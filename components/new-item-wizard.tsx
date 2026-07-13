"use client";

import { useRef, useState } from "react";
import { compressInputFiles } from "@/lib/compress-image";
import type { ExtractionResult } from "@/app/api/extract-receipt/route";

type CategoryOption = {
  id: string;
  name: string;
};

type NewItemWizardProps = {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
};

type FieldSource = "ai" | "manual";

const WARRANTY_OPTIONS = [
  { label: "Sin garantía", years: 0 },
  { label: "1 año", years: 1 },
  { label: "2 años (ley)", years: 2 },
  { label: "3 años", years: 3 },
] as const;

const RETURN_OPTIONS = [
  { label: "Sin devolución", days: 0 },
  { label: "14 días", days: 14 },
  { label: "30 días", days: 30 },
  { label: "60 días", days: 60 },
] as const;

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addYears(date: string, years: number): string {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

async function extractReceiptData(file: File): Promise<ExtractionResult | null> {
  try {
    const fd = new FormData();
    fd.append("receipt", file);
    const res = await fetch("/api/extract-receipt", { method: "POST", body: fd });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function NewItemWizard({ action, categories }: NewItemWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [receiptName, setReceiptName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractionDone, setExtractionDone] = useState(false);

  const [photoCount, setPhotoCount] = useState(0);
  const [paymentName, setPaymentName] = useState("");

  const [itemName, setItemName] = useState("");
  const [store, setStore] = useState("");
  const [brand, setBrand] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [aiFields, setAiFields] = useState<Record<string, boolean>>({});

  const [warrantyYears, setWarrantyYears] = useState<number>(2);
  const [returnDays, setReturnDays] = useState<number>(14);
  const [aiReturnUntil, setAiReturnUntil] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const returnUntil = aiReturnUntil
    ? aiReturnUntil
    : purchaseDate && returnDays > 0
      ? addDays(purchaseDate, returnDays)
      : "";
  const warrantyManual =
    purchaseDate && warrantyYears > 0 && warrantyYears !== 2
      ? addYears(purchaseDate, warrantyYears)
      : "";

  const canContinueStep2 = itemName.trim() !== "" && purchaseDate !== "";
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  async function onReceiptChange(file: File | null) {
    setReceiptName(file?.name ?? "");
    setExtractionDone(false);
    if (!file) return;

    setExtracting(true);
    const result = await extractReceiptData(file);
    setExtracting(false);
    setExtractionDone(true);

    if (!result) return;
    const THRESHOLD = 60;
    const marked: Record<string, boolean> = {};

    if (result.name && result.field_confidence.name >= THRESHOLD && !itemName) {
      setItemName(result.name);
      marked.name = true;
    }
    if (result.store && result.field_confidence.store >= THRESHOLD) {
      setStore(result.store);
      marked.store = true;
    }
    if (result.brand && !brand) {
      setBrand(result.brand);
      marked.brand = true;
    }
    if (result.purchase_date && result.field_confidence.purchase_date >= THRESHOLD) {
      setPurchaseDate(result.purchase_date);
      marked.purchase_date = true;
    }
    if (result.return_until && result.field_confidence.return_until >= THRESHOLD) {
      setAiReturnUntil(result.return_until);
    }
    if (result.category_name && result.field_confidence.category_name >= THRESHOLD) {
      const matched = categories.find((c) => c.name === result.category_name);
      if (matched) {
        setCategoryId(matched.id);
        marked.category = true;
      }
    }
    setAiFields(marked);
  }

  const selectedCategoryName =
    categories.find((c) => c.id === categoryId)?.name ?? "Sin categoría";

  return (
    <form
      action={action}
      className="wizard"
      onSubmit={() => setSaving(true)}
      ref={formRef}
    >
      {/* Campos derivados que espera el server action */}
      <input name="return_until" type="hidden" value={returnUntil} />
      <input
        name="return_until_source"
        type="hidden"
        value={aiReturnUntil ? "estimated" : returnDays > 0 ? "estimated" : "manual"}
      />
      <input name="warranty_until_manual" type="hidden" value={warrantyManual} />
      <input
        name="warranty_until_source"
        type="hidden"
        value={warrantyManual ? "manual" : "legal_estimate"}
      />
      <input name="category_id" type="hidden" value={categoryId} />
      <input name="store_source" type="hidden" value={aiFields.store ? "detected" : "manual"} />
      <input
        name="purchase_date_source"
        type="hidden"
        value={aiFields.purchase_date ? "detected" : "manual"}
      />
      <input name="cover_photo_index" type="hidden" value="0" />

      <div className="wizard__progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="wizard__step-label">Paso {step} de 3</p>

      {/* ============ PASO 1: ticket ============ */}
      <section className={step === 1 ? "wizard__panel" : "wizard__panel wizard__panel--hidden"}>
        <h2>Foto del ticket</h2>
        <p className="wizard__hint">
          La IA leerá el ticket y rellenará los datos por ti. También puedes
          añadir fotos del producto y el recibo del datáfono.
        </p>

        <label className={`wizard-dropzone ${receiptName ? "wizard-dropzone--filled" : ""}`}>
          <input
            accept="image/*,application/pdf"
            name="receipt"
            onChange={async (e) => {
              await compressInputFiles(e.target);
              await onReceiptChange(e.target.files?.[0] ?? null);
            }}
            type="file"
          />
          <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          {extracting ? (
            <>
              <strong>Analizando ticket…</strong>
              <small>La IA está leyendo los datos. Un momento.</small>
            </>
          ) : receiptName ? (
            <>
              <strong>{receiptName}</strong>
              <small>
                {extractionDone
                  ? "Datos extraídos. Continúa para revisarlos."
                  : "Ticket cargado."}
              </small>
            </>
          ) : (
            <>
              <strong>Haz una foto o sube el ticket</strong>
              <small>Foto o PDF. Se genera huella antifraude.</small>
            </>
          )}
        </label>

        <div className="wizard__extras">
          <label className="wizard-file">
            <input
              accept="image/*"
              multiple
              name="customer_photos"
              onChange={async (e) => {
                await compressInputFiles(e.target);
                setPhotoCount(e.target.files?.length ?? 0);
              }}
              type="file"
            />
            <span>
              {photoCount
                ? `${photoCount} foto${photoCount > 1 ? "s" : ""} del producto`
                : "Fotos del producto (opcional)"}
            </span>
          </label>
          <label className="wizard-file">
            <input
              accept="image/*,application/pdf"
              name="payment_receipt"
              onChange={async (e) => {
                await compressInputFiles(e.target);
                setPaymentName(e.target.files?.[0]?.name ?? "");
              }}
              type="file"
            />
            <span>{paymentName || "Recibo datáfono (opcional)"}</span>
          </label>
        </div>

        <div className="wizard__nav">
          <button
            className="pd-button pd-button--primary"
            disabled={extracting}
            onClick={() => setStep(2)}
            type="button"
          >
            Continuar
          </button>
        </div>
      </section>

      {/* ============ PASO 2: datos ============ */}
      <section className={step === 2 ? "wizard__panel" : "wizard__panel wizard__panel--hidden"}>
        <h2>Datos de la compra</h2>
        <p className="wizard__hint">
          {extractionDone
            ? "Revisa lo que ha detectado la IA y corrige lo que haga falta."
            : "Completa los datos del producto."}
        </p>

        <div className="wizard__fields">
          <label>
            Producto {aiFields.name && <em className="wizard-ai-tag">IA</em>}
            <input
              name="name"
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Cafetera DeLonghi"
              required
              value={itemName}
            />
          </label>
          <div className="wizard__row">
            <label>
              Tienda {aiFields.store && <em className="wizard-ai-tag">IA</em>}
              <input
                name="store"
                onChange={(e) => setStore(e.target.value)}
                placeholder="El Corte Inglés"
                value={store}
              />
            </label>
            <label>
              Marca {aiFields.brand && <em className="wizard-ai-tag">IA</em>}
              <input
                name="brand"
                onChange={(e) => setBrand(e.target.value)}
                placeholder="DeLonghi"
                value={brand}
              />
            </label>
          </div>
          <label>
            Fecha de compra {aiFields.purchase_date && <em className="wizard-ai-tag">IA</em>}
            <input
              name="purchase_date"
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              type="date"
              value={purchaseDate}
            />
          </label>
          <label>
            Notas (opcional)
            <textarea name="description" placeholder="Detalles útiles de la compra" rows={2} />
          </label>
        </div>

        <p className="wizard__chips-label">
          Categoría {aiFields.category && <em className="wizard-ai-tag">IA</em>}
        </p>
        <div className="wizard__chips">
          {categories.map((c) => (
            <button
              className={`wizard-chip ${categoryId === c.id ? "wizard-chip--active" : ""}`}
              key={c.id}
              onClick={() => setCategoryId(categoryId === c.id ? "" : c.id)}
              type="button"
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="wizard__nav">
          <button className="pd-button pd-button--secondary" onClick={() => setStep(1)} type="button">
            Atrás
          </button>
          <button
            className="pd-button pd-button--primary"
            disabled={!canContinueStep2}
            onClick={() => setStep(3)}
            type="button"
          >
            Continuar
          </button>
        </div>
      </section>

      {/* ============ PASO 3: plazos + resumen ============ */}
      <section className={step === 3 ? "wizard__panel" : "wizard__panel wizard__panel--hidden"}>
        <h2>Plazos y resumen</h2>

        <p className="wizard__chips-label">Garantía</p>
        <div className="wizard__chips">
          {WARRANTY_OPTIONS.map((option) => (
            <button
              className={`wizard-chip ${warrantyYears === option.years ? "wizard-chip--active" : ""}`}
              key={option.years}
              onClick={() => setWarrantyYears(option.years)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="wizard__chips-label">Plazo de devolución</p>
        <div className="wizard__chips">
          {RETURN_OPTIONS.map((option) => (
            <button
              className={`wizard-chip ${
                !aiReturnUntil && returnDays === option.days ? "wizard-chip--active" : ""
              }`}
              key={option.days}
              onClick={() => {
                setAiReturnUntil(null);
                setReturnDays(option.days);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
          {aiReturnUntil ? (
            <button className="wizard-chip wizard-chip--active" type="button">
              Detectado: {aiReturnUntil}
            </button>
          ) : null}
        </div>

        <div className="wizard-summary card-v2">
          <h3>Resumen</h3>
          <dl>
            <div>
              <dt>Producto</dt>
              <dd>{itemName || "—"}</dd>
            </div>
            <div>
              <dt>Tienda</dt>
              <dd>{store || "—"}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{selectedCategoryName}</dd>
            </div>
            <div>
              <dt>Compra</dt>
              <dd>{purchaseDate || "—"}</dd>
            </div>
            <div>
              <dt>Devolución hasta</dt>
              <dd>{returnUntil || "Sin devolución"}</dd>
            </div>
            <div>
              <dt>Garantía</dt>
              <dd>
                {warrantyYears === 0
                  ? "Sin garantía"
                  : warrantyManual
                    ? `Hasta ${warrantyManual}`
                    : "2 años (estimación legal)"}
              </dd>
            </div>
            <div>
              <dt>Ticket</dt>
              <dd>{receiptName || "No adjuntado"}</dd>
            </div>
          </dl>
        </div>

        <div className="wizard__nav">
          <button className="pd-button pd-button--secondary" onClick={() => setStep(2)} type="button">
            Atrás
          </button>
          <button className="pd-button pd-button--primary" disabled={saving} type="submit">
            {saving ? "Guardando…" : "Guardar compra"}
          </button>
        </div>
      </section>
    </form>
  );
}
