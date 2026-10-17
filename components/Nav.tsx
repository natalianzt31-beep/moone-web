"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useAuth } from "@/lib/auth/AuthProvider";
import { WHATSAPP_URL } from "@/lib/site-config";
import { turnosEnabled } from "@/lib/features";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/coleccion", label: "Colección" },
  { href: "/nosotras", label: "Nosotras" },
  { href: "/sale", label: "On Sale" },
  ...(turnosEnabled ? [{ href: "/turnos", label: "Modista" }] : []),
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [skuQuery, setSkuQuery] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const miCuentaHref = user ? "/mi-cuenta/historial" : "/mi-cuenta/login";
  const allLinks = [...LINKS, { href: miCuentaHref, label: "Mi Cuenta" }];

  function buscarPorSku(e: FormEvent) {
    e.preventDefault();
    const raw = skuQuery.trim();
    if (!raw) return;
    const sku = /^\d+$/.test(raw) ? `VES-${raw.padStart(5, "0")}` : raw.toUpperCase();
    setOpen(false);
    router.push(`/p/${encodeURIComponent(sku)}`);
  }

  return (
    <header className="border-b border-arena bg-blanco">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="Môone Rental Boutique"
            width={945}
            height={401}
            className="h-10 w-auto sm:h-12"
            preload
          />
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.15em] text-negro lg:flex">
          {allLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="transition-colors hover:text-chocolate">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 lg:gap-2">
          <form onSubmit={buscarPorSku} className="hidden items-center lg:flex">
            <input
              type="text"
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              placeholder="Buscar por SKU"
              aria-label="Buscar por SKU"
              className="h-11 w-36 rounded-[3px] border border-arena bg-blanco px-3 text-xs text-negro placeholder:text-taupe focus:border-negro focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex h-11 w-11 items-center justify-center text-chocolate transition-colors hover:text-negro"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm9-1-5.2-5.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </form>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="flex h-11 w-11 items-center justify-center text-chocolate transition-colors hover:text-negro"
          >
            <WhatsAppIcon />
          </a>

          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center text-negro lg:hidden"
          >
            {open ? (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M5 5l14 14M19 5L5 19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-arena bg-blanco lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-8">
            <form onSubmit={buscarPorSku} className="flex items-center gap-2 border-b border-arena py-3">
              <input
                type="text"
                value={skuQuery}
                onChange={(e) => setSkuQuery(e.target.value)}
                placeholder="Buscar por SKU"
                aria-label="Buscar por SKU"
                className="h-11 flex-1 rounded-[3px] border border-arena bg-blanco px-3 text-sm text-negro placeholder:text-taupe focus:border-negro focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="flex h-11 w-11 items-center justify-center text-chocolate transition-colors hover:text-negro"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm9-1-5.2-5.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </button>
            </form>
            {allLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center border-b border-arena py-3 text-sm font-medium uppercase tracking-[0.15em] text-negro last:border-b-0"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
