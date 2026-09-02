import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstallationMode, completeSetup } from "@/lib/installation";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { setupSchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Runs exactly once per installation. Refuses outright once a mode is already
// set, so there is no public page that can re-run or change the setup later.
export async function POST(request: NextRequest) {
  const existingMode = await getInstallationMode();
  if (existingMode) {
    return NextResponse.json({ error: "La instalación ya está configurada." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`setup:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un momento." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.mode === "single") {
    await completeSetup("single");
    return NextResponse.json({ mode: "single" }, { status: 201 });
  }

  const { username, password } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese usuario" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { username, passwordHash } });
  await completeSetup("multi");
  await setSessionCookie({ userId: user.id, username: user.username });

  return NextResponse.json({ mode: "multi", username: user.username }, { status: 201 });
}
