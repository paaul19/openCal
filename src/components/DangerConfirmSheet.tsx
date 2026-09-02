"use client";

import { useState } from "react";
import { AlertIcon } from "@/components/icons";

export function DangerConfirmSheet({
  title,
  description,
  confirmWord,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmWord: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = input.trim().toUpperCase() === confirmWord;

  async function handleConfirm() {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-overlay/50 animate-scrim-in" onClick={onClose}>
      <div
        className="w-full rounded-t-lg border-t border-border bg-surface p-5 pb-8 animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border-strong" />
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertIcon className="h-5 w-5" />
        </div>
        <h2 className="mt-3 text-[17px] font-semibold">{title}</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{description}</p>
        <p className="mt-2 text-[13px] font-medium text-danger">Esta acción es permanente y no se puede deshacer.</p>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] text-muted">
            Escribe <span className="font-mono font-semibold text-foreground">{confirmWord}</span> para confirmar
          </span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3.5 py-3 text-[15px] uppercase outline-none focus:border-danger"
          />
        </label>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex gap-2.5">
          <button type="button" onClick={onClose} className="pressable flex-1 rounded-md border border-border py-3 text-[15px] font-medium">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!ready || loading}
            onClick={handleConfirm}
            className="pressable flex-1 rounded-md bg-danger py-3 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {loading ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
