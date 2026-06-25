import { BrandLogo } from "@/components/brand-logo";
import { InfinityMark } from "@/components/infinity-mark";
import type { ItemCardData } from "@/lib/types";
import { formatShortDate, isPastDate } from "@/lib/format-date";

export function ItemCard({ item }: { item: ItemCardData }) {
  const subtitle = [item.brand, item.store].filter(Boolean).join(" · ");
  const receipt = item.receipts?.[0] ?? null;
  const returnExpired = isPastDate(item.return_until);
  const riskChip =
    receipt?.duplicate_status === "possible_duplicate"
      ? { className: "chip-red", label: "Ticket sospechoso" }
      : receipt?.duplicate_status === "under_review"
        ? { className: "chip-yellow", label: "En revisión" }
        : receipt?.duplicate_status === "confirmed_duplicate"
          ? { className: "chip-red", label: "Duplicado" }
          : null;

  return (
    <article className="card item-card">
      <div className="item-card__image">
        {item.cover_image_path || item.photo_path ? (
          <img alt="" src={item.cover_image_path || item.photo_path || ""} />
        ) : (
          <InfinityMark />
        )}
      </div>
      <div className="item-card__body">
        <div className="item-card__top">
          <span className="chip chip-blue">
            {item.categories?.name ?? "Sin categoría"}
          </span>
          {riskChip ? <span className={`chip ${riskChip.className}`}>{riskChip.label}</span> : null}
        </div>
        <h3>{item.name}</h3>
        <p className="muted">{subtitle || "Compra guardada"}</p>
        <div className="item-card__dates">
          <span className={`chip ${returnExpired ? "chip-red" : "chip-yellow"}`}>
            Devolución: {formatShortDate(item.return_until)}
            {returnExpired ? " · Caducada" : ""}
          </span>
          <span className="chip chip-green">
            Garantía: {formatShortDate(item.warranty_until)}
          </span>
        </div>
        <BrandLogo brand={item.brand} className="item-card__brand-logo" />
      </div>
    </article>
  );
}
