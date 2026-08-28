"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export function RequireStaff({ children }: { children: React.ReactNode }) {
  const { user, isStaff, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !isStaff) {
      router.replace("/admin/login");
    }
  }, [user, isStaff, loading, router]);

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-taupe sm:px-8">Cargando...</p>;
  }

  if (!user || !isStaff) {
    return null;
  }

  return <>{children}</>;
}
