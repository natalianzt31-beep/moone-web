"use client";

import { useState } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/site-config";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/coleccion", label: "Colección" },
  { href: "/nosotras", label: "Nosotras" },
  { href: "/sale", label: "On Sale" },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-arena bg-blanco">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Môone Rental Boutique"
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.15em] text-negro lg:flex">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="transition-colors hover:text-chocolate">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 lg:gap-2">
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
            {LINKS.map(({ href, label }) => (
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
