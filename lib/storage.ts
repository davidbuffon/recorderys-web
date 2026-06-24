import { randomUUID } from "node:crypto";

type UploadContext = {
  supabase: {
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string,
          body: ArrayBuffer | Uint8Array,
          options?: {
            cacheControl?: string;
            contentType?: string;
            upsert?: boolean;
          },
        ) => Promise<{ error: { message: string } | null }>;
      };
    };
  };
  userId: string;
  bucket: "item-photos" | "receipts" | "message-attachments";
  file: File | null;
  prefix: string;
};

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

export async function uploadUserFile({
  supabase,
  userId,
  bucket,
  file,
  prefix,
}: UploadContext) {
  if (!file || file.size === 0) {
    return null;
  }

  const extensionSafeName = sanitizeFilename(file.name || "archivo");
  const objectPath = `${userId}/${prefix}-${randomUUID()}-${extensionSafeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    console.error("Could not upload user file", {
      bucket,
      message: error.message,
    });

    return null;
  }

  return objectPath;
}
