import { redirect } from "next/navigation";

// Carteras pasó a ser una subcategoría de Accesorios — este link viejo
// (compartido, indexado, etc.) sigue funcionando.
export default function CarterasLegacyRedirect() {
  redirect("/coleccion/accesorios/carteras");
}
