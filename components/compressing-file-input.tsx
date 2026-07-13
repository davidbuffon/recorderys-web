"use client";

import { compressInputFiles } from "@/lib/compress-image";

type CompressingFileInputProps = {
  accept?: string;
  multiple?: boolean;
  name: string;
};

/**
 * <input type="file"> que comprime las imágenes en el navegador al
 * seleccionarlas, reemplazando su FileList por las versiones ligeras.
 * Se puede usar dentro de un formulario con server action: el envío
 * nativo sube ya los ficheros comprimidos.
 */
export function CompressingFileInput({ accept, multiple, name }: CompressingFileInputProps) {
  return (
    <input
      accept={accept}
      multiple={multiple}
      name={name}
      onChange={(e) => {
        void compressInputFiles(e.target);
      }}
      type="file"
    />
  );
}
