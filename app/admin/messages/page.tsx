import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { InfinityMark } from "@/components/infinity-mark";
import { requireAdmin } from "@/lib/admin";
import { demoMessages } from "@/lib/demo";
import { formatShortDate } from "@/lib/format-date";
import { getMessageStatusLabel } from "@/lib/message-status";

type AdminMessage = {
  id: string;
  subject: string;
  body?: string | null;
  status: string;
  admin_response?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  owner_email?: string | null;
};

type MessageRow = AdminMessage & {
  profiles: { email: string } | { email: string }[] | null;
};

export default async function AdminMessagesPage() {
  const admin = await requireAdmin();
  let messages: AdminMessage[] = demoMessages.map((message) => ({
    ...message,
    body: "Consulta demo de usuario.",
    created_at: new Date().toISOString(),
    owner_email: "demo@recorderys.app",
  }));
  let isDemo = true;

  if (admin) {
    const { data, error } = await admin.supabase
      .from("messages")
      .select(
        "id,subject,body,status,admin_response,created_at,updated_at,profiles!messages_user_id_fkey(email)",
      )
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    messages =
      (data as MessageRow[] | null)?.map((message) => {
        const profile = Array.isArray(message.profiles)
          ? message.profiles[0]
          : message.profiles;

        return {
          id: message.id,
          subject: message.subject,
          body: message.body,
          status: message.status,
          admin_response: message.admin_response,
          created_at: message.created_at,
          updated_at: message.updated_at,
          owner_email: profile?.email ?? "Usuario sin email",
        };
      }) ?? [];
    isDemo = false;
  }

  return (
    <AppShell isAdmin>

      <section className="card admin-panel admin-messages">
        <div className="admin-messages__header">
          <span className="chip chip-yellow">Buzón interno</span>
          <h1>Consultas de usuarios</h1>
          <p className="muted">
            Aquí RECORDERYS revisa mensajes, responde al usuario y deja el caso
            marcado como abierto, en revisión o respondido.
          </p>
          {isDemo ? (
            <p className="auth-message">
              Estás viendo datos demo. Con Supabase conectado, aquí aparecerán
              las consultas reales.
            </p>
          ) : null}
        </div>

        {messages.length ? (
          <div className="admin-message-list">
            {messages.map((message) => (
              <Link
                className="admin-message-card"
                href={`/admin/messages/${message.id}`}
                key={message.id}
              >
                <div>
                  <span
                    className={`chip ${
                      message.status === "closed"
                        ? "chip-green"
                        : message.status === "in_progress"
                          ? "chip-yellow"
                          : "chip-blue"
                    }`}
                  >
                    {getMessageStatusLabel(message.status)}
                  </span>
                  <h2>{message.subject}</h2>
                  <p className="muted">
                    {message.owner_email} ·{" "}
                    {message.updated_at
                      ? formatShortDate(message.updated_at)
                      : "Sin fecha"}
                  </p>
                </div>
                <p className="muted">
                  {message.admin_response
                    ? "Respuesta enviada."
                    : "Pendiente de respuesta."}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <InfinityMark />
            <h2>No hay consultas todavía</h2>
            <p className="muted">Cuando un usuario contacte, aparecerá aquí.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
