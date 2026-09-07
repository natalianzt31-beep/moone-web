"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await getSupabaseClient().auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return;
      }

      setListo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-4 py-10 sm:px-8 sm:py-16">
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Elegir nueva contraseña
          </h1>

          {loading ? (
            <p className="mt-8 text-sm text-taupe">Cargando...</p>
          ) : listo ? (
            <>
              <p className="mt-8 text-sm text-chocolate">Tu contraseña se actualizó.</p>
              <button
                type="button"
                onClick={() => router.replace("/mi-cuenta/historial")}
                className="mt-4 flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
              >
                Ir a mi cuenta
              </button>
            </>
          ) : !user ? (
            <p className="mt-8 text-sm text-chocolate">
              Este link no es válido o ya venció. Pedí uno nuevo desde{" "}
              <Link href="/mi-cuenta/recuperar" className="text-negro hover:text-chocolate">
                recuperar contraseña
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-negro">
                Nueva contraseña
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-negro">
                Repetir contraseña
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className={inputClass}
                />
              </label>

              {error && <p className="text-sm text-chocolate">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
