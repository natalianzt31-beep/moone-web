"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ensureClientRow } from "@/lib/supabase/account";
import type { Client } from "@/lib/supabase/types";

type AuthContextValue = {
  user: User | null;
  client: Client | null;
  loading: boolean;
  refreshClient: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  client: null,
  loading: true,
  refreshClient: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadClient(u: User) {
      try {
        const c = await ensureClientRow(u);
        if (!cancelled) setClient(c);
      } catch {
        if (!cancelled) setClient(null);
      }
    }

    async function init() {
      try {
        const supabase = getSupabaseClient();

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) await loadClient(sessionUser);
        if (!cancelled) setLoading(false);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (cancelled) return;
          const nextUser = session?.user ?? null;
          setUser(nextUser);
          if (nextUser) {
            loadClient(nextUser);
          } else {
            setClient(null);
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
    <AuthContext.Provider value={{ user, client, loading, refreshClient, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
