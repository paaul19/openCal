"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NutritionSummary } from "@/components/NutritionSummary";
import { FoodItem } from "@/components/FoodItem";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { recalculateMeal, updateMeal, ApiError, type MealItemInput } from "@/lib/apiClient";
import { ChevronLeftIcon, PencilIcon, XIcon } from "@/components/icons";
import type { AnalyzedFoodItem, MealAnalysis } from "@/types";

export function MealDetailView({
  mealId,
  initialAnalysis,
  savedAtLabel,
}: {
  mealId: string;
  initialAnalysis: MealAnalysis;
  savedAtLabel: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const recalcTimeout = useRef<ReturnType<typeof setTimeout>>();

  function toInput(item: AnalyzedFoodItem): MealItemInput {
    return { name: item.name, grams: item.grams, gramsMin: item.gramsMin, gramsMax: item.gramsMax, confidence: item.confidence };
  }

  function scheduleRecalculate(items: AnalyzedFoodItem[]) {
    setAnalysis((prev) => ({ ...prev, items }));
    if (recalcTimeout.current) clearTimeout(recalcTimeout.current);
    recalcTimeout.current = setTimeout(async () => {
      try {
        const { analysis: recalculated } = await recalculateMeal(items.map(toInput));
        setAnalysis(recalculated);
      } catch {
        // keep optimistic local values if a transient recalculation fails
      }
    }, 400);
  }

  function updateGrams(index: number, grams: number) {
    const items = analysis.items.map((item, i) =>
      i === index ? { ...item, grams: Math.max(0, grams), gramsMin: Math.max(0, grams), gramsMax: Math.max(0, grams) } : item,
    );
    scheduleRecalculate(items);
  }

  function removeItem(index: number) {
    scheduleRecalculate(analysis.items.filter((_, i) => i !== index));
  }

  function addFood(name: string, grams: number) {
    const items: AnalyzedFoodItem[] = [
      ...analysis.items,
      {
        name,
        grams,
        gramsMin: grams,
        gramsMax: grams,
        confidence: 1,
        calories: { min: 0, max: 0 },
        protein: { min: 0, max: 0 },
        carbs: { min: 0, max: 0 },
        fat: { min: 0, max: 0 },
      },
    ];
    scheduleRecalculate(items);
    setShowAddFood(false);
  }

  async function handleSave() {
    if (analysis.items.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await updateMeal(mealId, analysis.items.map(toInput));
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se han podido guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setAnalysis(initialAnalysis);
    setError(null);
    setEditing(false);
  }

  return (
    <main className="safe-top px-5 pb-2">
      <div className="relative flex items-center py-4">
        <Link
          href="/history"
          className="pressable-subtle absolute left-0 flex h-9 w-9 items-center justify-center text-muted"
          aria-label="Volver al historial"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="w-full text-center text-[1.1rem] font-semibold">Tu comida</h1>
        <button
          type="button"
          onClick={() => (editing ? handleCancel() : setEditing(true))}
          aria-label={editing ? "Cancelar edición" : "Editar comida"}
          className="pressable-subtle absolute right-0 flex h-9 w-9 items-center justify-center text-muted"
        >
          {editing ? <XIcon className="h-5 w-5" /> : <PencilIcon className="h-[18px] w-[18px]" />}
        </button>
      </div>

      <div className="animate-fade-in">
        <NutritionSummary ranges={analysis.totals} />
      </div>

      <section className="mt-6 space-y-2.5">
        <h2 className="text-[13px] font-medium text-muted">Alimentos</h2>
        <div className="stagger-in space-y-2.5">
          {analysis.items.map((item, index) => (
            <FoodItem
              key={`${item.name}-${index}`}
              item={item}
              editable={editing}
              onGramsChange={(grams) => updateGrams(index, grams)}
              onRemove={() => removeItem(index)}
            />
          ))}
        </div>

        {editing && (
          <button
            type="button"
            onClick={() => setShowAddFood(true)}
            className="pressable-subtle w-full rounded-md border border-dashed border-border-strong py-3 text-[14px] font-medium text-muted transition-colors"
          >
            + Añadir alimento
          </button>
        )}
      </section>

      {error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}

      {editing ? (
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="pressable flex-1 rounded-md border border-border py-3.5 text-[15px] font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving || analysis.items.length === 0}
            onClick={handleSave}
            className="pressable flex-[2] rounded-md bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-center text-[12px] text-muted-2">Guardado el {savedAtLabel}</p>
      )}

      {showAddFood && <AddFoodSheet onAdd={addFood} onClose={() => setShowAddFood(false)} />}
    </main>
  );
}
