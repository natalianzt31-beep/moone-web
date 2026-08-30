"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ContinuarConGoogle } from "@/components/ContinuarConGoogle";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/mi-cuenta/historial");
    }
  }, [loading, user, router]);

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
        return;
      }

      router.replace("/mi-cuenta/historial");
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
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Entrá a tu cuenta para ver tus reservas y tu carrito.
          </p>

          <div className="mt-8">
            <ContinuarConGoogle />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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

          <p className="mt-6 text-sm text-taupe">
            ¿Todavía no tenés cuenta?{" "}
            <Link href="/mi-cuenta/registro" className="text-negro hover:text-chocolate">
              Registrate
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
