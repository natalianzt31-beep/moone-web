"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/mi-cuenta/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-taupe sm:px-8">Cargando...</p>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
