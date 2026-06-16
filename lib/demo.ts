import type { Category, ItemCardData } from "@/lib/types";

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const demoCategories: Category[] = [
  { id: "cat-1", name: "Electrodomésticos", slug: "electrodomesticos", color: "#FFD31A" },
  { id: "cat-2", name: "Calzado", slug: "calzado", color: "#F4B942" },
  { id: "cat-3", name: "Electrónica", slug: "electronica", color: "#27A9CF" },
  { id: "cat-4", name: "Hogar", slug: "hogar", color: "#8AD6E8" },
];

export const demoItems: ItemCardData[] = [
  {
    id: "demo-1",
    name: "Cafetera DeLonghi",
    brand: "DeLonghi",
    store: "El Corte Inglés",
    purchase_date: "2026-04-10",
    return_until: "2026-04-24",
    warranty_until: "2029-04-10",
    photo_path: "/demo/product-cafetera.svg",
    cover_image_path: "/demo/product-cafetera.svg",
    user_photos: [
      "/demo/user/cafetera-1.svg",
      "/demo/user/cafetera-2.svg",
    ],
    receipt_path: "/demo/ticket-cafetera.svg",
    categories: demoCategories[0],
    receipts: [
      {
        duplicate_status: "clear",
        trust_score: 100,
        ocr_status: "processed",
        extraction_confidence: 62,
        extracted_store: "el corte ingles",
        extracted_purchase_date: "2026-04-10",
        extracted_total_amount: 229.99,
        extracted_ticket_number: "A-10492",
      },
    ],
  },
  {
    id: "demo-2",
    name: "Zapatillas Nordikas",
    brand: "Nordikas",
    store: "Nordikas",
    purchase_date: "2026-04-15",
    return_until: "2026-04-29",
    warranty_until: "2029-04-15",
    photo_path: "/demo/product-zapatillas.svg",
    cover_image_path: "/demo/product-zapatillas.svg",
    user_photos: [
      "/demo/user/zapatillas-1.svg",
      "/demo/user/zapatillas-2.svg",
    ],
    receipt_path: "/demo/ticket-zapatillas.svg",
    categories: demoCategories[1],
    receipts: [
      {
        duplicate_status: "clear",
        trust_score: 100,
        ocr_status: "processed",
        extraction_confidence: 54,
        extracted_store: "nordikas",
        extracted_purchase_date: "2026-04-15",
        extracted_total_amount: 89.95,
        extracted_ticket_number: "NOR-54498",
      },
    ],
  },
  {
    id: "demo-3",
    name: "Auriculares Sony",
    brand: "Sony",
    store: "Amazon",
    purchase_date: "2026-03-28",
    return_until: "2026-04-11",
    warranty_until: "2029-03-28",
    photo_path: "/demo/product-auriculares.svg",
    cover_image_path: "/demo/product-auriculares.svg",
    user_photos: [
      "/demo/user/auriculares-1.svg",
      "/demo/user/auriculares-2.svg",
    ],
    receipt_path: "/demo/ticket-auriculares.svg",
    categories: demoCategories[2],
    receipts: [
      {
        duplicate_status: "possible_duplicate",
        trust_score: 45,
        ocr_status: "processed",
        extraction_confidence: 46,
        extracted_store: "amazon",
        extracted_purchase_date: "2026-03-28",
        extracted_total_amount: 149.9,
        extracted_ticket_number: null,
      },
    ],
  },
  {
    id: "demo-4",
    name: "Aspiradora Dyson",
    brand: "Dyson",
    store: "MediaMarkt",
    purchase_date: "2026-03-01",
    return_until: null,
    warranty_until: "2029-03-01",
    photo_path: "/demo/product-aspiradora.svg",
    cover_image_path: "/demo/product-aspiradora.svg",
    user_photos: [
      "/demo/user/aspiradora-1.svg",
      "/demo/user/aspiradora-2.svg",
    ],
    receipt_path: "/demo/ticket-aspiradora.svg",
    categories: demoCategories[3],
    receipts: [
      {
        duplicate_status: "under_review",
        trust_score: 65,
        ocr_status: "pending",
        extraction_confidence: 0,
        extracted_store: null,
        extracted_purchase_date: null,
        extracted_total_amount: null,
        extracted_ticket_number: null,
      },
    ],
  },
];

export const demoProfile = {
  name: "Demo User",
  email: "demo@recorderys.app",
  phone: "+34 600 123 123",
  address: "Barcelona",
};

export const demoMessages = [
  {
    id: "msg-1",
    subject: "Duda sobre garantía",
    status: "open",
    admin_response: "Tu artículo sigue dentro del plazo de garantía estimada.",
  },
  {
    id: "msg-2",
    subject: "Ticket poco legible",
    status: "in_progress",
    admin_response: "Estamos revisando cómo mejorar la lectura automática del ticket.",
  },
];

export const demoReceipts = [
  {
    id: "receipt-1",
    item_id: "demo-3",
    item_name: "Auriculares Sony",
    owner_email: "eva@recorderys.app",
    duplicate_status: "possible_duplicate",
    trust_score: 45,
    normalized_store: "amazon",
    normalized_purchase_date: "2026-03-28",
    review_notes:
      "La huella del archivo y la huella de metadatos coinciden con un ticket ya registrado en otra cuenta.",
    created_at: "2026-05-17T10:00:00.000Z",
  },
  {
    id: "receipt-2",
    item_id: "demo-4",
    item_name: "Aspiradora Dyson",
    owner_email: "laura@recorderys.app",
    duplicate_status: "under_review",
    trust_score: 65,
    normalized_store: "mediamarkt",
    normalized_purchase_date: "2026-03-01",
    review_notes:
      "Revisión manual pendiente por coincidencia parcial en metadatos del ticket.",
    created_at: "2026-05-17T10:30:00.000Z",
  },
];
