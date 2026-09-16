import type { Metadata } from "next";
import { SaleClient } from "./SaleClient";

export const metadata: Metadata = {
  title: "On Sale",
  description:
    "Prendas de fiesta en venta definitiva en Môone, Montevideo: vestidos, monos, sandalias y más a precio de liquidación.",
  alternates: { canonical: "/sale" },
};

export default function SalePage() {
  return <SaleClient />;
}
