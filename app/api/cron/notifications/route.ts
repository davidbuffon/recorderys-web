import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  NOTIFICATION_RULES,
  type NotifiableItem,
  addDaysUTC,
  buildNotificationEmail,
} from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ItemRow = NotifiableItem & {
  user_id: string;
  profiles:
    | { email: string | null; notify_return: boolean; notify_warranty: boolean }
    | { email: string | null; notify_return: boolean; notify_warranty: boolean }[]
    | null;
};

export async function GET(req: NextRequest) {
  // Vercel Cron invoca la ruta con GET y añade `Authorization: Bearer
  // <CRON_SECRET>` cuando la variable CRON_SECRET está definida. Sin secreto
  // configurado, el endpoint no debe funcionar (evita envíos masivos desde
  // fuera).
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.NOTIFICATIONS_FROM || "Recorderys <avisos@send.recorderys.com>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recorderys.com";

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("Cron sin service role", error);
    return NextResponse.json({ error: "Service role no configurada" }, { status: 500 });
  }

  const today = new Date();
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const rule of NOTIFICATION_RULES) {
    const dateColumn = rule.kind === "return" ? "return_until" : "warranty_until";
    const targetDate = addDaysUTC(today, rule.daysBefore);

    const { data, error } = await supabase
      .from("items")
      .select(
        "id,name,store,return_until,warranty_until,user_id,profiles(email,notify_return,notify_warranty)",
      )
      .eq("status", "active")
      .eq(dateColumn, targetDate);

    if (error) {
      console.error("Cron: fallo al leer items", rule.milestone, error.message);
      continue;
    }

    for (const item of (data ?? []) as ItemRow[]) {
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;

      if (!profile?.email) {
        skipped++;
        continue;
      }

      const wants = rule.kind === "return" ? profile.notify_return : profile.notify_warranty;
      if (!wants) {
        skipped++;
        continue;
      }

      // Deduplicación: intenta registrar el envío primero. Si choca con la
      // restricción única (23505), ya se había enviado este hito.
      const { error: insertError } = await supabase.from("notifications").insert({
        user_id: item.user_id,
        item_id: item.id,
        kind: rule.kind,
        milestone: rule.milestone,
        channel: "email",
      });

      if (insertError) {
        skipped++;
        continue;
      }

      const email = buildNotificationEmail(rule, item, siteUrl);

      try {
        const { error: sendError } = await resend.emails.send({
          from,
          to: profile.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        if (sendError) {
          throw new Error(sendError.message);
        }

        sent++;
      } catch (sendError) {
        failed++;
        console.error("Cron: fallo al enviar", item.id, rule.milestone, sendError);
        // Revierte el registro para reintentar en la siguiente ejecución.
        await supabase
          .from("notifications")
          .delete()
          .eq("item_id", item.id)
          .eq("kind", rule.kind)
          .eq("milestone", rule.milestone)
          .eq("channel", "email");
      }
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, failed });
}
