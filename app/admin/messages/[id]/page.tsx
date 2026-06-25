import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { requireAdmin } from "@/lib/admin";
import { demoMessages } from "@/lib/demo";
import { formatShortDate } from "@/lib/format-date";

type Params = Promise<{ id: string }>;

type AdminMessage = {
  id: string;
  subject: string;
  body?: string | null;
  status: string;
  admin_response?: string | null;
  attachment_path?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  owner_email?: string | null;
};

type MessageRow = AdminMessage & {
  profiles: { email: string } | { email: string }[] | null;
};

async function replyToMessage(formData: FormData) {
  "use server";

  const admin = await requireAdmin();

  if (!admin) {
    redirect("/admin/messages");
  }

  const messageId = String(formData.get("message_id") || "");
  const adminResponse = String(formData.get("admin_response") || "").trim();
  const status = String(formData.get("status") || "closed");

  const { error } = await admin.supabase
    .from("messages")
    .update({
      admin_response: adminResponse || null,
      status,
    })
    .eq("id", messageId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/admin/messages/${messageId}`);
}

function getStatusLabel(status: string) {
  if (status === "closed") {
    return "Respondido";
  }

  if (status === "in_progress") {
    return "En revisión";
  }

  return "Abierto";
}

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  let attachmentHref: string | null = null;
  let message: AdminMessage | null = null;

  if (!admin) {
    const demo = demoMessages.find((entry) => entry.id === id);
    message = demo
      ? {
          ...demo,
          body: "Consulta demo de usuario.",
          created_at: new Date().toISOString(),
          owner_email: "demo@recorderys.app",
        }
      : null;
  } else {
    const { data } = await admin.supabase
      .from("messages")
      .select(
        "id,subject,body,status,admin_response,attachment_path,created_at,updated_at,profiles!messages_user_id_fkey(email)",
      )
      .eq("id", id)
      .single();

    if (data) {
      const row = data as MessageRow;
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

      message = {
        id: row.id,
        subject: row.subject,
        body: row.body,
        status: row.status,
        admin_response: row.admin_response,
        attachment_path: row.attachment_path,
        created_at: row.created_at,
        updated_at: row.updated_at,
        owner_email: profile?.email ?? "Usuario sin email",
      };

      if (row.attachment_path) {
        const { data: signedAttachment } = await admin.supabase.storage
          .from("message-attachments")
          .createSignedUrl(row.attachment_path, 60 * 10);
        attachmentHref = signedAttachment?.signedUrl ?? null;
      }
    }
  }

  if (!message) {
    notFound();
  }

  return (
    <main className="shell">
      <nav className="dashboard__nav">
        <Brand />
        <div className="dashboard__nav-actions">
          <Link className="button button-secondary" href="/admin/messages">
            Volver al buzón
          </Link>
          <Link className="button button-secondary" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="card message-detail admin-message-detail">
        <div className="message-detail__header">
          <span
            className={`chip ${
              message.status === "closed"
                ? "chip-green"
                : message.status === "in_progress"
                  ? "chip-yellow"
                  : "chip-blue"
            }`}
          >
            {getStatusLabel(message.status)}
          </span>
          <h1>{message.subject}</h1>
          <p className="muted">
            {message.owner_email} ·{" "}
            {message.created_at ? formatShortDate(message.created_at) : "Sin fecha"}
          </p>
        </div>

        <div className="admin-message-detail__grid">
          <div className="message-thread">
            <article className="message-bubble message-bubble--user">
              <span className="chip chip-yellow">Mensaje del usuario</span>
              <p>{message.body || "Sin descripción."}</p>
              {attachmentHref ? (
                <a
                  className="button button-secondary"
                  href={attachmentHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver adjunto
                </a>
              ) : null}
            </article>

            <article className="message-bubble message-bubble--admin">
              <span className="chip chip-blue">Respuesta actual</span>
              <p className="muted">
                {message.admin_response || "Pendiente de respuesta."}
              </p>
            </article>
          </div>

          <form action={replyToMessage} className="support-form admin-reply-form">
            <input name="message_id" type="hidden" value={message.id} />
            <label>
              <span>Estado</span>
              <select defaultValue={message.status} name="status">
                <option value="open">Abierto</option>
                <option value="in_progress">En revisión</option>
                <option value="closed">Respondido</option>
              </select>
            </label>
            <label>
              <span>Respuesta RECORDERYS</span>
              <textarea
                defaultValue={message.admin_response ?? ""}
                name="admin_response"
                placeholder="Escribe aquí la respuesta que verá el usuario."
                rows={8}
              />
            </label>
            <button className="button button-primary" type="submit">
              Guardar respuesta
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
