export type Categoria = "vestido" | "mono" | "sandalias" | "cartera" | "tapado";

export type EstadoProducto =
  | "disponible"
  | "reservado"
  | "alquilado"
  | "en_reparacion"
  | "baja_definitiva";

export type Product = {
  id: string;
  sku: string;
  nombre: string;
  categoria: Categoria;
  talle: string | null;
  color: string | null;
  precio_alquiler: number;
  valor_reposicion: number | null;
  estado: EstadoProducto;
  foto_url: string | null;
  en_venta: boolean;
  precio_venta: number | null;
  created_at: string;
};
