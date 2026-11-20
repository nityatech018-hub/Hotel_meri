import { useHydrated, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useHotel } from "@/lib/hotel/store";
import type { Role } from "@/lib/hotel/types";
import { ShellLoading } from "./DashboardShell";

/** Demo-only gate: sends visitors without the right browser session to the login page. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useHotel((s) => s.session);
  const navigate = useNavigate();
  const ok = session?.role === role;
  useEffect(() => {
    if (hydrated && !ok) navigate({ to: "/login", search: { role }, replace: true });
  }, [hydrated, ok, role, navigate]);
  if (!hydrated || !ok) return <ShellLoading />;
  return <>{children}</>;
}
