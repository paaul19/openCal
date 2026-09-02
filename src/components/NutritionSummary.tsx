import type { MacroRanges } from "@/types";
import { formatRange } from "@/types";

export function NutritionSummary({ ranges, title }: { ranges: MacroRanges; title?: string }) {
  const hasData = ranges.calories.max > 0;

  return (
    <div>
      {title && <p className="text-center text-[13px] font-medium text-muted">{title}</p>}
      <p className="mt-1 text-center font-display text-[2.75rem] font-bold leading-none tabular-nums">
        {hasData ? (
          <>
            <span className="align-top text-[1.5rem] font-semibold text-muted-2">≈ </span>
            {formatRange(ranges.calories)}
          </>
        ) : (
          "0"
        )}
        <span className="ml-1.5 text-lg font-medium text-muted">kcal</span>
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MacroPill label="Proteína" range={ranges.protein} colorVar="--protein" />
        <MacroPill label="Carbs" range={ranges.carbs} colorVar="--carbs" />
        <MacroPill label="Grasas" range={ranges.fat} colorVar="--fat" />
      </div>
    </div>
  );
}

function MacroPill({ label, range, colorVar }: { label: string; range: { min: number; max: number }; colorVar: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-3 text-center">
      <p className="text-[15px] font-semibold tabular-nums" style={{ color: `rgb(var(${colorVar}))` }}>
        {range.max > 0 ? formatRange(range) : "0"}
        <span className="text-xs font-medium text-muted"> g</span>
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  );
}
