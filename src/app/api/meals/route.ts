import { NextRequest, NextResponse } from "next/server";
import { resolveOwnerIdForApi } from "@/lib/access";
import { saveMealSchema } from "@/lib/validation";
import { mealService } from "@/services/meals/MealService";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;

  const meals = await mealService.listMealsForOwner(access.ownerId);
  return NextResponse.json({ meals });
}

export async function POST(request: NextRequest) {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;

  const body = await request.json().catch(() => null);
  const parsed = saveMealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const analysis = await mealService.buildAnalysis(parsed.data.items);
  const meal = await mealService.saveMeal(access.ownerId, analysis);

  return NextResponse.json({ meal }, { status: 201 });
}
