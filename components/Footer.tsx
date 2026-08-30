import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-arena bg-marfil">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-xs text-taupe sm:flex-row sm:justify-between sm:px-8">
        <span>&copy; {new Date().getFullYear()} Môone</span>
        <Link
          href="/privacidad"
          className="flex min-h-11 items-center transition-colors hover:text-chocolate sm:min-h-0"
        >
          Privacidad
        </Link>
      </div>
    </footer>
  );
}
