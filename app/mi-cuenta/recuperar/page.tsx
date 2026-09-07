"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { getSupabaseClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/mi-cuenta/nueva-contrasena`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setEnviado(true);
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
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Ingresá tu email y te mandamos un link para elegir una contraseña nueva.
          </p>

          {enviado ? (
            <p className="mt-8 text-sm text-chocolate">
              Si ese email tiene una cuenta en Môone, te llegó un mail con el link para
              restablecer tu contraseña.
            </p>
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

              {error && <p className="text-sm text-chocolate">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
              >
                {submitting ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-taupe">
            <Link href="/mi-cuenta/login" className="text-negro hover:text-chocolate">
              Volver a iniciar sesión
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
