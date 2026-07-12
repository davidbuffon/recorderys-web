import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getIsAdmin } from "@/lib/admin";
import { demoMessages, hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";

type Params = Promise<{ id: string }>;

export default async function MessageDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  let attachmentHref: string | null = null;
  let isAdmin = false;
  let message: {
    id: string;
    subject: string;
    body?: string | null;
    status: string;
    admin_response?: string | null;
    attachment_path?: string | null;
    updated_at?: string | null;
  } | null = null;

  if (!hasSupabaseEnv()) {
    isAdmin = true;
    message = demoMessages.find((entry) => entry.id === id) ?? null;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    isAdmin = await getIsAdmin(supabase, user.id);

    const { data } = await supabase
      .from("messages")
      .select("id,subject,body,status,admin_response,attachment_path,updated_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    message = data;

    if (data?.attachment_path) {
      const { data: signedAttachment } = await supabase.storage
        .from("message-attachments")
        .createSignedUrl(data.attachment_path, 60 * 10);
      attachmentHref = signedAttachment?.signedUrl ?? null;
    }
  }

  if (!message) {
    notFound();
  }

  return (
    <AppShell isAdmin={isAdmin}>
      <Link className="pd-back" href="/messages">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Volver a mensajes
      </Link>

      <section className="card message-detail">
        <div className="message-detail__header">
          <span className="chip chip-blue">{message.status}</span>
          <h1>{message.subject}</h1>
          <p className="muted">
            Consulta guardada en el buzón interno de RECORDERYS.
          </p>
        </div>

        <div className="message-thread">
          <article className="message-bubble message-bubble--user">
            <span className="chip chip-yellow">Tu mensaje</span>
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
            <span className="chip chip-blue">Respuesta RECORDERYS</span>
            <p className="muted">
              {message.admin_response || "Pendiente de respuesta."}
            </p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
