"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isStaff, loading, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isStaff) {
      router.replace("/admin/stock");
    }
  }, [loading, user, isStaff, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos."
            : error.message
        );
      }
      // si es correcto, el useEffect de arriba redirige apenas isStaff resuelva
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  const notStaff = !loading && user && !isStaff;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-marfil px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
          Môone Admin
        </h1>
        <p className="mt-1 text-sm text-chocolate">Acceso solo para el equipo.</p>

        {notStaff ? (
          <div className="mt-8 flex flex-col gap-3 rounded-[3px] bg-crema p-4 text-sm text-chocolate">
            Esta cuenta no tiene permisos de administración.
            <button
              type="button"
              onClick={() => signOut()}
              className="flex min-h-11 w-fit items-center text-negro hover:text-chocolate"
            >
              Cerrar sesión y probar con otra cuenta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-negro">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-negro">
              Contraseña
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>

            {error && <p className="text-sm text-chocolate">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
