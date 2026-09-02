import { prisma } from "@/lib/prisma";
import type { InstallationMode } from "@/types";

const INSTALLATION_ID = 1;

export async function getInstallationMode(): Promise<InstallationMode | null> {
  const installation = await prisma.installation.findUnique({ where: { id: INSTALLATION_ID } });
  return (installation?.mode as InstallationMode | undefined) ?? null;
}

/** Throws if setup already ran — the wizard must never be re-runnable. */
export async function completeSetup(mode: InstallationMode): Promise<void> {
  const existing = await prisma.installation.findUnique({ where: { id: INSTALLATION_ID } });
  if (existing?.mode) {
    throw new Error("La instalación ya está configurada.");
  }
  await prisma.installation.upsert({
    where: { id: INSTALLATION_ID },
    create: { id: INSTALLATION_ID, mode },
    update: { mode },
  });
}
