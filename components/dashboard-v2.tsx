"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getItemBadges, getItemStatus, statusBadgeClass, statusLabel } from "@/lib/item-status";
import type { Category, ItemCardData } from "@/lib/types";

type DashboardV2Props = {
  avatarInitial?: string;
  categories?: Category[];
  initialCategorySlug?: string;
  items: ItemCardData[];
  search?: string;
  totalCount: number;
};

function ItemImage({ item }: { item: ItemCardData }) {
  if (item.photo_path) {
    return <img alt="" src={item.photo_path} />;
  }
  return (
    <span className="item-card-v2__placeholder" aria-hidden="true">
      {item.name?.toLowerCase().replace(/\s+/g, "-").slice(0, 24) || "sin-foto"}
    </span>
  );
}

export function DashboardV2({
  avatarInitial = "R",
  categories = [],
  initialCategorySlug = "",
  items,
  search = "",
  totalCount,
}: DashboardV2Props) {
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

  const filteredItems = useMemo(
    () =>
      selectedCategory
        ? items.filter((item) => item.categories?.slug === selectedCategory)
        : items,
    [items, selectedCategory],
  );

  const withStatus = filteredItems.map((item) => ({ item, status: getItemStatus(item) }));
  const urgent = withStatus.filter(
    ({ status }) => status.kind === "return" && status.urgent,
  );
  const selectedCategoryName =
    categories.find((c) => c.slug === selectedCategory)?.name ?? "";

  return (
    <>
      <header className="dz-header">
        <div className="dz-header__title">
          <h1>Tus compras</h1>
          <p className="dz-header__count">
            {totalCount} compra{totalCount === 1 ? "" : "s"} guardada{totalCount === 1 ? "" : "s"}
          </p>
        </div>
        <Link aria-label="Ir a ajustes" className="dz-avatar" href="/profile">
          {avatarInitial}
        </Link>
        <div className="dz-header__actions">
          <form className="dz-search" role="search">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            <input
              aria-label="Buscar una compra"
              defaultValue={search}
              name="q"
              placeholder="Buscar una compra"
              type="search"
            />
          </form>
          <Link className="dz-add-button" href="/items/new">
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Añadir compra
          </Link>
        </div>
      </header>

      {categories.length > 0 && (
        <div className="dz-families" role="group" aria-label="Filtrar por familia">
          <button
            className={`wizard-chip ${!selectedCategory ? "wizard-chip--active" : ""}`}
            onClick={() => selectCategory("")}
            type="button"
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              className={`wizard-chip ${
                selectedCategory === category.slug ? "wizard-chip--active" : ""
              }`}
              key={category.id}
              onClick={() => selectCategory(category.slug)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {urgent.length > 0 && (
        <section className="attention-banner" aria-label="Compras que necesitan atención">
          <p className="attention-banner__title">
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {urgent.length} compra{urgent.length === 1 ? "" : "s"} necesita{urgent.length === 1 ? "" : "n"} tu atención
          </p>
          <div className="attention-banner__list">
            {urgent.map(({ item, status }) => (
              <Link className="attention-banner__card" href={`/items/${item.id}`} key={item.id}>
                <span className="attention-banner__thumb">
                  <ItemImage item={item} />
                </span>
                <span className="attention-banner__copy">
                  <strong>{item.name}</strong>
                  <small>{statusLabel(status)}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {withStatus.length > 0 ? (
        <div className="dz-list card-v2">
          {withStatus.map(({ item, status }) => (
            <Link className="dz-item" href={`/items/${item.id}`} key={item.id}>
              <span className="dz-item__thumb">
                <ItemImage item={item} />
              </span>
              <span className="dz-item__copy">
                <span className="dz-item__head">
                  <strong>{item.name}</strong>
                  <span className={`${statusBadgeClass(status)} dz-item__badge`}>
                    {statusLabel(status)}
                  </span>
                </span>
                <small>
                  {[item.store, item.brand].filter(Boolean).join(" · ") || "Compra guardada"}
                </small>
              </span>
              <span className="dz-item__badges">
                {getItemBadges(item).map((badge) => (
                  <span
                    className={`status-badge status-badge--${badge.kind}`}
                    key={badge.label}
                  >
                    {badge.label}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <section className="card-v2 dz-empty">
          <h2>
            {search
              ? `Sin resultados para "${search}"`
              : selectedCategoryName
                ? `No hay compras en ${selectedCategoryName}`
                : "Aún no hay compras"}
          </h2>
          <p>
            {search
              ? "Prueba con el nombre del producto, la tienda o la marca."
              : selectedCategoryName
                ? "Prueba con otra familia o añade una compra nueva."
                : "Guarda tu primera compra importante y empieza a controlar sus plazos."}
          </p>
          {!search && !selectedCategoryName && (
            <Link className="dz-add-button" href="/items/new">
              Añadir compra
            </Link>
          )}
        </section>
      )}
    </>
  );
}
