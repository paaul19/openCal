import { requireOwnerId } from "@/lib/access";
import { mealService } from "@/services/meals/MealService";
import { MealCard } from "@/components/MealCard";
import { mealTitle } from "@/lib/mealTitle";
import { ProfileButton } from "@/components/ProfileButton";
import { ClockIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

function groupByDay(meals: Awaited<ReturnType<typeof mealService.listMealsForOwner>>) {
  const groups = new Map<string, typeof meals>();
  for (const meal of meals) {
    const label = dayLabel(meal.createdAt);
    const existing = groups.get(label) ?? [];
    existing.push(meal);
    groups.set(label, existing);
  }
  return groups;
}

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Hoy";
  if (isSameDay(date, yesterday)) return "Ayer";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function timeLabel(date: Date): string {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export default async function HistoryPage() {
  const ownerId = await requireOwnerId();
  const meals = await mealService.listMealsForOwner(ownerId);
  const groups = groupByDay(meals);

  return (
    <main className="safe-top px-5 pb-2">
      <div className="relative py-4">
        <h1 className="text-[1.5rem] font-bold">Historial</h1>
        <ProfileButton />
      </div>

      {meals.length === 0 && (
        <div className="mt-16 text-center">
          <ClockIcon className="mx-auto h-10 w-10 text-muted-2" strokeWidth={1.4} />
          <p className="mt-3 text-[15px] font-medium">Sin comidas todavía</p>
          <p className="mt-1 text-[13px] text-muted">Las comidas que guardes aparecerán aquí.</p>
        </div>
      )}

      <div className="space-y-6">
        {Array.from(groups.entries()).map(([label, group]) => (
          <section key={label} className="space-y-2.5 animate-fade-in">
            <h2 className="text-[13px] font-semibold text-muted">{label}</h2>
            <div className="space-y-2.5">
              {group.map((meal) => (
                <MealCard
                  key={meal.id}
                  id={meal.id}
                  title={mealTitle(meal.items)}
                  minCalories={meal.minCalories}
                  maxCalories={meal.maxCalories}
                  time={timeLabel(meal.createdAt)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
