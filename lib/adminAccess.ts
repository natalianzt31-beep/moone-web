import type { StaffRol } from "@/lib/supabase/types";

/**
 * Qué puede ver cada rol del staff en el backoffice. "null" en `roles` de un
 * módulo significa que lo ve cualquier rol logueado (p.ej. Inicio). Una
 * cuenta sin rol asignado en staff_users (staffRol === null, caso legacy)
 * nunca queda bloqueada por esto — solo restringe a roles ya definidos.
 */
export const ROLES_ADMIN_CAJA: StaffRol[] = ["admin", "caja"];
export const ROLES_TODOS_LOS_ROLES: StaffRol[] = ["admin", "caja", "modista"];
export const ROLES_SOLO_ADMIN: StaffRol[] = ["admin"];

export type AdminModule = {
  href: string;
  label: string;
  roles: StaffRol[] | null;
};

export const ADMIN_MODULES: AdminModule[] = [
  { href: "/admin", label: "Inicio", roles: null },
  { href: "/admin/stock", label: "Stock", roles: ROLES_ADMIN_CAJA },
  { href: "/admin/clientas", label: "Clientas", roles: ROLES_ADMIN_CAJA },
  { href: "/admin/reportes", label: "Reportes", roles: ROLES_ADMIN_CAJA },
  { href: "/admin/reservas", label: "Reservas", roles: ROLES_ADMIN_CAJA },
  { href: "/admin/pedidos-medida", label: "A medida", roles: ROLES_TODOS_LOS_ROLES },
  { href: "/admin/arreglos", label: "Arreglos", roles: ROLES_TODOS_LOS_ROLES },
  { href: "/admin/egresadas", label: "Egresadas", roles: ROLES_ADMIN_CAJA },
  { href: "/admin/pronovias", label: "Pronovias", roles: ROLES_ADMIN_CAJA },
  { href: "/admin/turnos", label: "Turnos", roles: ROLES_TODOS_LOS_ROLES },
  { href: "/admin/analitica", label: "Analítica", roles: ROLES_SOLO_ADMIN },
  { href: "/admin/feriados", label: "Feriados", roles: ROLES_SOLO_ADMIN },
];

export function puedeAcceder(roles: StaffRol[] | null, staffRol: StaffRol | null): boolean {
  if (!roles) return true;
  if (staffRol === null) return true;
  return roles.includes(staffRol);
}
