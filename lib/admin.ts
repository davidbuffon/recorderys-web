import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";

/**
 * Comprueba si un usuario es admin sin redirigir. Útil en pantallas que
 * deben mostrarse igual a admins y no-admins, pero necesitan saber el rol
 * para decidir qué accesos de navegación mostrar.
 */
export async function getIsAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "admin";
}

export async function requireAdmin() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/messages");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user };
}
