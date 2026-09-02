import { Suspense } from "react";
import { requireOwnerId } from "@/lib/access";
import { mealService } from "@/services/meals/MealService";
import { AnalyzeFlow } from "@/components/AnalyzeFlow";
import { MealCard } from "@/components/MealCard";
import { NutritionSummary } from "@/components/NutritionSummary";
import { mealTitle } from "@/lib/mealTitle";
import { ProfileButton } from "@/components/ProfileButton";

// Always reflects live DB state (installation mode, session, meals) — must
// never be statically cached, especially since single-user mode never reads
// cookies() and so would otherwise give Next.js no dynamic signal at all.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ownerId = await requireOwnerId();
  const [summary, meals] = await Promise.all([
    mealService.getTodaySummary(ownerId),
    mealService.listMealsForOwner(ownerId),
  ]);
  const recentMeals = meals.slice(0, 5);

  return (
    <main className="safe-top px-5 pb-2">
      <header className="relative pb-1 pt-3 text-center">
        <ProfileButton />
        <h1 className="font-display text-[1.75rem] font-bold tracking-tight">openCal</h1>
        <p className="text-[14px] text-muted">¿Qué has comido?</p>
      </header>

      <div className="mt-2">
        <Suspense fallback={null}>
          <AnalyzeFlow />
        </Suspense>
      </div>

      <section className="mt-5 rounded-lg border border-border bg-surface p-4 animate-fade-in">
        <NutritionSummary ranges={summary} title="Hoy" />
      </section>

      <section className="mt-5 space-y-2.5">
        <h2 className="text-[13px] font-medium text-muted">Últimas comidas</h2>
        {recentMeals.length > 0 ? (
          <div className="stagger-in space-y-2.5">
            {recentMeals.map((meal) => (
              <MealCard
                key={meal.id}
                id={meal.id}
                title={mealTitle(meal.items)}
                minCalories={meal.minCalories}
                maxCalories={meal.maxCalories}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border py-5 text-center">
            <p className="text-[14px] text-muted">Aún no has guardado ninguna comida.</p>
            <p className="mt-1 text-[13px] text-muted-2">Haz una foto para empezar.</p>
          </div>
        )}
      </section>
    </main>
  );
}
