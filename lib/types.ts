export type Category = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

export type ItemCardData = {
  id: string;
  name: string;
  brand: string | null;
  store: string | null;
  purchase_date: string;
  return_until: string | null;
  warranty_until: string;
  photo_path: string | null;
  cover_image_path?: string | null;
  user_photos?: string[] | null;
  receipt_path?: string | null;
  categories: Category | null;
  receipts?: {
    duplicate_status: "clear" | "possible_duplicate" | "confirmed_duplicate" | "under_review";
    trust_score: number;
    ocr_status?: "pending" | "processed" | "failed";
    extraction_confidence?: number;
    extracted_store?: string | null;
    extracted_purchase_date?: string | null;
    extracted_total_amount?: number | null;
    extracted_ticket_number?: string | null;
  }[] | null;
};
