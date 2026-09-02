import { NextRequest, NextResponse } from "next/server";
import { resolveOwnerIdForApi } from "@/lib/access";
import { isRateLimited } from "@/lib/rateLimit";
import { parseAndValidateDataUrl, ImageValidationError } from "@/lib/imageValidation";
import { getFoodAnalysisService } from "@/services/ai/GeminiFoodAnalysisService";
import { FoodAnalysisError } from "@/services/ai/FoodAnalysisService";
import { mealService } from "@/services/meals/MealService";

export const dynamic = "force-dynamic";

// One Gemini call per analyzed photo. Editing grams/macros afterwards never
// hits this route again — the client recalculates locally, or POSTs to
// /api/meals/recalculate which does pure arithmetic, no AI call.

export async function POST(request: NextRequest) {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;
  const { ownerId } = access;

  const rateLimitKey = ownerId ?? "single-install";
  if (isRateLimited(`analyze:${rateLimitKey}`, 20, 60 * 60_000)) {
    return NextResponse.json(
      { error: "Has alcanzado el límite de análisis por hora. Inténtalo más tarde." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const image = body?.image;
  if (typeof image !== "string") {
    return NextResponse.json({ error: "Falta la imagen." }, { status: 400 });
  }

  let parsedImage;
  try {
    parsedImage = parseAndValidateDataUrl(image);
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  try {
    const service = getFoodAnalysisService();
    const detectedFoods = await service.analyzeFoodImage({
      base64: parsedImage.base64,
      mimeType: parsedImage.mimeType,
    });

    const analysis = await mealService.buildAnalysis(
      detectedFoods.map((food) => ({
        name: food.name,
        grams: Math.round((food.estimatedGramsMin + food.estimatedGramsMax) / 2),
        gramsMin: food.estimatedGramsMin,
        gramsMax: food.estimatedGramsMax,
        confidence: food.confidence,
      })),
    );

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof FoodAnalysisError) {
      const status = error.code === "RATE_LIMIT" ? 429 : error.code === "TIMEOUT" ? 504 : 422;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("Meal analysis failed", error);
    return NextResponse.json({ error: "No se ha podido analizar la imagen. Inténtalo de nuevo." }, { status: 500 });
  }
}
