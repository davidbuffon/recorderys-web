import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { BrandLogo } from "@/components/brand-logo";
import { InfinityMark } from "@/components/infinity-mark";
import { ItemCard } from "@/components/item-card";
import { demoCategories, demoItems, hasSupabaseEnv } from "@/lib/demo";
import { formatShortDate } from "@/lib/format-date";
import { createClient } from "@/lib/supabase-server";
import type { Category, ItemCardData } from "@/lib/types";

type SearchParams = Promise<{
  q?: string;
  category?: string;
}>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const categorySlug = params.category ?? "";
  let categories: Category[] = [];
  let typedItems: ItemCardData[] = [];

  if (!hasSupabaseEnv()) {
    categories = demoCategories;
    typedItems = demoItems.filter((item) => {
      const matchesSearch = !search
        ? true
        : [item.name, item.brand, item.store, item.categories?.name]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(search.toLowerCase()),
            );
      const matchesCategory = !categorySlug
        ? true
        : item.categories?.slug === categorySlug;
      return matchesSearch && matchesCategory;
    });
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id,name,slug,color")
      .eq("is_active", true)
      .order("sort_order");
    categories = (categoriesData ?? []) as Category[];

    let query = supabase
      .from("items")
      .select(
        "id,name,brand,store,purchase_date,return_until,warranty_until,photo_path,categories(id,name,slug,color),receipts(duplicate_status,trust_score)",
      )
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,brand.ilike.%${search}%,store.ilike.%${search}%,model.ilike.%${search}%,serial_number.ilike.%${search}%,receipt_text.ilike.%${search}%`,
      );
    }

    if (categorySlug) {
      const selected = categories.find((category) => category.slug === categorySlug);
      if (selected) {
        query = query.eq("category_id", selected.id);
      }
    }

    const { data: itemsData } = await query;
    typedItems = (itemsData ?? []) as unknown as ItemCardData[];
  }
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
    <main className="shell dashboard">
      <nav className="dashboard__nav">
        <Brand />
        <div className="dashboard__nav-actions">
          <Link className="button button-secondary" href="/admin/receipts">
            Revisar tickets
          </Link>
          <Link className="button button-secondary" href="/profile">
            Perfil
          </Link>
          <Link className="button button-primary" href="/items/new">
            Añadir artículo
          </Link>
        </div>
      </nav>

      <section className="dashboard__hero card">
        <div>
          <span className="chip chip-yellow">Dashboard privado</span>
          <h1>Tus compras importantes</h1>
          <p className="muted">
            Busca, filtra y controla tus garantías desde un único lugar.
          </p>
          <div className="hero__actions">
            <Link className="button button-primary" href="/items/new">
              Añadir nueva compra
            </Link>
            <Link className="button button-secondary" href="/admin/receipts">
              Ver revisión antifraude
            </Link>
          </div>
        </div>
        <form className="search-form">
          <input
            aria-label="Buscar artículos"
            defaultValue={search}
            name="q"
            placeholder="Buscar por producto, tienda, marca o ticket..."
          />
          {categorySlug ? (
            <input name="category" type="hidden" value={categorySlug} />
          ) : null}
          <button className="button button-primary" type="submit">
            Buscar
          </button>
        </form>
      </section>

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
        <Link
          className={`chip ${categorySlug ? "chip-blue" : "chip-yellow"}`}
          href={search ? `/dashboard?q=${encodeURIComponent(search)}` : "/dashboard"}
        >
          Todos
        </Link>
        {categories.map((category) => (
          <Link
            className={`chip ${
              categorySlug === category.slug ? "chip-yellow" : "chip-blue"
            }`}
            href={`/dashboard?category=${category.slug}${
              search ? `&q=${encodeURIComponent(search)}` : ""
            }`}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </section>

      <section className="dashboard-overview">
        <div className="card overview-panel">
          <div className="overview-panel__header">
            <div>
              <span className="chip chip-blue">Próximos hitos</span>
              <h2>Lo más urgente ahora</h2>
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
              Cuando añadas artículos, verás aquí los próximos vencimientos y
              los productos que requieren atención.
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
              <h2>Tus artículos</h2>
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
          <h2>Aún no hay artículos</h2>
          <p className="muted">
            Guarda tu primera compra importante y empieza a controlar sus
            plazos.
          </p>
          <Link className="button button-primary" href="/items/new">
            Añadir artículo
          </Link>
        </section>
      )}
    </main>
  );
}
