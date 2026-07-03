import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ChangePasswordSection, DeleteAccountSection } from "@/components/profile-security";

export const metadata: Metadata = {
  title: "Perfil — Recorderys",
};
import { getIsAdmin } from "@/lib/admin";
import { demoProfile, hasSupabaseEnv } from "@/lib/demo";
import { createAdminClient, createClient } from "@/lib/supabase-server";

async function changePassword(formData: FormData) {
  "use server";

  if (!hasSupabaseEnv()) {
    redirect("/profile");
  }

  const newPassword = String(formData.get("new_password") || "").trim();
  const confirm = String(formData.get("confirm_password") || "").trim();

  if (!newPassword || newPassword.length < 8 || newPassword !== confirm) {
    redirect("/profile?pw_error=1");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect("/profile?pw_error=1");
  }

  redirect("/profile?pw_ok=1");
}

async function deleteAccount() {
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

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    throw new Error(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => cookieStore.delete(cookie.name));

  redirect("/");
}

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

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ pw_ok?: string; pw_error?: string }>;
}) {
  const params = await searchParams;
  const pwOk = params.pw_ok === "1";
  const pwError = params.pw_error === "1";
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
              autoComplete="name"
              defaultValue={profile?.name ?? ""}
              name="name"
              placeholder="Tu nombre"
            />
          </label>
          <label>
            Teléfono
            <input
              autoComplete="tel"
              defaultValue={profile?.phone ?? ""}
              inputMode="tel"
              name="phone"
              placeholder="+34 600 000 000"
              type="tel"
            />
          </label>
          <label>
            Dirección
            <span className="muted" style={{ fontSize: "0.8em", fontWeight: "normal" }}>
              Opcional
            </span>
            <textarea
              autoComplete="street-address"
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

      <div style={{ display: "grid", gap: 12, maxWidth: 720, width: "100%", marginTop: 16 }}>
        <ChangePasswordSection action={changePassword} pwOk={pwOk} pwError={pwError} />
        <form action="/auth/signout" method="post">
          <button className="button button-signout" style={{ width: "100%" }} type="submit">
            Cerrar sesión
          </button>
        </form>
        <DeleteAccountSection action={deleteAccount} />
      </div>
    </main>
  );
}
