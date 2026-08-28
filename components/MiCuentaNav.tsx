"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

const TABS = [
  { href: "/mi-cuenta/historial", label: "Historial" },
  { href: "/mi-cuenta/carrito", label: "Carrito" },
];

export function MiCuentaNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { client, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/mi-cuenta/login");
  }

  return (
    <div className="border-b border-arena">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-8">
        <nav className="flex gap-6">
          {TABS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 items-center border-b-2 text-sm font-medium uppercase tracking-wider transition-colors ${
                pathname === href
                  ? "border-negro text-negro"
                  : "border-transparent text-taupe hover:text-chocolate"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 py-2">
          {client && <span className="text-sm text-taupe">Hola, {client.nombre}</span>}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 items-center text-xs uppercase tracking-wider text-chocolate hover:text-negro"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
