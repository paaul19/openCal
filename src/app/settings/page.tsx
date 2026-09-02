import { getAccessContext } from "@/lib/access";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/SettingsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await getAccessContext();
  if (ctx.status === "setup-required") redirect("/setup");
  if (ctx.status === "login-required") redirect("/login");

  return (
    <SettingsView
      mode={ctx.status === "single" ? "single" : "multi"}
      username={ctx.status === "authenticated" ? ctx.username : null}
    />
  );
}
