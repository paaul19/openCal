import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rateLimit";
import { getInstallationMode } from "@/lib/installation";

export const dynamic = "force-dynamic";

// Only meaningful once an installation has opted into multi-user mode (the
// first account is created by /api/setup instead). Single-user installs and
// unconfigured installs both refuse this route.
export async function POST(request: NextRequest) {
  const mode = await getInstallationMode();
  if (mode !== "multi") {
    return NextResponse.json({ error: "El registro no está disponible en esta instalación." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`register:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un momento." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { username, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese usuario" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { username, passwordHash } });

  await setSessionCookie({ userId: user.id, username: user.username });

  return NextResponse.json({ username: user.username }, { status: 201 });
}
