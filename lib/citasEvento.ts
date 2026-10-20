import { EVENTO_CECILIA_MENDEZ } from "@/lib/site-config";

/** Todos los horarios posibles del evento (fijo, un solo día). */
export function horariosEventoPosibles(): string[] {
  const { horaInicio, horaFin, duracionMinutos } = EVENTO_CECILIA_MENDEZ;
  const [hInicio, mInicio] = horaInicio.split(":").map(Number);
  const [hFin, mFin] = horaFin.split(":").map(Number);
  const minutosFin = hFin * 60 + mFin;

  const horarios: string[] = [];
  let minutos = hInicio * 60 + mInicio;
  while (minutos + duracionMinutos <= minutosFin) {
    const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
    const mm = String(minutos % 60).padStart(2, "0");
    horarios.push(`${hh}:${mm}`);
    minutos += duracionMinutos;
  }
  return horarios;
}

/** true si la hora corresponde a un horario real del evento — defensa en profundidad del POST. */
export function esHorarioEventoValido(hora: string): boolean {
  return horariosEventoPosibles().includes(hora);
}
