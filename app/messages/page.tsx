import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { demoMessages, hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";

export default async function MessagesPage() {
  let messages = demoMessages;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: messagesData } = await supabase
      .from("messages")
      .select("id,subject,status,admin_response,updated_at")
      .order("updated_at", { ascending: false });
    messages = messagesData ?? [];
  }

  return (
    <main className="shell">
      <nav className="dashboard__nav">
        <Brand />
        <a className="button button-secondary" href="/dashboard">
          Dashboard
        </a>
      </nav>
      <section className="card form-card" style={{ marginTop: 28, maxWidth: 760 }}>
        <span className="chip chip-yellow">Ayuda</span>
        <h1>Mensajes</h1>
        <p className="muted">
          Buzón preparado para soporte entre usuario y plataforma.
        </p>
        {messages.length ? (
          messages.map((message) => (
            <article className="date-block" key={message.id}>
              <span className="chip chip-blue">{message.status}</span>
              <h2>{message.subject}</h2>
              <p className="muted">
                {message.admin_response || "Pendiente de respuesta."}
              </p>
            </article>
          ))
        ) : (
          <p>No tienes mensajes todavía.</p>
        )}
      </section>
    </main>
  );
}
