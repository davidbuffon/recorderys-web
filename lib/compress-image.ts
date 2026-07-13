// Comprime imágenes en el navegador antes de subirlas al servidor.
// Las fotos de móvil (3-5 MB) se redimensionan y recodifican a JPEG,
// quedando en ~200-400 KB. Así el envío del formulario no supera el
// límite de 4,5 MB por petición de las funciones de Vercel.
//
// Los PDF y cualquier no-imagen se devuelven intactos.

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) return file;

    // Si la compresión no ayuda (imagen ya pequeña), conserva el original.
    if (blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

/**
 * Comprime todos los ficheros de un <input type="file"> y reemplaza su
 * FileList por las versiones comprimidas, de modo que el envío nativo del
 * formulario suba ya los ficheros ligeros.
 */
export async function compressInputFiles(input: HTMLInputElement): Promise<void> {
  const files = Array.from(input.files ?? []);
  if (files.length === 0) return;

  const compressed = await Promise.all(files.map((f) => compressImage(f)));
  const dataTransfer = new DataTransfer();
  compressed.forEach((f) => dataTransfer.items.add(f));
  input.files = dataTransfer.files;
}
