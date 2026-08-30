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

export default function RegistroPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(false);

  useEffect(() => {
    if (!loading && user && !confirmacionPendiente) {
      router.replace("/mi-cuenta/historial");
    }
  }, [loading, user, confirmacionPendiente, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: { data: { nombre, celular } },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        router.replace("/mi-cuenta/historial");
      } else {
        setConfirmacionPendiente(true);
      }
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
            Creá tu cuenta
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Registrate para reservar y guardar prendas en tu carrito.
          </p>

          {confirmacionPendiente ? (
            <div className="mt-8 rounded-[3px] bg-crema p-4 text-sm text-chocolate">
              Te enviamos un email para confirmar tu cuenta. Una vez que la
              confirmes, iniciá sesión desde{" "}
              <Link href="/mi-cuenta/login" className="text-negro hover:text-chocolate">
                Iniciar sesión
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="mt-8">
                <ContinuarConGoogle />
              </div>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-negro">
                Nombre
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-negro">
                Celular
                <input
                  type="tel"
                  required
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="093 787 376"
                  className={inputClass}
                />
              </label>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-negro">
                Confirmar contraseña
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </label>

              {error && <p className="text-sm text-chocolate">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
              >
                {submitting ? "Creando cuenta..." : "Crear cuenta"}
              </button>
              </form>
            </>
          )}

          <p className="mt-6 text-sm text-taupe">
            ¿Ya tenés cuenta?{" "}
            <Link href="/mi-cuenta/login" className="text-negro hover:text-chocolate">
              Iniciá sesión
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
