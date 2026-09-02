import { notFound } from "next/navigation";
import { requireOwnerId } from "@/lib/access";
import { mealService, MealNotFoundError } from "@/services/meals/MealService";
import { MealDetailView } from "@/components/MealDetailView";
import type { MealAnalysis } from "@/types";

export const dynamic = "force-dynamic";

export default async function MealDetailPage({ params }: { params: { id: string } }) {
  const ownerId = await requireOwnerId();

  let meal;
  try {
    meal = await mealService.getMealForOwner(ownerId, params.id);
  } catch (error) {
    if (error instanceof MealNotFoundError) notFound();
    throw error;
  }

  const analysis: MealAnalysis = {
    totals: {
      calories: { min: meal.minCalories, max: meal.maxCalories },
      protein: { min: meal.minProtein, max: meal.maxProtein },
      carbs: { min: meal.minCarbs, max: meal.maxCarbs },
      fat: { min: meal.minFat, max: meal.maxFat },
    },
    items: meal.items.map((item) => ({
      name: item.name,
      grams: item.grams,
      gramsMin: item.gramsMin,
      gramsMax: item.gramsMax,
      confidence: item.confidence ?? 0.5,
      calories: { min: item.minCalories, max: item.maxCalories },
      protein: { min: item.minProtein, max: item.maxProtein },
      carbs: { min: item.minCarbs, max: item.maxCarbs },
      fat: { min: item.minFat, max: item.maxFat },
    })),
  };

  return (
    <MealDetailView
      mealId={meal.id}
      initialAnalysis={analysis}
      savedAtLabel={meal.createdAt.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
    />
  );
}
