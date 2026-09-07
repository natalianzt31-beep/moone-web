"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

export default function AdminRecuperarPage() {
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
        redirectTo: `${window.location.origin}/admin/nueva-contrasena`,
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-marfil px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-chocolate">
          Ingresá tu email y te mandamos un link para elegir una contraseña nueva.
        </p>

        {enviado ? (
          <p className="mt-8 text-sm text-chocolate">
            Si ese email tiene una cuenta de staff en Môone, te llegó un mail con el link
            para restablecer tu contraseña.
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
          <Link href="/admin/login" className="text-negro hover:text-chocolate">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
