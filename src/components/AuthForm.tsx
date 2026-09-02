"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserIcon } from "@/components/icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Ha ocurrido un error.");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="safe-top flex min-h-dvh flex-col justify-center px-6 pb-12">
      <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary animate-fade-in-scale">
        <UserIcon className="h-7 w-7" />
      </div>
      <h1 className="text-center font-display text-2xl font-bold">
        {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
      </h1>
      <p className="mb-8 text-center text-[15px] text-muted">
        {mode === "login" ? "Usuario y contraseña de esta instalación." : "Solo usuario y contraseña — sin email."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          autoFocus
          minLength={3}
          maxLength={24}
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={mode === "register" ? 8 : 1}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-primary"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="pressable w-full rounded-md bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {loading ? "Cargando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-primary">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary">
              Inicia sesión
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
