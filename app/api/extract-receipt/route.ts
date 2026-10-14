import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/demo";
import { createClient } from "@/lib/supabase-server";

export const maxDuration = 30;

const client = new Anthropic();

// Tamaño máximo del archivo aceptado (imagen o PDF).
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

// Rate limit best-effort en memoria, por usuario. En serverless cada instancia
// tiene su propio mapa, así que no es un límite estricto entre instancias; para
// eso habría que respaldarlo en Upstash/Supabase. Aun así frena el abuso básico
// de una misma sesión.
const RATE_LIMIT_MAX = 15; // lecturas
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // por hora y usuario
const rateBuckets = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(userId) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(userId, recent);
    return true;
  }

  recent.push(now);
  rateBuckets.set(userId, recent);
  return false;
}

export type ExtractionResult = {
  name: string | null;
  brand: string | null;
  store: string | null;
  purchase_date: string | null; // YYYY-MM-DD
  return_until: string | null;  // YYYY-MM-DD, calculated
  warranty_until: string | null; // YYYY-MM-DD, only if explicit on ticket
  category_name: string | null;
  confidence: number; // 0-100 overall
  field_confidence: {
    name: number;
    brand: number;
    store: number;
    purchase_date: number;
    return_until: number;
    category_name: number;
  };
};

const SYSTEM_PROMPT = `Eres un asistente especializado en extraer información de tickets y facturas de compra españoles.
Analiza la imagen del ticket y devuelve SOLO un objeto JSON con esta estructura exacta, sin texto adicional:

{
  "name": "nombre del producto principal (null si no está claro)",
  "brand": "marca del producto (null si no está)",
  "store": "nombre de la tienda o establecimiento (null si no está)",
  "purchase_date": "fecha de compra en formato YYYY-MM-DD (null si no está)",
  "return_until": "fecha fin de devolución en YYYY-MM-DD: purchase_date + días según tienda (14 por ley, 30 El Corte Inglés/FNAC, 15 MediaMarkt). null si no hay purchase_date",
  "warranty_until": "fecha fin de garantía en YYYY-MM-DD SOLO si aparece explícitamente en el ticket, si no null",
  "category_name": "una de estas categorías: Electrónica, Electrodomésticos, Ropa, Calzado, Hogar, Deportes, Alimentación, Salud, Juguetes, Libros, Otro (null si no está claro)",
  "confidence": número entre 0 y 100 indicando confianza global,
  "field_confidence": {
    "name": número 0-100,
    "brand": número 0-100,
    "store": número 0-100,
    "purchase_date": número 0-100,
    "return_until": número 0-100,
    "category_name": número 0-100
  }
}

Reglas:
- Si el ticket está en otro idioma, traduce los datos al español donde sea apropiado
- Para el nombre, extrae el producto principal si hay varios artículos (el más caro o prominente)
- Si hay varios productos, elige el más relevante
- Devuelve null para campos que no puedas extraer con suficiente confianza (< 60%)
- Devuelve SOLO el JSON, sin markdown, sin explicaciones`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  // En modo demo (sin Supabase) no hay sesión que validar ni coste que exponer.
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "La lectura de tickets no está disponible en modo demo" },
      { status: 503 },
    );
  }

  // Solo usuarios autenticados: este endpoint consume la cuota de Anthropic.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Has hecho demasiadas lecturas seguidas. Prueba de nuevo en un rato." },
      { status: 429 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "El archivo supera el límite de 8 MB" },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";

    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const contentBlock = isPdf
      ? {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: base64,
          },
        }
      : {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: base64,
          },
        };

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text: "Extrae los datos de este ticket de compra.",
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse response" }, { status: 500 });
    }

    const result: ExtractionResult = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Receipt extraction error:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
