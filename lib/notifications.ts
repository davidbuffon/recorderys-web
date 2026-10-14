import { formatShortDate } from "@/lib/format-date";

export type NotificationKind = "return" | "warranty";

export type NotificationRule = {
  kind: NotificationKind;
  milestone: string; // identificador único del hito (para no repetir envíos)
  daysBefore: number; // días antes del vencimiento en que se avisa
};

// Hitos de aviso. Cada combinación (item, kind, milestone) se envía una sola
// vez: el cron inserta una fila en `notifications` con restricción única.
export const NOTIFICATION_RULES: NotificationRule[] = [
  { kind: "return", milestone: "return_3d", daysBefore: 3 },
  { kind: "return", milestone: "return_1d", daysBefore: 1 },
  { kind: "warranty", milestone: "warranty_30d", daysBefore: 30 },
  { kind: "warranty", milestone: "warranty_7d", daysBefore: 7 },
];

export type NotifiableItem = {
  id: string;
  name: string;
  store: string | null;
  return_until: string | null;
  warranty_until: string | null;
};

/** Fecha (YYYY-MM-DD, en UTC) resultante de sumar `days` a `base`. */
export function addDaysUTC(base: Date, days: number): string {
  const d = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function emailShell(title: string, bodyHtml: string, ctaUrl: string, prefsUrl: string): string {
  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#eff8fc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0a1928;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="font-weight:800;font-size:20px;letter-spacing:-.02em;color:#0a7394;margin-bottom:24px;">RECORDERYS</div>
    <div style="background:#ffffff;border-radius:16px;padding:28px 24px;box-shadow:0 1px 3px rgba(10,25,40,.08);">
      <h1 style="margin:0 0 12px;font-size:19px;line-height:1.3;">${title}</h1>
      ${bodyHtml}
      <a href="${ctaUrl}" style="display:inline-block;margin-top:20px;background:#0a7394;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px;">Ver la compra</a>
    </div>
    <p style="margin:20px 4px 0;font-size:12px;color:#5b7083;line-height:1.5;">
      Recibes este aviso porque lo tienes activado en Recorderys.
      <a href="${prefsUrl}" style="color:#0a7394;">Cambiar mis avisos</a>.
    </p>
  </div>
</body></html>`;
}

/**
 * Construye el asunto y el cuerpo (HTML + texto) del aviso para una compra.
 * Función pura: no envía nada, solo compone el contenido.
 */
export function buildNotificationEmail(
  rule: NotificationRule,
  item: NotifiableItem,
  siteUrl: string,
): { subject: string; html: string; text: string } {
  const base = siteUrl.replace(/\/$/, "");
  const itemUrl = `${base}/items/${item.id}`;
  const prefsUrl = `${base}/profile`;
  const deadline = rule.kind === "return" ? item.return_until : item.warranty_until;
  const deadlineLabel = deadline ? formatShortDate(deadline) : "";
  const storeLine = item.store ? `${item.name} · ${item.store}` : item.name;
  const days = rule.daysBefore;
  const dayWord = days === 1 ? "día" : "días";

  if (rule.kind === "return") {
    const subject =
      days === 1
        ? `Mañana vence el plazo para devolver ${item.name}`
        : `Te quedan ${days} ${dayWord} para devolver ${item.name}`;
    const lead =
      days === 1
        ? `Mañana se acaba el plazo de devolución de <strong>${item.name}</strong>.`
        : `El plazo de devolución de <strong>${item.name}</strong> termina en ${days} ${dayWord}.`;
    const bodyHtml = `
      <p style="margin:0 0 8px;font-size:15px;line-height:1.5;">${lead}</p>
      <p style="margin:0;font-size:14px;color:#5b7083;">${storeLine}${deadlineLabel ? ` — hasta el ${deadlineLabel}` : ""}</p>`;
    const text = `${lead.replace(/<[^>]+>/g, "")}\n${storeLine}${deadlineLabel ? ` — hasta el ${deadlineLabel}` : ""}\n\n${itemUrl}`;
    return { subject, html: emailShell(subject, bodyHtml, itemUrl, prefsUrl), text };
  }

  const subject = `La garantía de ${item.name} vence en ${days} ${dayWord}`;
  const lead = `La garantía de <strong>${item.name}</strong> termina en ${days} ${dayWord}. Si algo no va bien, este es el momento de reclamar.`;
  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;">${lead}</p>
    <p style="margin:0;font-size:14px;color:#5b7083;">${storeLine}${deadlineLabel ? ` — hasta el ${deadlineLabel}` : ""}</p>`;
  const text = `${lead.replace(/<[^>]+>/g, "")}\n${storeLine}${deadlineLabel ? ` — hasta el ${deadlineLabel}` : ""}\n\n${itemUrl}`;
  return { subject, html: emailShell(subject, bodyHtml, itemUrl, prefsUrl), text };
}
