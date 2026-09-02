import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessContext } from "@/lib/access";
import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Danger-zone action. Behavior depends on installation mode:
//  - single: there is no "account" to delete — this wipes the installation's
//    own data (meals + food items) and nothing else.
//  - multi: deletes the authenticated user; the User→Meal→FoodItem cascade
//    (declared in schema.prisma) removes every row that belonged to them, so
//    there's no separate cleanup query to get wrong or forget.
export async function DELETE() {
  const ctx = await getAccessContext();

  if (ctx.status === "single") {
    await prisma.meal.deleteMany({ where: { userId: null } });
    return NextResponse.json({ ok: true, mode: "single" });
  }

  if (ctx.status !== "authenticated") {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: ctx.ownerId } });
  clearSessionCookie();
  return NextResponse.json({ ok: true, mode: "multi" });
}
