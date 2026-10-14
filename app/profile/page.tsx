import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SettingsV2 } from "@/components/settings-v2";

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

  // Borra los ficheros del usuario en Storage antes de eliminar la cuenta:
  // deleteUser hace cascade en la base de datos, pero no toca los buckets, así
  // que sin esto quedarían fotos y tickets huérfanos pese a prometer un borrado
  // permanente e irreversible.
  const buckets = ["item-photos", "receipts", "message-attachments"] as const;
  for (const bucket of buckets) {
    const { data: files } = await adminClient.storage
      .from(bucket)
      .list(user.id, { limit: 1000 });

    if (files && files.length > 0) {
      await adminClient.storage
        .from(bucket)
        .remove(files.map((file) => `${user.id}/${file.name}`));
    }
  }

  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    throw new Error(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => cookieStore.delete(cookie.name));

  redirect("/");
}

async function updateNotificationPrefs(
  notifyReturn: boolean,
  notifyWarranty: boolean,
) {
  "use server";

  if (!hasSupabaseEnv()) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("profiles")
    .update({ notify_return: notifyReturn, notify_warranty: notifyWarranty })
    .eq("id", user.id);
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

  // El perfil ya existe (lo crea el trigger handle_new_user al registrarse), así
  // que usamos UPDATE en vez de UPSERT: profiles no tiene política de INSERT y un
  // upsert (INSERT ... ON CONFLICT) lo bloquearía la RLS. No tocamos email,
  // auth_provider ni last_login: los gestiona la capa de auth.
  const { error } = await supabase
    .from("profiles")
    .update({
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
    })
    .eq("id", user.id);

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
    <AppShell isAdmin={isAdmin}>
      <SettingsV2
        address={profile?.address ?? ""}
        changePasswordAction={changePassword}
        deleteAccountAction={deleteAccount}
        email={profile?.email || email}
        name={profile?.name ?? ""}
        notifyReturn={profile?.notify_return ?? true}
        notifyWarranty={profile?.notify_warranty ?? true}
        phone={profile?.phone ?? ""}
        pwError={pwError}
        pwOk={pwOk}
        updateNotificationPrefsAction={updateNotificationPrefs}
        updateProfileAction={updateProfile}
      />
    </AppShell>
  );
}
