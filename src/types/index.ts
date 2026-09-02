export interface Range {
  min: number;
  max: number;
}

export interface MacroRanges {
  calories: Range;
  protein: Range;
  carbs: Range;
  fat: Range;
}

export interface AnalyzedFoodItem {
  name: string;
  grams: number;
  gramsMin: number;
  gramsMax: number;
  confidence: number;
  calories: Range;
  protein: Range;
  carbs: Range;
  fat: Range;
}

export interface MealAnalysis {
  items: AnalyzedFoodItem[];
  totals: MacroRanges;
}

export type ConfidenceLevel = "alta" | "media" | "baja";

export function confidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.75) return "alta";
  if (confidence >= 0.45) return "media";
  return "baja";
}

export function formatRange(range: Range): string {
  return `${Math.round(range.min)}–${Math.round(range.max)}`;
}

export type InstallationMode = "single" | "multi";
