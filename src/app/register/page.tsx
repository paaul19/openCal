import { redirect } from "next/navigation";
import { getAccessContext } from "@/lib/access";
import { getInstallationMode } from "@/lib/installation";
import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const mode = await getInstallationMode();
  if (!mode) redirect("/setup");
  if (mode !== "multi") redirect("/");

  const ctx = await getAccessContext();
  if (ctx.status === "authenticated") redirect("/");

  return <AuthForm mode="register" />;
}
