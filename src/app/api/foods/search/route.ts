import { NextRequest, NextResponse } from "next/server";
import { resolveOwnerIdForApi } from "@/lib/access";
import { nutritionService } from "@/services/nutrition/NutritionService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const foods = await nutritionService.searchFoods(query);
  return NextResponse.json({ foods });
}
