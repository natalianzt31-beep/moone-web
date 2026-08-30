"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { TerminosModal } from "@/components/TerminosModal";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, client, loading } = useAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

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

  const mostrarTerminos = !!client && !client.terminos_aceptados && !dismissed;

  return (
    <>
      {children}
      {mostrarTerminos && (
        <TerminosModal clientId={client!.id} onClose={() => setDismissed(true)} />
      )}
    </>
  );
}
