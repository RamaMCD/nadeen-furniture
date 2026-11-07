"use client";

import * as React from "react";
import type { User } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function toAppUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const name =
    (supabaseUser.user_metadata?.full_name as string | undefined) ??
    (supabaseUser.user_metadata?.name as string | undefined) ??
    supabaseUser.email?.split("@")[0] ??
    "Admin";
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name,
    role: "admin",
    avatarUrl: supabaseUser.user_metadata?.avatar_url as string | undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Failed to get session:", error);
        }

        if (isMounted) {
          setUser(session?.user ? toAppUser(session.user) : null);
        }
      } catch (err) {
        console.error("Session fetch error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ? toAppUser(session.user) : null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = React.useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUser(toAppUser(data.user));
      }
    },
    [supabase]
  );

  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("SignOut error:", error);
    }
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith("sb-") || name.includes("auth-token")) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    }
    setUser(null);
  }, [supabase]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
