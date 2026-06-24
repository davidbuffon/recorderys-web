import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { DashboardContent } from "@/components/dashboard-content";
import { demoCategories, demoItems, hasSupabaseEnv } from "@/lib/demo";
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
      return matchesSearch;
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

    const { data: itemsData } = await query;
    typedItems = (itemsData ?? []) as unknown as ItemCardData[];
  }
  const initialCategorySlug = categories.some(
    (category) => category.slug === categorySlug,
  )
    ? categorySlug
    : "";

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
        <div className="dashboard__hero-copy">
          <span className="chip chip-yellow">Dashboard privado</span>
          <h1>Tu biblioteca de compras importantes</h1>
          <p className="muted">
            Tickets, garantías y devoluciones a mano, sin perder tiempo buscando
            cuando lo necesitas.
          </p>
          <div className="dashboard-quick-actions">
            <Link className="button button-primary" href="/items/new">
              Añadir nueva compra
            </Link>
            <Link className="button button-secondary" href="/admin/receipts">
              Revisar tickets
            </Link>
          </div>
        </div>
        <div className="dashboard-command-card">
          <div>
            <span className="chip chip-blue">Acceso rápido</span>
            <h2>Encuentra cualquier compra en segundos.</h2>
          </div>
          <form className="search-form dashboard-search">
            <input
              aria-label="Buscar artículos"
              defaultValue={search}
              name="q"
              placeholder="Producto, tienda, marca o ticket..."
            />
            {initialCategorySlug ? (
              <input name="category" type="hidden" value={initialCategorySlug} />
            ) : null}
            <button className="button button-primary" type="submit">
              Buscar
            </button>
          </form>
          <div className="dashboard-command-card__hints" aria-label="Atajos sugeridos">
            <span>Garantías activas</span>
            <span>Devoluciones</span>
            <span>Tickets revisados</span>
          </div>
        </div>
      </section>

      <DashboardContent
        categories={categories}
        initialCategorySlug={initialCategorySlug}
        items={typedItems}
      />
    </main>
  );
}
