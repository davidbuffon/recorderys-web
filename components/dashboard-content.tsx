"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { InfinityMark } from "@/components/infinity-mark";
import { ItemCard } from "@/components/item-card";
import { formatShortDate } from "@/lib/format-date";
import type { Category, ItemCardData } from "@/lib/types";

type DashboardContentProps = {
  categories: Category[];
  hasItems?: boolean;
  initialCategorySlug?: string;
  items: ItemCardData[];
  search?: string;
};

export function DashboardContent({
  categories,
  hasItems = false,
  initialCategorySlug = "",
  items,
  search = "",
}: DashboardContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategorySlug);

  function selectCategory(slug: string) {
    setSelectedCategory(slug);
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("category", slug);
    } else {
      url.searchParams.delete("category");
    }
    window.history.replaceState(null, "", url);
  }
  const typedItems = useMemo(
    () =>
      selectedCategory
        ? items.filter((item) => item.categories?.slug === selectedCategory)
        : items,
    [items, selectedCategory],
  );
  const selectedCategoryName =
    categories.find((category) => category.slug === selectedCategory)?.name ?? "";
  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + 30);
  const warrantyActiveCount = typedItems.filter((item) => {
    if (!item.warranty_until) return false;
    const date = new Date(item.warranty_until);
    return !Number.isNaN(date.getTime()) && date >= now;
  }).length;
  const urgentMilestones = typedItems
    .flatMap((item) => {
      const milestones: {
        date: string;
        item: ItemCardData;
        label: string;
        tone: "chip-yellow" | "chip-green";
      }[] = [];

      if (item.return_until) {
        milestones.push({
          date: item.return_until,
          item,
          label: `Devolución: ${formatShortDate(item.return_until)}`,
          tone: "chip-yellow",
        });
      }

      if (item.warranty_until) {
        milestones.push({
          date: item.warranty_until,
          item,
          label: `Garantía: ${formatShortDate(item.warranty_until)}`,
          tone: "chip-green",
        });
      }

      return milestones;
    })
    .filter((milestone) => {
      const date = new Date(milestone.date);
      return date >= now && date <= soon;
    })
    .sort((first, second) => {
      return new Date(first.date).getTime() - new Date(second.date).getTime();
    })
    .slice(0, 3);

  return (
    <>
      {hasItems && (
        <section className="receipt-summary" aria-label="Resumen">
          <div className="receipt-summary__row">
            <span>Artículos guardados</span>
            <i aria-hidden="true" className="receipt-summary__leader" />
            <strong>{typedItems.length}</strong>
          </div>
          <div className="receipt-summary__row">
            <span>Garantías activas</span>
            <i aria-hidden="true" className="receipt-summary__leader" />
            <strong>{warrantyActiveCount}</strong>
          </div>
        </section>
      )}

      {hasItems && (
        <section className="category-row" aria-label="Categorías">
          <button
            className={`chip ${selectedCategory ? "chip-blue" : "chip-yellow"}`}
            onClick={() => selectCategory("")}
            type="button"
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              className={`chip ${
                selectedCategory === category.slug ? "chip-yellow" : "chip-blue"
              }`}
              key={category.id}
              onClick={() => selectCategory(category.slug)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </section>
      )}

      {hasItems && (
      <section className="dashboard-overview">
        <div className="card overview-panel">
          <div className="overview-panel__header">
            <div>
              <span className="chip chip-blue">Próximos hitos</span>
              <h2>
                {selectedCategoryName
                  ? `Lo más urgente en ${selectedCategoryName}`
                  : "Lo más urgente ahora"}
              </h2>
            </div>
          </div>

          {urgentMilestones.length ? (
            <div className="overview-list">
              {urgentMilestones.map((milestone) => (
                <Link
                  className={`overview-item ${
                    milestone.tone === "chip-yellow"
                      ? "overview-item--return"
                      : "overview-item--warranty"
                  }`}
                  href={`/items/${milestone.item.id}`}
                  key={`${milestone.item.id}-${milestone.label}`}
                >
                  <div className="overview-item__mark">
                    {milestone.item.photo_path ? (
                      <img alt="" src={milestone.item.photo_path} />
                    ) : (
                      <InfinityMark />
                    )}
                  </div>
                  <div className="overview-item__body">
                    <strong>{milestone.item.name}</strong>
                    <p className="muted">
                      {[milestone.item.brand, milestone.item.store].filter(Boolean).join(" · ") ||
                        "Compra guardada"}
                    </p>
                    <div className="item-card__dates">
                      <span className={`chip ${milestone.tone}`}>
                        {milestone.label}
                      </span>
                    </div>
                    <BrandLogo
                      brand={milestone.item.brand}
                      className="overview-item__brand-logo"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">
              {selectedCategoryName
                ? `No hay próximos vencimientos en ${selectedCategoryName}.`
                : "Cuando algo venza en menos de 30 días, aparecerá aquí con el único aviso que necesite atención."}
            </p>
          )}
        </div>
      </section>
      )}

      {typedItems.length ? (
        <section className="dashboard-collection" aria-label="Artículos">
          <div className="dashboard-collection__header">
            <div>
              <span className="chip chip-blue">
                {selectedCategoryName ? `Colección · ${selectedCategoryName}` : "Colección"}
              </span>
            </div>
          </div>
          <div className="items-grid">
            {typedItems.map((item) => (
              <Link href={`/items/${item.id}`} key={item.id}>
                <ItemCard item={item} />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="card empty-state">
          <InfinityMark />
          <h2>
            {search
              ? `Sin resultados para "${search}"`
              : selectedCategoryName
                ? `No hay artículos en ${selectedCategoryName}`
                : "Aún no hay artículos"}
          </h2>
          <p className="muted">
            {search
              ? "Prueba con el nombre del producto, la tienda o la marca."
              : "Guarda tu primera compra importante y empieza a controlar sus plazos."}
          </p>
          {!search && (
            <Link className="button button-primary" href="/items/new">
              Añadir artículo
            </Link>
          )}
        </section>
      )}
    </>
  );
}
