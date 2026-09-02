import type { DetectedFood } from "@/lib/validation";

/**
 * Abstraction over "look at a food photo and tell me what's on it, roughly how
 * much". Keeping this interface separate from GeminiFoodAnalysisService means
 * the rest of the app (routes, MealService) never imports Gemini directly, so
 * the provider can be swapped later without touching call sites.
 */
export interface FoodAnalysisService {
  analyzeFoodImage(image: { base64: string; mimeType: string }): Promise<DetectedFood[]>;
}

export class FoodAnalysisError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NO_FOOD_DETECTED"
      | "INVALID_RESPONSE"
      | "TIMEOUT"
      | "RATE_LIMIT"
      | "PROVIDER_ERROR" = "PROVIDER_ERROR",
  ) {
    super(message);
    this.name = "FoodAnalysisError";
  }
}
