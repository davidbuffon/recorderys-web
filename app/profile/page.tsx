import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";

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

      <section className="card form-card" style={{ marginTop: 16 }}>
        <div>
          <span className="chip chip-blue">Seguridad</span>
          <h2>Cambiar contraseña</h2>
          <p className="muted">Elige una contraseña nueva de al menos 8 caracteres.</p>
        </div>
        {pwOk && <p className="auth-message" style={{ color: "green" }}>Contraseña actualizada correctamente.</p>}
        {pwError && <p className="auth-message" style={{ color: "#c0392b" }}>Error al actualizar. Comprueba que ambas contraseñas coinciden y tienen al menos 8 caracteres.</p>}
        <form action={changePassword} className="item-form">
          <label>
            Nueva contraseña
            <input autoComplete="new-password" minLength={8} name="new_password" required type="password" />
          </label>
          <label>
            Confirmar contraseña
            <input autoComplete="new-password" minLength={8} name="confirm_password" required type="password" />
          </label>
          <button className="button button-secondary" type="submit">
            Actualizar contraseña
          </button>
        </form>
      </section>

      <section className="card form-card danger-zone" style={{ marginTop: 16 }}>
        <div>
          <span className="chip chip-red">Zona de peligro</span>
          <h2>Eliminar cuenta</h2>
          <p className="muted">
            Esta acción borra tu cuenta y todos tus datos de forma permanente e irreversible. No podrás recuperarlos.
          </p>
        </div>
        <details>
          <summary className="button button-secondary" style={{ display: "inline-block", cursor: "pointer" }}>
            Quiero eliminar mi cuenta
          </summary>
          <div style={{ marginTop: 16 }}>
            <p className="muted" style={{ marginBottom: 12 }}>
              ¿Seguro? Se eliminarán tu cuenta, artículos, tickets y todos tus datos almacenados.
            </p>
            <form action={deleteAccount}>
              <button className="button button-danger" type="submit">
                Sí, eliminar mi cuenta definitivamente
              </button>
            </form>
          </div>
        </details>
      </section>
    </main>
  );
}
