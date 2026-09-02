"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DangerConfirmSheet } from "@/components/DangerConfirmSheet";
import { LogOutIcon, ChevronRightIcon, UserIcon } from "@/components/icons";

export function SettingsView({ mode, username }: { mode: "single" | "multi"; username: string | null }) {
  const router = useRouter();
  const [showDanger, setShowDanger] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleDelete() {
    const response = await fetch("/api/account", { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error ?? "No se ha podido completar la acción.");
    }
    router.push(mode === "multi" ? "/login" : "/");
    router.refresh();
  }

  return (
    <main className="safe-top px-5 pb-2">
      <h1 className="py-4 text-[1.5rem] font-bold">Ajustes</h1>

      <Section title="General">
        <Row label="Apariencia">
          <div className="mt-2">
            <ThemeToggle />
          </div>
        </Row>
      </Section>

      {mode === "multi" && username && (
        <Section title="Cuenta">
          <div className="flex items-center gap-3 px-1 py-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <UserIcon className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-medium">{username}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="pressable-subtle flex w-full items-center gap-3 rounded-md px-1 py-3 text-[15px] text-foreground transition-colors"
          >
            <LogOutIcon className="h-5 w-5 text-muted" />
            {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            <ChevronRightIcon className="ml-auto h-4 w-4 text-muted-2" />
          </button>
        </Section>
      )}

      <Section title="Instalación">
        <p className="px-1 py-2 text-[14px] text-muted">
          Modo: <span className="font-medium text-foreground">{mode === "single" ? "Solo para mí" : "Varios usuarios"}</span>
        </p>
      </Section>

      <Section title="Zona peligrosa" tone="danger">
        <button
          type="button"
          onClick={() => setShowDanger(true)}
          className="pressable-subtle w-full rounded-md px-1 py-3 text-left text-[15px] font-medium text-danger transition-colors"
        >
          {mode === "multi" ? "Eliminar cuenta" : "Borrar todos los datos"}
        </button>
      </Section>

      {showDanger && (
        <DangerConfirmSheet
          title={mode === "multi" ? "Eliminar cuenta" : "Borrar todos los datos"}
          description={
            mode === "multi"
              ? "Se eliminarán tu cuenta, tus comidas, alimentos y análisis. No podrás volver a acceder con este usuario."
              : "Se eliminarán todas las comidas, alimentos y análisis guardados en esta instalación."
          }
          confirmWord={mode === "multi" ? "ELIMINAR" : "BORRAR"}
          confirmLabel={mode === "multi" ? "Eliminar cuenta" : "Borrar todo"}
          onConfirm={handleDelete}
          onClose={() => setShowDanger(false)}
        />
      )}
    </main>
  );
}

function Section({ title, tone, children }: { title: string; tone?: "danger"; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className={`mb-2 text-[13px] font-medium ${tone === "danger" ? "text-danger" : "text-muted"}`}>{title}</h2>
      <div className="rounded-md border border-border bg-surface px-3 py-1">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-1 py-2.5">
      <p className="text-[13px] text-muted">{label}</p>
      {children}
    </div>
  );
}
