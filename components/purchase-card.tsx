"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ItemCardData } from "@/lib/types";
import { formatShortDate } from "@/lib/format-date";

const sections = [
  { id: "ticket", label: "Ticket", path: "M5 3h14v18l-3-2-4 2-4-2-3 2Z M9 8h6 M9 12h6" },
  { id: "plazos", label: "Plazos", path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2" },
  { id: "fotos", label: "Fotos", path: "M3 4h18v16H3Z M3 17l6-6 4 4 3-3 5 5 M16 8h.01" },
  { id: "datos", label: "Datos", path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 11v6 M12 7h.01" },
] as const;
type Section = typeof sections[number]["id"];

export function PurchaseCard({ item, demo = false }: { item: ItemCardData; demo?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [section, setSection] = useState<Section>("ticket");
  const image = item.cover_image_path || item.photo_path;
  const receipt = item.receipts?.[0];
  const review = receipt?.duplicate_status === "possible_duplicate" ? "Ticket pendiente de revisión" : receipt?.duplicate_status === "under_review" ? "Ticket en revisión" : receipt?.duplicate_status === "confirmed_duplicate" ? "Ticket duplicado" : null;
  const warranty = item.warranty_until_manual ?? item.warranty_until;
  function open(id: Section) { setSection(id); dialog.current?.showModal(); }
  const dates = <dl className="purchase-dates"><div><dt>Compra</dt><dd>{formatShortDate(item.purchase_date)}</dd></div><div><dt>Garantía hasta</dt><dd>{warranty ? formatShortDate(warranty) : "No registrada"}</dd></div></dl>;
  return <article className="purchase-card">
    <div className="purchase-visual">{image ? <img src={image} alt={item.name} loading="lazy" /> : <span>Sin foto del producto</span>}</div>
    <div className="purchase-copy"><div className="purchase-meta"><span>{item.categories?.name || "Sin categoría"}</span></div>
      <h2>{demo ? item.name : <Link href={`/items/${item.id}`}>{item.name}</Link>}</h2><p>{item.store || "Tienda no registrada"}</p>
      {review && <p className="purchase-notice">{review}</p>}
    </div>
    <div className="purchase-actions">{sections.map(s => {
      const content = <><svg aria-hidden="true" viewBox="0 0 24 24"><path d={s.path} /></svg>{s.label}</>;
      return demo ? <button key={s.id} type="button" onClick={() => open(s.id)} aria-label={`${s.label} de ${item.name}`}>{content}</button> : <Link key={s.id} href={`/items/${item.id}#${s.id}`} aria-label={`${s.label} de ${item.name}`}>{content}</Link>;
    })}</div>
    {demo && <dialog ref={dialog} className="purchase-dialog" aria-label={`${item.name}: ejemplo de Biblioteca`}><div className="purchase-dialog-inner"><button className="purchase-close" type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar ficha">Cerrar ×</button><p>Ejemplo de demostración</p><h2>{item.name}</h2><div className="purchase-tabs">{sections.map(s=><button type="button" key={s.id} onClick={()=>setSection(s.id)} aria-pressed={section===s.id}>{s.label}</button>)}</div>
      {section === "ticket" && <section><h3>Ticket original</h3>{item.receipt_path ? <><a href={item.receipt_path} target="_blank" rel="noreferrer">Abrir ticket de demostración ↗</a><img src={item.receipt_path} alt={`Ticket de demostración de ${item.name}`} /></> : <p>Sin ticket adjunto.</p>}<p>Justificante de pago: no adjunto en este ejemplo.</p></section>}
      {section === "plazos" && <section><h3>Fechas registradas</h3>{dates}<p>Fin de devolución: {item.return_until ? formatShortDate(item.return_until) : "No registrado"}</p></section>}
      {section === "fotos" && <section><h3>Fotos del producto</h3>{[image,...(item.user_photos || [])].filter(Boolean).map((src,i)=><img key={`${src}-${i}`} src={src!} alt={`${item.name}, imagen de demostración ${i+1}`} />)}</section>}
      {section === "datos" && <section><h3>Datos de la compra</h3><p>Marca: {item.brand || "No registrada"}</p><p>Tienda: {item.store || "No registrada"}</p><p>Categoría: {item.categories?.name || "Sin categoría"}</p><p>Estos datos son ejemplos del proyecto, no compras de una cuenta real.</p></section>}
    </div></dialog>}
  </article>;
}
