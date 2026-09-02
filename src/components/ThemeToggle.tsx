"use client";

import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, type ThemePreference } from "@/lib/theme";
import { SunIcon, SettingsIcon, MoonIcon } from "@/components/icons";

const OPTIONS: { value: ThemePreference; label: string; icon: (props: { className?: string }) => React.ReactElement }[] = [
  { value: "light", label: "Claro", icon: SunIcon },
  { value: "system", label: "Sistema", icon: SettingsIcon },
  { value: "dark", label: "Oscuro", icon: MoonIcon },
];

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    setPreference(getStoredTheme());
  }, []);

  function select(value: ThemePreference) {
    setPreference(value);
    applyTheme(value);
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-md bg-border/60 p-1">
      {OPTIONS.map((option) => {
        const active = preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => select(option.value)}
            className={`pressable-subtle flex flex-col items-center gap-1 rounded-sm py-2 text-xs font-medium transition-colors duration-200 ${
              active ? "bg-surface text-foreground shadow-sm" : "text-muted"
            }`}
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
