"use client";

import * as React from "react";
import { AuthProvider } from "@/lib/auth-context";

/**
 * Providers wraps only children that need auth context.
 * Public pages use a lightweight shell that skips auth overhead.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

/**
 * PublicProviders — used by public layout (no AuthProvider overhead).
 * Auth state is not needed on public pages.
 */
export function PublicProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
