import { NextRequest, NextResponse } from "next/server";
import { resolveOwnerIdForApi } from "@/lib/access";
import { saveMealSchema } from "@/lib/validation";
import { mealService } from "@/services/meals/MealService";

export const dynamic = "force-dynamic";

// Pure arithmetic recalculation (grams edited, food added/removed manually).
// Never calls Gemini — that only happens once, in /api/meals/analyze.

export async function POST(request: NextRequest) {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;

  const body = await request.json().catch(() => null);
  const parsed = saveMealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const analysis = await mealService.buildAnalysis(parsed.data.items);
  return NextResponse.json({ analysis });
}
