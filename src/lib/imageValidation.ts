import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validation";

export class ImageValidationError extends Error {}

const MAGIC_BYTES: Array<{ mimeType: string; bytes: number[] }> = [
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mimeType: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

/**
 * Parses a `data:<mime>;base64,<data>` string, checks its declared type against
 * an allowlist, its size against a ceiling, and sniffs the first bytes so a
 * renamed/mislabeled file can't slip through as an "image".
 */
export function parseAndValidateDataUrl(dataUrl: string): { base64: string; mimeType: string; buffer: Buffer } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new ImageValidationError("Formato de imagen no válido.");
  }
  const [, mimeType, base64] = match;

  if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new ImageValidationError("Formato de imagen no soportado. Usa JPEG, PNG o WEBP.");
  }
  if (!base64) {
    throw new ImageValidationError("Formato de imagen no válido.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) {
    throw new ImageValidationError("Formato de imagen no válido.");
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new ImageValidationError("La imagen es demasiado grande. Máximo 6MB.");
  }

  const signature = MAGIC_BYTES.find((entry) => entry.mimeType === mimeType);
  if (signature && !signature.bytes.every((byte, index) => buffer[index] === byte)) {
    throw new ImageValidationError("El archivo no parece ser una imagen válida.");
  }

  return { base64, mimeType, buffer };
}
