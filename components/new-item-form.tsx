"use client";

import { useState } from "react";
import { InfinityMark } from "@/components/infinity-mark";
import { formatShortDate } from "@/lib/format-date";

type CategoryOption = {
  id: string;
  name: string;
};

type NewItemFormProps = {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
};

type FileInfo = {
  name: string;
  size: number;
};

function getFileInfo(file: File | null): FileInfo | null {
  if (!file) return null;

  return {
    name: file.name || "Archivo seleccionado",
    size: file.size || 0,
  };
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const demoTicketSuggestions: Record<
  string,
  {
    itemName: string;
    store: string;
    brand: string;
    purchaseDate: string;
    returnUntil: string;
    warrantyUntilManual: string;
    categoryName: string;
  }
> = {
  "ticket-cafetera": {
    itemName: "Cafetera DeLonghi",
    store: "El Corte Inglés",
    brand: "DeLonghi",
    purchaseDate: "2026-04-10",
    returnUntil: "2026-04-24",
    warrantyUntilManual: "",
    categoryName: "Electrodomésticos",
  },
  "ticket-zapatillas": {
    itemName: "Zapatillas Nordikas",
    store: "Nordikas",
    brand: "Nordikas",
    purchaseDate: "2026-04-15",
    returnUntil: "2026-04-29",
    warrantyUntilManual: "",
    categoryName: "Calzado",
  },
  "ticket-auriculares": {
    itemName: "Auriculares Sony",
    store: "Amazon",
    brand: "Sony",
    purchaseDate: "2026-03-28",
    returnUntil: "2026-04-11",
    warrantyUntilManual: "",
    categoryName: "Electrónica",
  },
  "ticket-aspiradora": {
    itemName: "Aspiradora Dyson",
    store: "MediaMarkt",
    brand: "Dyson",
    purchaseDate: "2026-03-01",
    returnUntil: "",
    warrantyUntilManual: "",
    categoryName: "Hogar",
  },
};

export function NewItemForm({ action, categories }: NewItemFormProps) {
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [receiptFileInfo, setReceiptFileInfo] = useState<FileInfo | null>(null);
  const [paymentReceiptFileInfo, setPaymentReceiptFileInfo] =
    useState<FileInfo | null>(null);
  const [itemName, setItemName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categorySource, setCategorySource] = useState<"detected" | "manual">(
    "manual",
  );
  const [store, setStore] = useState("");
  const [brand, setBrand] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [returnUntil, setReturnUntil] = useState("");
  const [warrantyUntilManual, setWarrantyUntilManual] = useState("");
  const [storeSource, setStoreSource] = useState<"detected" | "manual">("manual");
  const [purchaseDateSource, setPurchaseDateSource] = useState<
    "detected" | "manual"
  >("manual");
  const [returnSource, setReturnSource] = useState<"estimated" | "manual">(
    "manual",
  );
  const [warrantySource, setWarrantySource] = useState<
    "legal_estimate" | "manual"
  >("legal_estimate");

  const extractionSignals = [
    {
      label: "Tienda",
      value: store || "Pendiente",
      ready: Boolean(store),
    },
    {
      label: "Fecha",
      value: purchaseDate || "Pendiente",
      ready: Boolean(purchaseDate),
    },
    {
      label: "Producto",
      value: itemName || "Pendiente",
      ready: Boolean(itemName),
    },
    {
      label: "Marca",
      value: brand || "Pendiente",
      ready: Boolean(brand),
    },
  ];

  const completion = extractionSignals.filter((signal) => signal.ready).length;
  const selectedCategoryName =
    categories.find((category) => category.id === categoryId)?.name ??
    "Sin categoría";
  const coverPhotoPreview = photoPreviews[coverPhotoIndex] ?? photoPreviews[0] ?? null;

  return (
    <form action={action} className="item-form item-form--rich">
      <div className="item-form__grid">
        <div className="item-form__main">
          <div className="form-section">
            <div className="form-section__header">
              <span className="chip chip-yellow">Paso 1</span>
              <h2>Sube el producto y su ticket</h2>
            </div>

            <div className="upload-grid">
              <label className="upload-card">
                <span className="upload-card__title">Fotos del cliente</span>
                <div className="upload-card__trigger">
                  <span className="upload-card__button">Seleccionar archivo</span>
                  <span className="upload-card__filename">
                    {photoFiles.length
                      ? `${photoFiles.length} archivo${photoFiles.length > 1 ? "s" : ""}`
                      : "Ningún archivo seleccionado"}
                  </span>
                </div>
                <input
                  accept="image/*"
                  multiple
                  name="customer_photos"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setPhotoFiles(files);
                    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
                    setCoverPhotoIndex(0);
                  }}
                  type="file"
                />
                {coverPhotoPreview ? (
                  <>
                    <img alt="" className="upload-card__preview" src={coverPhotoPreview} />
                    <div className="upload-card__meta">
                      <span className="chip chip-blue">
                        Portada {coverPhotoIndex + 1}/{photoPreviews.length}
                      </span>
                      <small>
                        {photoFiles.length} foto{photoFiles.length > 1 ? "s" : ""} subida
                        {photoFiles.length > 1 ? "s" : ""}
                      </small>
                    </div>
                    {photoPreviews.length > 1 ? (
                      <div className="photo-picker">
                        {photoPreviews.map((preview, index) => (
                          <button
                            className={`photo-picker__thumb ${
                              coverPhotoIndex === index ? "photo-picker__thumb--active" : ""
                            }`}
                            key={`${preview}-${index}`}
                            onClick={(event) => {
                              event.preventDefault();
                              setCoverPhotoIndex(index);
                            }}
                            type="button"
                          >
                            <img alt={`Foto ${index + 1}`} src={preview} />
                            <span className="photo-picker__label">
                              {coverPhotoIndex === index ? "Portada" : `Foto ${index + 1}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="upload-card__placeholder">
                    <InfinityMark />
                    <p>Sube una o varias fotos y elige cuál será la portada</p>
                  </div>
                )}
                <input
                  name="cover_photo_index"
                  type="hidden"
                  value={String(coverPhotoIndex)}
                />
              </label>

              <label className="upload-card">
                <span className="upload-card__title">Ticket o factura</span>
                <div className="upload-card__trigger">
                  <span className="upload-card__button">Seleccionar archivo</span>
                  <span className="upload-card__filename">
                    {receiptFileInfo
                      ? receiptFileInfo.name
                      : "Ningún archivo seleccionado"}
                  </span>
                </div>
                <input
                  accept="image/*,application/pdf"
                  name="receipt"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setReceiptFileInfo(getFileInfo(file));
                    if (!file) return;

                    const matchedEntry = Object.entries(demoTicketSuggestions).find(
                      ([key]) => file.name.toLowerCase().includes(key),
                    );

                    if (!matchedEntry) return;

                    const suggestion = matchedEntry[1];
                    setItemName((current) => current || suggestion.itemName);
                    setStore(suggestion.store);
                    setBrand((current) => current || suggestion.brand);
                    setPurchaseDate(suggestion.purchaseDate);
                    setReturnUntil(suggestion.returnUntil);
                    setWarrantyUntilManual(suggestion.warrantyUntilManual);
                    const matchedCategory = categories.find(
                      (category) => category.name === suggestion.categoryName,
                    );
                    if (matchedCategory) {
                      setCategoryId(matchedCategory.id);
                      setCategorySource("detected");
                    }
                    setStoreSource("detected");
                    setPurchaseDateSource("detected");
                    setReturnSource(suggestion.returnUntil ? "estimated" : "manual");
                    setWarrantySource(
                      suggestion.warrantyUntilManual ? "manual" : "legal_estimate",
                    );
                  }}
                  type="file"
                />
                <div className="upload-card__placeholder upload-card__placeholder--receipt">
                  <span className="chip chip-blue">
                    {receiptFileInfo ? "Ticket cargado" : "Aún sin ticket"}
                  </span>
                  <p>
                    {receiptFileInfo
                      ? `${receiptFileInfo.name} · ${formatBytes(receiptFileInfo.size)}`
                      : "Acepta imagen o PDF. Generaremos una huella antifraude antes de guardarlo."}
                  </p>
                </div>
              </label>

              <label className="upload-card">
                <span className="upload-card__title">Recibo datáfono</span>
                <div className="upload-card__trigger">
                  <span className="upload-card__button">Seleccionar archivo</span>
                  <span className="upload-card__filename">
                    {paymentReceiptFileInfo
                      ? paymentReceiptFileInfo.name
                      : "Opcional"}
                  </span>
                </div>
                <input
                  accept="image/*,application/pdf"
                  name="payment_receipt"
                  onChange={(event) => {
                    setPaymentReceiptFileInfo(
                      getFileInfo(event.target.files?.[0] ?? null),
                    );
                  }}
                  type="file"
                />
                <div className="upload-card__placeholder upload-card__placeholder--receipt">
                  <span className="chip chip-blue">
                    {paymentReceiptFileInfo ? "Datáfono cargado" : "Opcional"}
                  </span>
                  <p>
                    {paymentReceiptFileInfo
                      ? `${paymentReceiptFileInfo.name} · ${formatBytes(paymentReceiptFileInfo.size)}`
                      : "Guarda aquí la copia del pago por tarjeta si quieres tenerla disponible para cambios o justificantes."}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <span className="chip chip-yellow">Paso 2</span>
              <h2>Completa la ficha</h2>
            </div>

            <label>
              Nombre del artículo
              <input
                name="name"
                onChange={(event) => setItemName(event.target.value)}
                placeholder="Cafetera DeLonghi"
                required
                value={itemName}
              />
            </label>
            <label>
              <span className="field-label">
                <span>Categoría</span>
                <span
                  className={`chip ${
                    categorySource === "detected" ? "chip-blue" : "chip-yellow"
                  }`}
                >
                  {categorySource === "detected" ? "Detectado" : "Manual"}
                </span>
              </span>
              <select
                name="category_id"
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setCategorySource("manual");
                }}
                value={categoryId}
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                <span className="field-label">
                  <span>Fecha de compra</span>
                  <span
                    className={`chip ${
                      purchaseDateSource === "detected" ? "chip-blue" : "chip-yellow"
                    }`}
                  >
                    {purchaseDateSource === "detected" ? "Detectado" : "Manual"}
                  </span>
                </span>
                <input
                  name="purchase_date"
                  onChange={(event) => {
                    setPurchaseDate(event.target.value);
                    setPurchaseDateSource("manual");
                  }}
                  required
                  type="date"
                  value={purchaseDate}
                />
                <input
                  name="purchase_date_source"
                  type="hidden"
                  value={purchaseDateSource}
                />
              </label>
              <label>
                <span className="field-label">
                  <span>Tienda</span>
                  <span
                    className={`chip ${
                      storeSource === "detected" ? "chip-blue" : "chip-yellow"
                    }`}
                  >
                    {storeSource === "detected" ? "Detectado" : "Manual"}
                  </span>
                </span>
                <input
                  name="store"
                  onChange={(event) => {
                    setStore(event.target.value);
                    setStoreSource("manual");
                  }}
                  placeholder="Nordikas, Amazon, MediaMarkt..."
                  value={store}
                />
                <input name="store_source" type="hidden" value={storeSource} />
              </label>
            </div>
            <div className="form-row">
              <label>
                Marca
                <input
                  name="brand"
                  onChange={(event) => setBrand(event.target.value)}
                  placeholder="Apple, Dyson, DeLonghi..."
                  value={brand}
                />
              </label>
              <label>
                <span className="field-label">
                  <span>Fin de devolución</span>
                  <span
                    className={`chip ${
                      returnSource === "estimated" ? "chip-blue" : "chip-yellow"
                    }`}
                  >
                    {returnSource === "estimated" ? "Estimado" : "Manual"}
                  </span>
                </span>
                <input
                  name="return_until"
                  onChange={(event) => {
                    setReturnUntil(event.target.value);
                    setReturnSource("manual");
                  }}
                  type="date"
                  value={returnUntil}
                />
                <input name="return_until_source" type="hidden" value={returnSource} />
              </label>
            </div>
            <label>
              <span className="field-label">
                <span>Fin de garantía</span>
                <span
                  className={`chip ${
                    warrantySource === "legal_estimate" ? "chip-blue" : "chip-yellow"
                  }`}
                >
                  {warrantySource === "legal_estimate"
                    ? "Estimado legal"
                    : "Manual"}
                </span>
              </span>
              <input
                name="warranty_until_manual"
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setWarrantyUntilManual(nextValue);
                  setWarrantySource(nextValue ? "manual" : "legal_estimate");
                }}
                type="date"
                value={warrantyUntilManual}
              />
              <input
                name="warranty_until_source"
                type="hidden"
                value={warrantySource}
              />
            </label>
            <label>
              Notas
              <textarea
                name="description"
                placeholder="Detalles útiles de la compra"
              />
            </label>
          </div>
        </div>

        <aside className="item-form__aside">
          <div className="card analysis-card">
            <span className="chip chip-blue">Preanálisis</span>
            <h2>Resumen antes de guardar</h2>
            <p className="muted">
              RECORDERYS está preparado para extraer datos del ticket y detectar
              duplicados entre cuentas.
            </p>

            <div className="analysis-card__meter">
              <strong>{completion}/4 señales preparadas</strong>
              <div className="analysis-card__bar">
                <span style={{ width: `${(completion / 4) * 100}%` }} />
              </div>
            </div>

            <div className="analysis-card__signals">
              {extractionSignals.map((signal) => (
                <div className="analysis-signal" key={signal.label}>
                  <span className={`chip ${signal.ready ? "chip-green" : "chip-yellow"}`}>
                    {signal.label}
                  </span>
                  <strong>{signal.value}</strong>
                </div>
              ))}
            </div>

            <div className="analysis-card__notes">
              <p>
                {receiptFileInfo
                  ? "El ticket se guardará con huella única de archivo y huella de metadatos."
                  : "Sube el ticket para activar la huella antifraude y la futura extracción OCR."}
              </p>
              <p>
                {paymentReceiptFileInfo
                  ? "También guardaremos el recibo del datáfono como justificante de pago separado."
                  : "El recibo del datáfono es opcional y quedará separado del ticket de compra."}
              </p>
              <p>
                {photoFiles.length
                  ? "La portada elegida se verá en el dashboard y el resto de fotos quedarán como prueba del cliente."
                  : "Las fotos del artículo ayudan a validar la compra y a documentar incidencias futuras."}
              </p>
              <p>
                Cuando el sistema detecte tienda, fecha o plazos del ticket, los
                completará por defecto y podrás corregirlos si hace falta.
              </p>
            </div>

            <button className="button button-primary" type="submit">
              Guardar artículo
            </button>
          </div>

          <div className="card draft-preview">
            <span className="chip chip-yellow">Vista previa</span>
            <h2>Así se verá tu ficha</h2>

            <article className="card item-card item-card--preview">
              <div className="item-card__image">
                {coverPhotoPreview ? (
                  <img alt="" src={coverPhotoPreview} />
                ) : (
                  <InfinityMark />
                )}
              </div>
              <div className="item-card__body">
                <div className="item-card__top">
                  <span className="chip chip-blue">{selectedCategoryName}</span>
                  <span
                    className={`chip ${
                      categorySource === "detected" ? "chip-green" : "chip-yellow"
                    }`}
                  >
                    {categorySource === "detected" ? "Autoclasificado" : "Editable"}
                  </span>
                </div>
                <h3>{itemName || "Tu artículo aparecerá aquí"}</h3>
                <p className="muted">
                  {[brand, store].filter(Boolean).join(" · ") ||
                    "Marca y tienda cuando estén disponibles"}
                </p>
                <div className="item-card__dates">
                  <span className="chip chip-yellow">
                    Devolución: {formatShortDate(returnUntil)}
                  </span>
                  <span className="chip chip-green">
                    Garantía:{" "}
                    {warrantyUntilManual
                      ? formatShortDate(warrantyUntilManual)
                      : "Estimado legal"}
                  </span>
                </div>
                <small className="muted">
                  Compra: {purchaseDate ? formatShortDate(purchaseDate) : "Pendiente"}
                </small>
              </div>
            </article>

            {photoPreviews.length ? (
              <div className="preview-gallery">
                <div className="detail-section__header">
                  <h3>Fotos del cliente</h3>
                  <span className="chip chip-blue">
                    {photoPreviews.length} archivo{photoPreviews.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="detail-gallery">
                  {photoPreviews.map((preview, index) => (
                    <div className="detail-gallery__item" key={`preview-${index}`}>
                      <img alt={`Vista previa ${index + 1}`} src={preview} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  );
}
