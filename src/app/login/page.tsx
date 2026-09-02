import { redirect } from "next/navigation";
import { getAccessContext } from "@/lib/access";
import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const ctx = await getAccessContext();
  if (ctx.status === "setup-required") redirect("/setup");
  if (ctx.status === "single" || ctx.status === "authenticated") redirect("/");

  return <AuthForm mode="login" />;
}
