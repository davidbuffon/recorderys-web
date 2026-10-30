// Rate limiting por IP respaldado por Supabase (función rl_hit). Fail-OPEN:
// si el limitador falla o no está configurado, NO bloquea.
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const configured = !!(SUPA_URL && SUPA_KEY);

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0].trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

// Devuelve true si se PERMITE la petición, false si supera el límite.
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  if (!configured) return true;
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/rpc/rl_hit`, {
      method: "POST",
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ p_key: key, p_max: max, p_window: windowSeconds }),
      cache: "no-store",
    });
    if (!res.ok) return true; // fail-open
    return (await res.json()) === true;
  } catch {
    return true; // fail-open
  }
}
