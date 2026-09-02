import { NextResponse } from "next/server";
import { resolveOwnerIdForApi } from "@/lib/access";
import { mealService } from "@/services/meals/MealService";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await resolveOwnerIdForApi();
  if ("response" in access) return access.response;

  const summary = await mealService.getTodaySummary(access.ownerId);
  return NextResponse.json({ summary });
}
