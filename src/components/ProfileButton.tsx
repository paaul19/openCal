import Link from "next/link";
import { UserIcon } from "@/components/icons";

export function ProfileButton() {
  return (
    <Link
      href="/settings"
      aria-label="Ajustes y perfil"
      className="pressable-subtle absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors"
    >
      <UserIcon className="h-5 w-5" />
    </Link>
  );
}
