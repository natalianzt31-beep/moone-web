import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/site-config";

export function Nav() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Môone
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Home
          </Link>
          <Link href="/coleccion" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Colección
          </Link>
          <Link href="/nosotras" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Nosotras
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="text-[#25D366] hover:opacity-80"
          >
            <WhatsAppIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
