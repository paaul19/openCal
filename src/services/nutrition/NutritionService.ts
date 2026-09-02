import { prisma } from "@/lib/prisma";
import type { MacroRanges, Range } from "@/types";

interface Per100g {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Generic fallback used only when a food name has no match in FoodReference.
// Roughly the average of a mixed plate — clearly a rough estimate, not a lookup.
const FALLBACK_PER_100G: Per100g = { calories: 180, protein: 8, carbs: 18, fat: 8 };

// Foods where the name alone hides real calorie variance — a "salsa" or
// "aceite" can be a light drizzle or a generous pour, and composite dishes
// often hide extra fat/sugar the photo can't reveal. Widens the range instead
// of pretending a picture resolves it.
const HIGH_UNCERTAINTY_PATTERN =
  /aceite|salsa|mayo|alioli|aderez|mantequilla|crema|caldo|sopa|frit|reboz|guiso|estofa/i;

export interface FoodReferenceMatch {
  name: string;
  matchedName: string | null;
  per100g: Per100g;
  isFallback: boolean;
}

/**
 * Resolves per-100g nutrition for a food name and turns a portion-size RANGE
 * into a calorie/macro RANGE — never a single false-precision number.
 *
 * The width of the range is driven by real factors, not a flat "±100 kcal
 * for everything": how wide the portion estimate already is, how confident
 * the detection was, whether the food matched our reference table at all,
 * and whether the food is the kind that hides calories (oils, sauces,
 * composite/fried dishes).
 */
export class NutritionService {
  async lookup(name: string): Promise<FoodReferenceMatch> {
    const normalized = normalize(name);

    const exact = await prisma.foodReference.findFirst({
      where: { name: { equals: normalized, mode: "insensitive" } },
    });
    if (exact) {
      return {
        name,
        matchedName: exact.name,
        isFallback: false,
        per100g: {
          calories: exact.caloriesPer100g,
          protein: exact.proteinPer100g,
          carbs: exact.carbsPer100g,
          fat: exact.fatPer100g,
        },
      };
    }

    const candidates = await prisma.foodReference.findMany();
    const partial = candidates.find(
      (candidate) => normalized.includes(candidate.name) || candidate.name.includes(normalized),
    );
    if (partial) {
      return {
        name,
        matchedName: partial.name,
        isFallback: false,
        per100g: {
          calories: partial.caloriesPer100g,
          protein: partial.proteinPer100g,
          carbs: partial.carbsPer100g,
          fat: partial.fatPer100g,
        },
      };
    }

    return { name, matchedName: null, isFallback: true, per100g: FALLBACK_PER_100G };
  }

  /**
   * How much extra, beyond the portion-size range itself, to widen the
   * calorie/macro range by. Capped so two bad signals stacking (e.g. an
   * unmatched food photographed with low confidence) can't blow the range
   * up into something useless — the whole point of a range is that it stays
   * informative, not that it technically "covers" every possibility.
   */
  private uncertaintyFactor(name: string, confidence: number, isFallback: boolean): number {
    let factor = 0.04; // baseline: even a known food, exactly weighed, isn't lab-precise
    if (confidence < 0.5) factor += 0.06;
    else if (confidence < 0.75) factor += 0.03;
    if (isFallback) factor += 0.06;
    if (HIGH_UNCERTAINTY_PATTERN.test(name)) factor += 0.05;
    return Math.min(factor, 0.12);
  }

  private rangeFor(per100gValue: number, gramsMin: number, gramsMax: number, uncertainty: number): Range {
    // Asymmetric on purpose: hidden oil, sauce, or frying almost always adds
    // calories a photo can't reveal, rarely removes them — so the upper end
    // opens up more than the lower end tightens.
    const low = per100gValue * (gramsMin / 100) * (1 - uncertainty * 0.7);
    const high = per100gValue * (gramsMax / 100) * (1 + uncertainty * 1.3);
    return { min: Math.max(0, round(low)), max: round(high) };
  }

  /**
   * Computes calorie/macro ranges for one food given its (possibly edited)
   * portion range. Editing grams down to a single confirmed value (gramsMin
   * === gramsMax) collapses the *quantity* uncertainty but keeps the
   * *composition* uncertainty (confidence, fallback, hidden-fat foods) —
   * an edited "150g of pollo" still isn't a lab measurement.
   */
  async calculateRange(
    name: string,
    gramsMin: number,
    gramsMax: number,
    confidence: number,
  ): Promise<{ ranges: MacroRanges; isFallback: boolean; matchedName: string | null }> {
    const match = await this.lookup(name);
    const uncertainty = this.uncertaintyFactor(name, confidence, match.isFallback);

    return {
      isFallback: match.isFallback,
      matchedName: match.matchedName,
      ranges: {
        calories: this.rangeFor(match.per100g.calories, gramsMin, gramsMax, uncertainty),
        protein: this.rangeFor(match.per100g.protein, gramsMin, gramsMax, uncertainty),
        carbs: this.rangeFor(match.per100g.carbs, gramsMin, gramsMax, uncertainty),
        fat: this.rangeFor(match.per100g.fat, gramsMin, gramsMax, uncertainty),
      },
    };
  }

  async searchFoods(query: string, limit = 15) {
    const normalized = normalize(query);
    if (!normalized) {
      return prisma.foodReference.findMany({ take: limit, orderBy: { name: "asc" } });
    }
    return prisma.foodReference.findMany({
      where: { name: { contains: normalized, mode: "insensitive" } },
      take: limit,
      orderBy: { name: "asc" },
    });
  }
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export const nutritionService = new NutritionService();
