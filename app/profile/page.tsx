import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { getIsAdmin } from "@/lib/admin";
import { demoProfile, hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";

async function updateProfile(formData: FormData) {
  "use server";

  if (!hasSupabaseEnv()) {
    redirect("/profile");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      name: String(formData.get("name") || ""),
      email: user.email ?? "",
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      auth_provider: "email",
      last_login: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  redirect("/profile");
}

export default async function ProfilePage() {
  let profile: any = demoProfile;
  let email = demoProfile.email;
  let isAdmin = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = data ?? { email: user.email ?? "" };
    email = user.email ?? data?.email ?? "";
    isAdmin = await getIsAdmin(supabase, user.id);
  } else {
    isAdmin = true;
  }

  return (
    <main className="shell">
      <AppNav isAdmin={isAdmin} />
      <section className="card form-card profile-card" style={{ marginTop: 28 }}>
        <div className="profile-card__head">
          <span className="chip chip-yellow">Perfil</span>
          <div className="profile-card__identity">
            <h1>{profile?.name || "Tu perfil"}</h1>
            <p className="profile-card__email muted">{profile?.email || email}</p>
          </div>
        </div>
        <form action={updateProfile} className="item-form">
          <label>
            Nombre
            <input
              defaultValue={profile?.name ?? ""}
              name="name"
              placeholder="Tu nombre"
            />
          </label>
          <label>
            Teléfono
            <input
              defaultValue={profile?.phone ?? ""}
              name="phone"
              placeholder="+34..."
            />
          </label>
          <label>
            Dirección
            <span className="muted" style={{ fontSize: "0.8em", fontWeight: "normal" }}>
              Opcional — útil si en el futuro añadimos gestión de devoluciones a domicilio.
            </span>
            <textarea
              defaultValue={profile?.address ?? ""}
              name="address"
              placeholder="Tu dirección"
            />
          </label>
          <button className="button button-primary" type="submit">
            Guardar cambios
          </button>
        </form>
      </section>
    </main>
  );
}
