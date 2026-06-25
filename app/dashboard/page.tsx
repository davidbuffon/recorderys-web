import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { DashboardContent } from "@/components/dashboard-content";
import { demoCategories, demoItems, hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";
import type { Category, ItemCardData } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mis artículos — Recorderys",
};

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
  let isAdmin = false;
  let totalItemCount = 0;

  if (!hasSupabaseEnv()) {
    categories = demoCategories;
    isAdmin = true;
    totalItemCount = demoItems.length;
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";

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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,brand.ilike.%${search}%,store.ilike.%${search}%,model.ilike.%${search}%,serial_number.ilike.%${search}%,receipt_text.ilike.%${search}%`,
      );
    }

    const [countResult, { data: itemsData }] = await Promise.all([
      supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      query,
    ]);
    totalItemCount = countResult.count ?? 0;
    typedItems = await Promise.all(
      ((itemsData ?? []) as unknown as ItemCardData[]).map(async (item) => {
        if (!item.photo_path) {
          return item;
        }

        const { data: signedPhoto } = await supabase.storage
          .from("item-photos")
          .createSignedUrl(item.photo_path, 60 * 10);

        return {
          ...item,
          photo_path: signedPhoto?.signedUrl ?? null,
        };
      }),
    );
  }
  const initialCategorySlug = categories.some(
    (category) => category.slug === categorySlug,
  )
    ? categorySlug
    : "";

  return (
    <main className="shell dashboard">
      <AppNav isAdmin={isAdmin} />

      <section className="dashboard__hero card">
        <div className="dashboard__hero-copy">
          <h1>Tus artículos</h1>
          <div className="dashboard-quick-actions">
            <Link className="button button-primary" href="/items/new">
              Añadir artículo
            </Link>
          </div>
        </div>
        <div className="dashboard-command-card">
          <div>
            <span className="chip chip-blue">Buscar</span>
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
        </div>
      </section>

      <DashboardContent
        categories={categories}
        hasItems={totalItemCount > 0}
        isAdmin={isAdmin}
        initialCategorySlug={initialCategorySlug}
        items={typedItems}
        search={search}
      />
    </main>
  );
}
