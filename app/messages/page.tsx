import { redirect } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { getIsAdmin } from "@/lib/admin";
import { demoMessages, hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";
import { uploadUserFile } from "@/lib/storage";

async function createMessage(formData: FormData) {
  "use server";

  if (!hasSupabaseEnv()) {
    redirect("/messages");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const attachment = formData.get("attachment") as File | null;

  if (!subject || !body) {
    redirect("/messages");
  }

  const attachmentPath = await uploadUserFile({
    supabase,
    userId: user.id,
    bucket: "message-attachments",
    file: attachment,
    prefix: "message",
  });

  const { error } = await supabase.from("messages").insert({
    user_id: user.id,
    subject,
    body,
    attachment_path: attachmentPath,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/messages");
}

export default async function MessagesPage() {
  let messages = demoMessages;
  let isAdmin = false;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    isAdmin = await getIsAdmin(supabase, user.id);

    const { data: messagesData } = await supabase
      .from("messages")
      .select("id,subject,status,admin_response,updated_at")
      .order("updated_at", { ascending: false });
    messages = messagesData ?? [];
  } else {
    isAdmin = true;
  }

  return (
    <main className="shell">
      <AppNav isAdmin={isAdmin} />
      <section className="support-layout">
        <div className="card support-composer">
          <span className="chip chip-yellow">Ayuda</span>
          <h1>Contacta con RECORDERYS</h1>
          <p className="muted">
            Cuéntanos qué ocurre y añade una foto, ticket o documento si ayuda
            a revisar el caso.
          </p>

          <form action={createMessage} className="support-form">
            <label>
              <span>Asunto</span>
              <input
                name="subject"
                placeholder="Ej. Necesito revisar una garantía"
                required
              />
            </label>
            <label>
              <span>Descripción</span>
              <textarea
                name="body"
                placeholder="Describe el producto, la compra o el problema..."
                required
                rows={6}
              />
            </label>
            <label>
              <span>Archivo o foto</span>
              <input
                accept="image/*,application/pdf"
                name="attachment"
                type="file"
              />
            </label>
            <button className="button button-primary" type="submit">
              Enviar mensaje
            </button>
          </form>
        </div>

        <div className="card support-inbox">
          <div className="support-inbox__header">
            <span className="chip chip-blue">Buzón interno</span>
            <h2>Consultas enviadas</h2>
            <p className="muted">
              Las consultas quedan guardadas aquí. No se envían por email
              todavía.
            </p>
          </div>
          {messages.length ? (
            messages.map((message) => (
              <Link className="support-message" href={`/messages/${message.id}`} key={message.id}>
                <span className="chip chip-blue">{message.status}</span>
                <h3>{message.subject}</h3>
                <p className="muted">
                  {message.admin_response || "Pendiente de respuesta."}
                </p>
                <small>Ver detalle</small>
              </Link>
            ))
          ) : (
            <p className="muted">No tienes mensajes todavía.</p>
          )}
        </div>
      </section>
    </main>
  );
}
