import { createHash } from "node:crypto";

type ReceiptSignalInput = {
  file: File;
  store?: string;
  purchaseDate?: string;
  itemName?: string;
  brand?: string;
};

export type ReceiptExtractionSignals = {
  extractedStore: string | null;
  extractedPurchaseDate: string | null;
  extractedTotalAmount: number | null;
  extractedTicketNumber: string | null;
  extractedPaymentTail: string | null;
  ocrStatus: "pending" | "processed" | "failed";
  extractionConfidence: number;
};

function normalizeText(value: string | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function buildReceiptSignals({
  file,
  store,
  purchaseDate,
  itemName,
  brand,
}: ReceiptSignalInput) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const fileSha256 = createHash("sha256").update(bytes).digest("hex");

  const fingerprintSource = [
    normalizeText(store),
    purchaseDate?.trim() ?? "",
    normalizeText(itemName),
    normalizeText(brand),
    file.type,
    String(file.size),
  ].join("|");

  const metadataFingerprint = createHash("sha256")
    .update(fingerprintSource)
    .digest("hex");

  return {
    fileSha256,
    metadataFingerprint,
    normalizedStore: normalizeText(store) || null,
    normalizedPurchaseDate: purchaseDate?.trim() || null,
    fileSize: file.size,
    mimeType: file.type || null,
    originalFilename: file.name || null,
  };
}

export function buildInitialExtractionSignals({
  store,
  purchaseDate,
}: {
  store?: string;
  purchaseDate?: string;
}): ReceiptExtractionSignals {
  const hasAnySignal = Boolean(normalizeText(store) || purchaseDate?.trim());

  return {
    extractedStore: normalizeText(store) || null,
    extractedPurchaseDate: purchaseDate?.trim() || null,
    extractedTotalAmount: null,
    extractedTicketNumber: null,
    extractedPaymentTail: null,
    ocrStatus: hasAnySignal ? "processed" : "pending",
    extractionConfidence: hasAnySignal ? 25 : 0,
  };
}
