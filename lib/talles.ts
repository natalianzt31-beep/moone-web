const ORDEN_TALLES_LETRA = ["XS", "S", "M", "L", "XL", "XXL"];

/** Ordena talles numéricos (calzado) o de letra (XS-XXL) correctamente. */
export function compararTalles(a: string | null, b: string | null) {
  const talleA = a ?? "";
  const talleB = b ?? "";

  const numA = Number(talleA);
  const numB = Number(talleB);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return numA - numB;
  }

  const idxA = ORDEN_TALLES_LETRA.indexOf(talleA.toUpperCase());
  const idxB = ORDEN_TALLES_LETRA.indexOf(talleB.toUpperCase());
  if (idxA !== -1 && idxB !== -1) {
    return idxA - idxB;
  }

  return talleA.localeCompare(talleB);
}
