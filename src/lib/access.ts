import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getInstallationMode } from "@/lib/installation";
import { getSession } from "@/lib/auth";

// The single place that answers "who owns the data for this request".
//
//   single-user  → request → the installation itself → data (ownerId: null)
//   multi-user   → request → authenticated user       → data (ownerId: user.id)
//
// Everything else (pages, API routes) builds on top of this instead of each
// re-implementing the single/multi branching.
export type AccessContext =
  | { status: "setup-required" }
  | { status: "single"; ownerId: null }
  | { status: "login-required" }
  | { status: "authenticated"; ownerId: string; username: string };

export async function getAccessContext(): Promise<AccessContext> {
  const mode = await getInstallationMode();
  if (!mode) return { status: "setup-required" };
  if (mode === "single") return { status: "single", ownerId: null };

  const session = await getSession();
  if (!session) return { status: "login-required" };
  return { status: "authenticated", ownerId: session.userId, username: session.username };
}

/** For Server Component pages: redirects as needed, otherwise returns the owner id. */
export async function requireOwnerId(): Promise<string | null> {
  const ctx = await getAccessContext();
  switch (ctx.status) {
    case "setup-required":
      redirect("/setup");
    case "login-required":
      redirect("/login");
    case "single":
      return ctx.ownerId;
    case "authenticated":
      return ctx.ownerId;
  }
}

/** For API routes: returns either the owner id or a ready-to-return NextResponse. */
export async function resolveOwnerIdForApi(): Promise<
  { ownerId: string | null } | { response: NextResponse }
> {
  const ctx = await getAccessContext();
  switch (ctx.status) {
    case "setup-required":
      return { response: NextResponse.json({ error: "La instalación no está configurada." }, { status: 400 }) };
    case "login-required":
      return { response: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
    case "single":
      return { ownerId: ctx.ownerId };
    case "authenticated":
      return { ownerId: ctx.ownerId };
  }
}
