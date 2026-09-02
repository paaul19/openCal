import type { MealAnalysis } from "@/types";

export class ApiError extends Error {}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error ?? "Ha ocurrido un error inesperado.");
  }
  return data as T;
}

export function analyzeMealImage(imageDataUrl: string) {
  return fetch("/api/meals/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl }),
  }).then((res) => parseResponse<{ analysis: MealAnalysis }>(res));
}

export interface MealItemInput {
  name: string;
  grams: number;
  gramsMin?: number;
  gramsMax?: number;
  confidence?: number | null;
}

export function recalculateMeal(items: MealItemInput[]) {
  return fetch("/api/meals/recalculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then((res) => parseResponse<{ analysis: MealAnalysis }>(res));
}

export function saveMeal(items: MealItemInput[]) {
  return fetch("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then((res) => parseResponse<{ meal: { id: string } }>(res));
}

export function updateMeal(mealId: string, items: MealItemInput[]) {
  return fetch(`/api/meals/${mealId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then((res) => parseResponse<{ meal: { id: string } }>(res));
}
