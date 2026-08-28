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

export type Client = {
  id: string;
  auth_user_id: string | null;
  nombre: string;
  celular: string;
  email: string | null;
  documento: string | null;
  consiente_promos: boolean;
  notas: string | null;
  created_at: string;
};

export type EstadoReserva =
  | "reservado"
  | "confirmado_retiro"
  | "retirado"
  | "devuelto"
  | "vencido"
  | "cancelado";

export type Reservation = {
  id: string;
  product_id: string;
  client_id: string;
  fecha_retiro: string;
  fecha_devolucion: string;
  estado: EstadoReserva;
  precio_total: number;
  senia: number;
  deposito_garantia: number | null;
  contrato_aceptado: boolean;
  created_at: string;
  products: Product | null;
};

export type Cart = {
  id: string;
  client_id: string;
  created_at: string;
};

export type TipoCarrito = "alquiler" | "venta";

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  tipo: TipoCarrito;
  created_at: string;
  products: Product | null;
};
