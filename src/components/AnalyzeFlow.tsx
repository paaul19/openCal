"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraButton } from "@/components/CameraButton";
import { AnalysisLoading } from "@/components/AnalysisLoading";
import { FoodItem } from "@/components/FoodItem";
import { NutritionSummary } from "@/components/NutritionSummary";
import { AddFoodSheet } from "@/components/AddFoodSheet";
import { analyzeMealImage, recalculateMeal, saveMeal, ApiError, type MealItemInput } from "@/lib/apiClient";
import type { AnalyzedFoodItem, MealAnalysis } from "@/types";

type Stage = "idle" | "analyzing" | "reviewing" | "saving" | "error";

export function AnalyzeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("idle");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const recalcTimeout = useRef<ReturnType<typeof setTimeout>>();
  const cameraInputRef = useRef<{ open: () => void }>(null);

  useEffect(() => {
    if (searchParams.get("capture") === "1" && stage === "idle") {
      cameraInputRef.current?.open();
      router.replace("/", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleImageReady(dataUrl: string) {
    setStage("analyzing");
    setError(null);
    try {
      const { analysis } = await analyzeMealImage(dataUrl);
      setAnalysis(analysis);
      setStage("reviewing");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido analizar la imagen.");
      setStage("error");
    }
  }

  function toInput(item: AnalyzedFoodItem): MealItemInput {
    return { name: item.name, grams: item.grams, gramsMin: item.gramsMin, gramsMax: item.gramsMax, confidence: item.confidence };
  }

  function scheduleRecalculate(items: AnalyzedFoodItem[]) {
    setAnalysis((prev) => (prev ? { ...prev, items } : prev));
    if (recalcTimeout.current) clearTimeout(recalcTimeout.current);
    recalcTimeout.current = setTimeout(async () => {
      try {
        const { analysis: recalculated } = await recalculateMeal(items.map(toInput));
        setAnalysis(recalculated);
      } catch {
        // Keep the optimistic local values if recalculation fails momentarily.
      }
    }, 400);
  }

  function updateGrams(index: number, grams: number) {
    if (!analysis) return;
    // Editing grams resolves the *quantity* uncertainty for this item — the
    // range narrows to the confirmed value (composition uncertainty remains).
    const items = analysis.items.map((item, i) =>
      i === index ? { ...item, grams: Math.max(0, grams), gramsMin: Math.max(0, grams), gramsMax: Math.max(0, grams) } : item,
    );
    scheduleRecalculate(items);
  }

  function removeItem(index: number) {
    if (!analysis) return;
    const items = analysis.items.filter((_, i) => i !== index);
    scheduleRecalculate(items);
  }

  function addFood(name: string, grams: number) {
    if (!analysis) return;
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
    if (!analysis || analysis.items.length === 0) return;
    setStage("saving");
    try {
      const { meal } = await saveMeal(analysis.items.map(toInput));
      router.push(`/meal/${meal.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se ha podido guardar la comida.");
      setStage("reviewing");
    }
  }

  function reset() {
    setAnalysis(null);
    setError(null);
    setStage("idle");
  }

  useEffect(() => () => clearTimeout(recalcTimeout.current), []);

  if (stage === "analyzing") {
    return <AnalysisLoading />;
  }

  if (stage === "reviewing" || stage === "saving") {
    if (!analysis) return null;
    return (
      <div className="animate-fade-in space-y-6 py-2">
        <NutritionSummary ranges={analysis.totals} title="Tu comida" />

        <div className="stagger-in space-y-2.5">
          <h2 className="text-[13px] font-medium text-muted">Alimentos detectados</h2>
          {analysis.items.map((item, index) => (
            <FoodItem
              key={`${item.name}-${index}`}
              item={item}
              editable
              onGramsChange={(grams) => updateGrams(index, grams)}
              onRemove={() => removeItem(index)}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowAddFood(true)}
            className="pressable-subtle w-full rounded-md border border-dashed border-border-strong py-3 text-[14px] font-medium text-muted transition-colors"
          >
            + Añadir alimento
          </button>
        </div>

        {error && <p className="text-center text-sm text-danger">{error}</p>}

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={reset}
            className="pressable flex-1 rounded-md border border-border py-3.5 text-[15px] font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={stage === "saving" || analysis.items.length === 0}
            onClick={handleSave}
            className="pressable flex-[2] rounded-md bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {stage === "saving" ? "Guardando…" : "Guardar comida"}
          </button>
        </div>

        {showAddFood && <AddFoodSheet onAdd={addFood} onClose={() => setShowAddFood(false)} />}
      </div>
    );
  }

  return (
    <div className="space-y-3 py-1">
      <CameraButton ref={cameraInputRef} onImageReady={handleImageReady} onError={(message) => setError(message)} />
      {error && stage === "error" && <p className="text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
