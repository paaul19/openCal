import Link from "next/link";
import { formatRange } from "@/types";
import { UtensilsIcon } from "@/components/icons";

export function MealCard({
  id,
  title,
  minCalories,
  maxCalories,
  time,
}: {
  id: string;
  title: string;
  minCalories: number;
  maxCalories: number;
  time?: string;
}) {
  return (
    <Link
      href={`/meal/${id}`}
      className="pressable-subtle flex items-center gap-3 rounded-md border border-border bg-surface px-3.5 py-3 transition-colors"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <UtensilsIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{title}</p>
        <p className="text-[13px] tabular-nums text-muted">
          ≈ {formatRange({ min: minCalories, max: maxCalories })} kcal
        </p>
      </div>
      {time && <span className="shrink-0 text-[12px] text-muted-2">{time}</span>}
    </Link>
  );
}
