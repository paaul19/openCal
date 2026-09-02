"use client";

import { useEffect, useState } from "react";
import { CheckIcon, UtensilsIcon } from "@/components/icons";

// Purely visual progression — the backend does one single Gemini call, it
// doesn't report discrete steps. This just gives the user a sense of motion
// while that call is in flight.
const STEPS = ["Identificando alimentos", "Estimando cantidades", "Calculando nutrición"];

const STEP_INTERVAL_MS = 1100;

export function AnalysisLoading() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((step) => Math.min(step + 1, STEPS.length));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-7 px-6 py-20 text-center animate-fade-in">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-soft rounded-full bg-primary/15" />
        <UtensilsIcon className="h-7 w-7 text-primary" strokeWidth={1.6} />
      </div>
      <div>
        <p className="text-[17px] font-semibold">Analizando tu comida…</p>
        <p className="mt-1 text-[13px] text-muted">Esto tarda solo unos segundos</p>
      </div>
      <ul className="w-full max-w-[15rem] space-y-3 text-left">
        {STEPS.map((step, index) => {
          const done = index < activeStep;
          const current = index === activeStep;
          return (
            <li key={step} className="flex items-center gap-2.5 text-[14px]">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-300 ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-primary"
                      : "border-border-strong"
                }`}
              >
                {done && <CheckIcon className="h-3 w-3 animate-check-pop" strokeWidth={3} />}
                {current && !done && <span className="h-2 w-2 animate-pulse-soft rounded-full bg-primary" />}
              </span>
              <span
                className={`transition-colors duration-300 ${done || current ? "text-foreground" : "text-muted-2"}`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
