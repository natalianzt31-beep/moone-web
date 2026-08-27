import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/site-config";

export function Nav() {
  return (
    <header className="border-b border-arena bg-blanco">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Môone Rental Boutique" className="h-12 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.15em] text-negro">
          <Link href="/" className="transition-colors hover:text-chocolate">
            Home
          </Link>
          <Link href="/coleccion" className="transition-colors hover:text-chocolate">
            Colección
          </Link>
          <Link href="/nosotras" className="transition-colors hover:text-chocolate">
            Nosotras
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="text-chocolate transition-colors hover:text-negro"
          >
            <WhatsAppIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
