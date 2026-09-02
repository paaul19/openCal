"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronLeftIcon, UserIcon, HomeIcon, UsersIcon } from "@/components/icons";
import type { InstallationMode } from "@/types";

type Step = "choose" | "create-account";

const MODES: {
  value: InstallationMode;
  title: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactElement;
}[] = [
  {
    value: "single",
    title: "Solo para mí",
    description: "Instalación personal, sin usuarios ni contraseñas. Entras directamente.",
    icon: HomeIcon,
  },
  {
    value: "multi",
    title: "Para varios usuarios",
    description: "Cada persona tendrá su propia cuenta y sus datos por separado.",
    icon: UsersIcon,
  },
];

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [selected, setSelected] = useState<InstallationMode | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setError(null);
    if (selected === "multi") {
      setStep("create-account");
      return;
    }
    setLoading(true);
    try {
      await submitSetup({ mode: "single" });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error.");
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await submitSetup({ mode: "multi", username, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error.");
      setLoading(false);
    }
  }

  return (
    <main className="safe-top flex min-h-dvh flex-col px-6 pb-8">
      {step === "choose" ? (
        <div key="choose" className="flex flex-1 flex-col animate-fade-in">
          <div className="flex-1 pt-12">
            <h1 className="font-display text-[2rem] font-bold leading-tight">Bienvenido a openCal</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              ¿Cómo quieres utilizar esta instalación? Podrás elegir una sola vez.
            </p>

            <div className="mt-8 space-y-3">
              {MODES.map((mode) => {
                const active = selected === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setSelected(mode.value)}
                    className={`pressable-subtle relative flex w-full items-start gap-3.5 rounded-lg border p-4 text-left transition-colors duration-200 ${
                      active ? "border-primary bg-primary-soft" : "border-border bg-surface"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        active ? "bg-primary text-primary-foreground" : "bg-border/60 text-muted"
                      }`}
                    >
                      <mode.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{mode.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted">{mode.description}</span>
                    </span>
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200 ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border-strong"
                      }`}
                    >
                      {active && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="mb-3 text-center text-sm text-danger">{error}</p>}

          <button
            type="button"
            disabled={!selected || loading}
            onClick={handleContinue}
            className="pressable w-full rounded-md bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {loading ? "Configurando…" : "Continuar"}
          </button>
        </div>
      ) : (
        <div key="create-account" className="flex flex-1 flex-col animate-fade-in">
          <button
            type="button"
            onClick={() => setStep("choose")}
            className="pressable-subtle -ml-2 flex h-9 w-9 items-center justify-center text-muted"
            aria-label="Volver"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="mt-4 flex-1">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <UserIcon className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold">Crea la primera cuenta</h1>
            <p className="mt-1 text-[15px] text-muted">Solo usuario y contraseña — sin email.</p>

            <form id="create-account-form" onSubmit={handleCreateAccount} className="mt-6 space-y-4">
              <Field label="Usuario">
                <input
                  autoFocus
                  required
                  minLength={3}
                  maxLength={24}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="p.ej. pablo"
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-primary"
                />
              </Field>
              <Field label="Contraseña">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-primary"
                />
              </Field>
              <Field label="Confirmar contraseña">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-primary"
                />
              </Field>
            </form>
          </div>

          {error && <p className="mb-3 text-center text-sm text-danger">{error}</p>}

          <button
            type="submit"
            form="create-account-form"
            disabled={loading}
            className="pressable w-full rounded-md bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

async function submitSetup(body: { mode: "single" } | { mode: "multi"; username: string; password: string }) {
  const response = await fetch("/api/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Ha ocurrido un error.");
  }
  return data;
}
