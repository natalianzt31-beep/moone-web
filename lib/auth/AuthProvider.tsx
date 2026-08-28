"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ensureClientRow } from "@/lib/supabase/account";
import type { Client } from "@/lib/supabase/types";

type AuthContextValue = {
  user: User | null;
  client: Client | null;
  isStaff: boolean;
  loading: boolean;
  refreshClient: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  client: null,
  isStaff: false,
  loading: true,
  refreshClient: async () => {},
  signOut: async () => {},
});

async function fetchIsStaff(): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient().rpc("is_staff");
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUserContext(u: User) {
      const [clientResult, staffResult] = await Promise.allSettled([
        ensureClientRow(u),
        fetchIsStaff(),
      ]);
      if (cancelled) return;
      setClient(clientResult.status === "fulfilled" ? clientResult.value : null);
      setIsStaff(staffResult.status === "fulfilled" ? staffResult.value : false);
    }

    async function init() {
      try {
        const supabase = getSupabaseClient();

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) await loadUserContext(sessionUser);
        if (!cancelled) setLoading(false);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (cancelled) return;
          const nextUser = session?.user ?? null;
          setUser(nextUser);
          if (nextUser) {
            loadUserContext(nextUser);
          } else {
            setClient(null);
            setIsStaff(false);
          }
        });

        return () => subscription.unsubscribe();
      } catch {
        if (!cancelled) setLoading(false);
        return undefined;
      }
    }

    const cleanupPromise = init();

    return () => {
      cancelled = true;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);

  const refreshClient = useCallback(async () => {
    if (!user) return;
    const c = await ensureClientRow(user);
    setClient(c);
  }, [user]);

  const signOut = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, client, isStaff, loading, refreshClient, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
