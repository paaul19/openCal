import { redirect } from "next/navigation";
import { getInstallationMode } from "@/lib/installation";
import { SetupWizard } from "@/components/SetupWizard";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const mode = await getInstallationMode();
  if (mode) {
    redirect("/");
  }

  return <SetupWizard />;
}
