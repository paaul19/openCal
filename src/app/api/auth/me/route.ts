import { NextResponse } from "next/server";
import { getAccessContext } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getAccessContext();
  if (ctx.status === "authenticated") {
    return NextResponse.json({ mode: "multi", username: ctx.username });
  }
  if (ctx.status === "single") {
    return NextResponse.json({ mode: "single", username: null });
  }
  return NextResponse.json({ mode: null, username: null });
}
