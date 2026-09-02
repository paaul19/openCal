import { NextRequest, NextResponse } from "next/server";
import { resolveOwnerIdForApi } from "@/lib/access";
import { mealService, MealNotFoundError } from "@/services/meals/MealService";
import { saveMealSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;

  try {
    const meal = await mealService.getMealForOwner(access.ownerId, params.id);
    return NextResponse.json({ meal });
  } catch (error) {
    if (error instanceof MealNotFoundError) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 });
    }
    throw error;
  }
}

// Edits a previously saved meal (grams/foods changed after the fact). Never
// calls Gemini — same pure recalculation as /api/meals/recalculate, just
// persisted in place instead of returned as a preview.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;

  try {
    await mealService.getMealForOwner(access.ownerId, params.id);
  } catch (error) {
    if (error instanceof MealNotFoundError) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const parsed = saveMealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const analysis = await mealService.buildAnalysis(parsed.data.items);
  const meal = await mealService.updateMeal(params.id, analysis);

  return NextResponse.json({ meal });
}
