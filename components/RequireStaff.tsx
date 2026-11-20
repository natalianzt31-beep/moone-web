"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { puedeAcceder } from "@/lib/adminAccess";
import type { StaffRol } from "@/lib/supabase/types";

export function RequireStaff({
  children,
  roles,
}: {
  children: React.ReactNode;
  /** Roles que pueden ver esta página. Sin esto, cualquier staff logueado entra. */
  roles?: StaffRol[];
}) {
  const { user, isStaff, staffRol, loading } = useAuth();
  const router = useRouter();
  const autorizado = puedeAcceder(roles ?? null, staffRol);

  useEffect(() => {
    if (loading) return;
    if (!user || !isStaff) {
      router.replace("/admin/login");
      return;
    }
    if (!autorizado) {
      router.replace("/admin");
    }
  }, [user, isStaff, loading, autorizado, router]);

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-taupe sm:px-8">Cargando...</p>;
  }

  if (!user || !isStaff || !autorizado) {
    return null;
  }

  return <>{children}</>;
}
