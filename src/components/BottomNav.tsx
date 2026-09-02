"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, HistoryIcon, CameraIcon } from "@/components/icons";

const HIDDEN_ON = ["/login", "/register", "/setup"];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) {
    return null;
  }

  const isHome = pathname === "/";
  const isHistory = pathname === "/history";

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[64px] max-w-md items-center justify-around px-2">
        <NavLink href="/" label="Inicio" active={isHome} icon={<HomeIcon className="h-6 w-6" />} />

        <Link
          href="/?capture=1"
          aria-label="Analizar comida"
          className="pressable-subtle flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/40 transition-transform"
        >
          <CameraIcon className="h-6 w-6" strokeWidth={2} />
        </Link>

        <NavLink href="/history" label="Historial" active={isHistory} icon={<HistoryIcon className="h-6 w-6" />} />
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`pressable-subtle flex w-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-200 ${
        active ? "text-primary" : "text-muted-2"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
