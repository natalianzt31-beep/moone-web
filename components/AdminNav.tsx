"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ADMIN_MODULES, puedeAcceder } from "@/lib/adminAccess";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, staffRol, signOut } = useAuth();

  const tabs = ADMIN_MODULES.filter((modulo) => puedeAcceder(modulo.roles, staffRol));

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  return (
    <header className="border-b border-arena bg-blanco">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href="/admin"
            className="text-sm font-medium uppercase tracking-[0.15em] text-negro"
          >
            Môone Admin
          </Link>
          <nav className="flex flex-wrap gap-6">
            {tabs.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex min-h-11 items-center border-b-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                  pathname === href
                    ? "border-negro text-negro"
                    : "border-transparent text-taupe hover:text-chocolate"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user?.email && <span className="hidden text-xs text-taupe sm:inline">{user.email}</span>}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 items-center text-xs uppercase tracking-wider text-chocolate hover:text-negro"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
