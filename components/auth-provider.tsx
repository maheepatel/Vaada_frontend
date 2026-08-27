"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AppRole = "citizen" | "reviewer" | "admin";
type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  signedIn: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const isPermanentUser = (user: User | null | undefined) => Boolean(user && !user.is_anonymous);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const applySession = useCallback(async (nextSession: Session | null) => {
    const supabase = getBrowserSupabase();
    if (!supabase || !isPermanentUser(nextSession?.user)) {
      setSession(null);
      setRole(null);
      setLoading(false);
      return;
    }
    setSession(nextSession);
    const { data } = await supabase.from("profiles").select("role").eq("id", nextSession!.user.id).maybeSingle();
    setRole((data?.role as AppRole | undefined) ?? "citizen");
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return setLoading(false);
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    await applySession(data.session);
  }, [applySession]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, [applySession]);

  const value = useMemo<AuthState>(() => ({
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    role,
    signedIn: isPermanentUser(session?.user),
    refresh,
  }), [loading, refresh, role, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
