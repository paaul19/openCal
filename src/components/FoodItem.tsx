"use client";

import { confidenceLevel, formatRange } from "@/types";
import type { AnalyzedFoodItem } from "@/types";
import { TrashIcon } from "@/components/icons";

const CONFIDENCE_LABEL: Record<ReturnType<typeof confidenceLevel>, string> = {
  alta: "Confianza alta",
  media: "Confianza media",
  baja: "Confianza baja",
};

export function FoodItem({
  item,
  editable = false,
  onGramsChange,
  onRemove,
}: {
  item: AnalyzedFoodItem;
  editable?: boolean;
  onGramsChange?: (grams: number) => void;
  onRemove?: () => void;
}) {
  const level = confidenceLevel(item.confidence);

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium capitalize">{item.name}</p>
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
              level === "baja"
                ? "bg-danger-soft text-danger"
                : level === "media"
                  ? "bg-carbs/15 text-carbs"
                  : "bg-primary-soft text-primary"
            }`}
          >
            {CONFIDENCE_LABEL[level]}
          </span>
        </div>
        {editable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Eliminar ${item.name}`}
            className="pressable-subtle shrink-0 rounded-full p-1.5 text-muted-2 transition-colors hover:text-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {editable ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={5000}
              value={Math.round(item.grams)}
              onChange={(e) => onGramsChange?.(Number(e.target.value))}
              className="w-16 rounded-sm border border-border bg-background px-2 py-1 text-right font-mono text-sm tabular-nums outline-none focus:border-primary"
            />
            <span className="text-sm text-muted">g</span>
          </div>
        ) : (
          <span className="text-sm text-muted">
            {item.gramsMin === item.gramsMax
              ? `${Math.round(item.grams)} g`
              : `≈ ${formatRange({ min: item.gramsMin, max: item.gramsMax })} g`}
          </span>
        )}
        <span className="ml-auto font-mono text-[15px] font-semibold tabular-nums">
          ≈ {formatRange(item.calories)} kcal
        </span>
      </div>

      <div className="mt-3 flex gap-4 text-[12px] text-muted">
        <span>P {formatRange(item.protein)} g</span>
        <span>C {formatRange(item.carbs)} g</span>
        <span>G {formatRange(item.fat)} g</span>
      </div>
    </div>
  );
}
