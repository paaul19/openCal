"use client";

import { useEffect, useState } from "react";
import { SearchIcon, ChevronLeftIcon, PlusIcon } from "@/components/icons";

interface FoodReferenceOption {
  id: string;
  name: string;
}

export function AddFoodSheet({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, grams: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodReferenceOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [grams, setGrams] = useState(100);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch(`/api/foods/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.foods ?? []))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 180);
  }

  function chooseFromList(name: string) {
    setSelected(name);
    setIsCustom(false);
  }

  function chooseCustom() {
    const name = query.trim();
    if (!name) return;
    setSelected(name);
    setIsCustom(true);
  }

  const trimmedQuery = query.trim();
  const exactMatchExists = results.some((food) => food.name.toLowerCase() === trimmedQuery.toLowerCase());

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end bg-overlay/50 ${closing ? "animate-[scrim-in_0.18s_ease-in_reverse]" : "animate-scrim-in"}`}
      onClick={handleClose}
    >
      <div
        className={`w-full rounded-t-lg border-t border-border bg-surface p-4 pb-8 ${closing ? "animate-[sheet-up_0.18s_cubic-bezier(0.32,0,0.67,0)_reverse]" : "animate-sheet-up"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border-strong" />
        <h2 className="mb-3 text-[17px] font-semibold">Añadir alimento</h2>

        {!selected ? (
          <>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar o escribir un alimento…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && trimmedQuery && !exactMatchExists) chooseCustom();
                }}
                className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-[15px] outline-none focus:border-primary"
              />
            </div>
            <ul className="mt-3 max-h-64 space-y-0.5 overflow-y-auto">
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    className="pressable-subtle w-full rounded-md px-3 py-2.5 text-left text-[15px] capitalize transition-colors hover:bg-border/50"
                    onClick={() => chooseFromList(food.name)}
                  >
                    {food.name}
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-3 py-4 text-center text-[13px] text-muted">
                  Ningún alimento de la base coincide.
                </li>
              )}
              {trimmedQuery && !exactMatchExists && (
                <li>
                  <button
                    type="button"
                    onClick={chooseCustom}
                    className="pressable-subtle flex w-full items-center gap-2 rounded-md border border-dashed border-border-strong px-3 py-2.5 text-left text-[15px] text-primary transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      Añadir <span className="font-medium">“{trimmedQuery}”</span> como alimento nuevo
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </>
        ) : (
          <div className="animate-fade-in">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="pressable-subtle -ml-1 mb-3 flex items-center gap-1 text-[13px] text-muted"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Volver
            </button>
            <p className="text-[16px] font-medium capitalize">{selected}</p>
            {isCustom && (
              <p className="mt-1 text-[12px] text-muted-2">
                No está en nuestra base de datos: sus valores nutricionales serán una estimación aproximada.
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[13px] text-muted">Cantidad:</span>
              <input
                type="number"
                autoFocus
                min={1}
                max={5000}
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="w-24 rounded-sm border border-border bg-background px-2 py-1.5 text-right font-mono text-[15px] tabular-nums outline-none focus:border-primary"
              />
              <span className="text-[13px] text-muted">g</span>
            </div>
            <button
              type="button"
              className="pressable mt-5 w-full rounded-md bg-primary py-3 text-[15px] font-semibold text-primary-foreground"
              onClick={() => {
                if (grams > 0) onAdd(selected, grams);
              }}
            >
              Añadir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
