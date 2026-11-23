import "server-only";
import { absoluteUrl } from "@/lib/site";

/**
 * Bloque HTML con la foto principal de un artículo, para los avisos internos
 * a contacto@moone.com.uy. Las fotos están en /public (rutas relativas) o en
 * una URL absoluta: el mail necesita siempre la absoluta. Sin foto, no
 * agrega nada.
 */
export function fotoProductoHtml(
  producto: { fotos?: string[] | null; foto_url?: string | null; nombre?: string | null } | null,
): string {
  const foto = producto?.fotos?.[0] ?? producto?.foto_url ?? null;
  if (!foto) return "";
  const src = /^https?:\/\//.test(foto) ? foto : absoluteUrl(foto);
  const alt = (producto?.nombre ?? "Artículo").replace(/"/g, "&quot;");
  return `<img src="${src}" alt="${alt}" width="220" style="display:block; width:220px; max-width:100%; height:auto; border:1px solid #E8DFD3; border-radius:3px; margin: 0 0 16px;" />`;
}
