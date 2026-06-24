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
  initialCategorySlug?: string;
  items: ItemCardData[];
};

export function DashboardContent({
  categories,
  initialCategorySlug = "",
  items,
}: DashboardContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategorySlug);
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
  const warrantyActiveCount = typedItems.filter(
    (item) => new Date(item.warranty_until) >= now,
  ).length;
  const upcomingReturnCount = typedItems.filter((item) => {
    if (!item.return_until) return false;
    const date = new Date(item.return_until);
    return date >= now && date <= soon;
  }).length;
  const suspiciousTickets = typedItems.filter((item) => {
    const status = item.receipts?.[0]?.duplicate_status;
    return status === "possible_duplicate" || status === "under_review";
  });
  const upcomingItems = [...typedItems]
    .sort((first, second) => {
      const firstDate = first.return_until ?? first.warranty_until;
      const secondDate = second.return_until ?? second.warranty_until;
      return new Date(firstDate).getTime() - new Date(secondDate).getTime();
    })
    .slice(0, 3);

  return (
    <>
      <section className="stats-grid" aria-label="Resumen">
        <div className="card stat-card">
          <strong>{typedItems.length}</strong>
          <span>Artículos guardados</span>
          <small>Tu biblioteca privada de compras y tickets.</small>
        </div>
        <div className="card stat-card">
          <strong>{warrantyActiveCount}</strong>
          <span>Garantías activas</span>
          <small>Productos todavía cubiertos por garantía.</small>
        </div>
        <div className="card stat-card">
          <strong>{upcomingReturnCount}</strong>
          <span>Devoluciones próximas</span>
          <small>Compras que conviene revisar pronto.</small>
        </div>
      </section>

      <section className="category-row" aria-label="Categorías">
        <button
          className={`chip ${selectedCategory ? "chip-blue" : "chip-yellow"}`}
          onClick={() => setSelectedCategory("")}
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
            onClick={() => setSelectedCategory(category.slug)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </section>

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
            <Link className="button button-secondary" href="/items/new">
              Añadir artículo
            </Link>
          </div>

          {upcomingItems.length ? (
            <div className="overview-list">
              {upcomingItems.map((item) => (
                <Link className="overview-item" href={`/items/${item.id}`} key={item.id}>
                  <div className="overview-item__mark">
                    <InfinityMark />
                  </div>
                  <div className="overview-item__body">
                    <strong>{item.name}</strong>
                    <p className="muted">
                      {[item.brand, item.store].filter(Boolean).join(" · ") ||
                        "Compra guardada"}
                    </p>
                    <div className="item-card__dates">
                      <span className="chip chip-yellow">
                        Devolución: {formatShortDate(item.return_until)}
                      </span>
                      <span className="chip chip-green">
                        Garantía: {formatShortDate(item.warranty_until)}
                      </span>
                    </div>
                    <BrandLogo brand={item.brand} className="overview-item__brand-logo" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">
              {selectedCategoryName
                ? `No hay próximos vencimientos en ${selectedCategoryName}.`
                : "Cuando añadas artículos, verás aquí los próximos vencimientos y los productos que requieren atención."}
            </p>
          )}
        </div>

        <div className="card antifraud-panel">
          <span className="chip chip-red">Antifraude</span>
          <h2>Estado de tickets</h2>
          <p className="muted">
            RECORDERYS vigila duplicados entre cuentas y deja listos los casos
            para revisión manual.
          </p>

          <div className="antifraud-panel__score">
            <strong>{suspiciousTickets.length}</strong>
            <span>casos a revisar</span>
          </div>

          {suspiciousTickets.length ? (
            <div className="antifraud-panel__list">
              {suspiciousTickets.map((item) => (
                <Link href={`/items/${item.id}`} key={item.id}>
                  <div className="antifraud-mini">
                    <strong>{item.name}</strong>
                    <span
                      className={`chip ${
                        item.receipts?.[0]?.duplicate_status === "under_review"
                          ? "chip-yellow"
                          : "chip-red"
                      }`}
                    >
                      {item.receipts?.[0]?.duplicate_status === "under_review"
                        ? "En revisión"
                        : "Posible duplicado"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="antifraud-panel__ok">
              <span className="chip chip-green">Todo limpio</span>
              <p>No hay tickets sospechosos en este momento.</p>
            </div>
          )}

          <Link className="button button-secondary" href="/admin/receipts">
            Abrir panel de revisión
          </Link>
        </div>
      </section>

      {typedItems.length ? (
        <section className="dashboard-collection" aria-label="Artículos">
          <div className="dashboard-collection__header">
            <div>
              <span className="chip chip-blue">Mosaico</span>
              <h2>
                {selectedCategoryName
                  ? `Artículos de ${selectedCategoryName}`
                  : "Tus artículos"}
              </h2>
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
            {selectedCategoryName
              ? `No hay artículos en ${selectedCategoryName}`
              : "Aún no hay artículos"}
          </h2>
          <p className="muted">
            Guarda tu primera compra importante y empieza a controlar sus
            plazos.
          </p>
          <Link className="button button-primary" href="/items/new">
            Añadir artículo
          </Link>
        </section>
      )}
    </>
  );
}
