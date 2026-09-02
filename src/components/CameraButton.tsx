"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { compressImageFile } from "@/lib/compressImage";
import { CameraIcon, ImageIcon } from "@/components/icons";

const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // reject absurdly large source files before even decoding

export interface CameraButtonHandle {
  open: () => void;
}

export const CameraButton = forwardRef<
  CameraButtonHandle,
  { onImageReady: (dataUrl: string) => void; onError: (message: string) => void; disabled?: boolean }
>(function CameraButton({ onImageReady, onError, disabled }, ref) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => cameraInputRef.current?.click(),
  }));

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Selecciona un archivo de imagen (JPEG, PNG o WEBP).");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      onError("La imagen es demasiado grande. Prueba con otra foto.");
      return;
    }

    try {
      const dataUrl = await compressImageFile(file);
      onImageReady(dataUrl);
    } catch {
      onError("No se ha podido procesar la imagen.");
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => cameraInputRef.current?.click()}
        className="pressable flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-primary/25 bg-gradient-to-b from-primary-soft to-primary-soft/40 py-9 transition-transform disabled:opacity-50"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <CameraIcon className="h-8 w-8" strokeWidth={1.8} />
        </span>
        <span className="text-[16px] font-semibold text-foreground">Analizar comida</span>
        <span className="text-[13px] text-muted">Toca para hacer una foto</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => galleryInputRef.current?.click()}
        className="pressable-subtle flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[14px] font-medium text-muted transition-colors disabled:opacity-50"
      >
        <ImageIcon className="h-4 w-4" />
        Elegir de la galería
      </button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );
});
