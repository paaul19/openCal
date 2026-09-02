import { prisma } from "@/lib/prisma";
import { nutritionService } from "@/services/nutrition/NutritionService";
import type { AnalyzedFoodItem, MealAnalysis, MacroRanges, Range } from "@/types";

export class MealNotFoundError extends Error {}

interface RawFoodItem {
  name: string;
  grams: number;
  gramsMin?: number;
  gramsMax?: number;
  confidence?: number | null;
}

export class MealService {
  /** Turns raw food entries into full items with calculated calorie/macro ranges + totals. */
  async buildAnalysis(items: RawFoodItem[]): Promise<MealAnalysis> {
    const resolved: AnalyzedFoodItem[] = await Promise.all(
      items.map(async (item) => {
        const gramsMin = item.gramsMin ?? item.grams;
        const gramsMax = item.gramsMax ?? item.grams;
        const confidence = item.confidence ?? 0.5;
        const { ranges } = await nutritionService.calculateRange(item.name, gramsMin, gramsMax, confidence);
        return {
          name: item.name,
          grams: item.grams,
          gramsMin,
          gramsMax,
          confidence,
          ...ranges,
        };
      }),
    );

    const totals: MacroRanges = {
      calories: sumRange(resolved.map((item) => item.calories)),
      protein: sumRange(resolved.map((item) => item.protein)),
      carbs: sumRange(resolved.map((item) => item.carbs)),
      fat: sumRange(resolved.map((item) => item.fat)),
    };

    return { items: resolved, totals };
  }

  async saveMeal(ownerId: string | null, analysis: MealAnalysis) {
    return prisma.meal.create({
      data: {
        userId: ownerId,
        ...totalsToRow(analysis.totals),
        items: { create: analysis.items.map(itemToRow) },
      },
      include: { items: true },
    });
  }

  /**
   * Replaces a saved meal's items and totals with a freshly recalculated
   * analysis. Ownership must already be verified by the caller (via
   * getMealForOwner) before calling this.
   */
  async updateMeal(mealId: string, analysis: MealAnalysis) {
    return prisma.$transaction(async (tx) => {
      await tx.foodItem.deleteMany({ where: { mealId } });
      return tx.meal.update({
        where: { id: mealId },
        data: {
          ...totalsToRow(analysis.totals),
          items: { create: analysis.items.map(itemToRow) },
        },
        include: { items: true },
      });
    });
  }

  async listMealsForOwner(ownerId: string | null) {
    return prisma.meal.findMany({
      where: { userId: ownerId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async getMealForOwner(ownerId: string | null, mealId: string) {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { items: true },
    });
    if (!meal || meal.userId !== ownerId) {
      throw new MealNotFoundError("Comida no encontrada");
    }
    return meal;
  }

  async getTodaySummary(ownerId: string | null): Promise<MacroRanges> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const meals = await prisma.meal.findMany({
      where: { userId: ownerId, createdAt: { gte: startOfDay } },
      select: {
        minCalories: true,
        maxCalories: true,
        minProtein: true,
        maxProtein: true,
        minCarbs: true,
        maxCarbs: true,
        minFat: true,
        maxFat: true,
      },
    });

    return {
      calories: sumRange(meals.map((m) => ({ min: m.minCalories, max: m.maxCalories }))),
      protein: sumRange(meals.map((m) => ({ min: m.minProtein, max: m.maxProtein }))),
      carbs: sumRange(meals.map((m) => ({ min: m.minCarbs, max: m.maxCarbs }))),
      fat: sumRange(meals.map((m) => ({ min: m.minFat, max: m.maxFat }))),
    };
  }

  /** Deletes every meal (and cascaded food items) owned by this installation/user — used by account/data deletion. */
  async deleteAllMealsForOwner(ownerId: string | null): Promise<void> {
    await prisma.meal.deleteMany({ where: { userId: ownerId } });
  }
}

function totalsToRow(totals: MacroRanges) {
  return {
    minCalories: totals.calories.min,
    maxCalories: totals.calories.max,
    minProtein: totals.protein.min,
    maxProtein: totals.protein.max,
    minCarbs: totals.carbs.min,
    maxCarbs: totals.carbs.max,
    minFat: totals.fat.min,
    maxFat: totals.fat.max,
  };
}

function itemToRow(item: AnalyzedFoodItem) {
  return {
    name: item.name,
    grams: item.grams,
    gramsMin: item.gramsMin,
    gramsMax: item.gramsMax,
    minCalories: item.calories.min,
    maxCalories: item.calories.max,
    minProtein: item.protein.min,
    maxProtein: item.protein.max,
    minCarbs: item.carbs.min,
    maxCarbs: item.carbs.max,
    minFat: item.fat.min,
    maxFat: item.fat.max,
    confidence: item.confidence,
  };
}

function sumRange(ranges: Range[]): Range {
  return ranges.reduce<Range>(
    (acc, r) => ({ min: round(acc.min + r.min), max: round(acc.max + r.max) }),
    { min: 0, max: 0 },
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export const mealService = new MealService();
