import { addDays } from "@/lib/disponibilidad";
import { AGENDA_MODISTA } from "@/lib/site-config";

export type SlotDia = { fecha: string; etiqueta: string; horarios: string[] };

function horariosDelDia(horaInicio: string, horaFin: string, duracionMinutos: number): string[] {
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

/** Día configurado para esa fecha (según su día de semana), o null si ese día no atiende. */
function diaConfiguradoPara(fecha: string): (typeof AGENDA_MODISTA.diasDisponibles)[number] | null {
  const diaSemana = new Date(`${fecha}T00:00:00`).getDay();
  return AGENDA_MODISTA.diasDisponibles.find((d) => d.diaSemana === diaSemana) ?? null;
}

export function horariosPosiblesPara(fecha: string): string[] {
  const dia = diaConfiguradoPara(fecha);
  if (!dia) return [];
  return horariosDelDia(dia.horaInicio, dia.horaFin, AGENDA_MODISTA.duracionMinutos);
}

/** Etiqueta del día ("Viernes"/"Sábado") para esa fecha, o null si ese día no atiende. */
export function etiquetaDiaPara(fecha: string): string | null {
  return diaConfiguradoPara(fecha)?.etiqueta ?? null;
}

/** true si fecha+hora corresponde a un horario real de la agenda — defensa en profundidad del POST. */
export function esHorarioValido(fecha: string, hora: string): boolean {
  return horariosPosiblesPara(fecha).includes(hora);
}

/**
 * Arma la agenda de los próximos AGENDA_MODISTA.semanasVisibles, con los
 * horarios libres de cada día (sin los ya ocupados, los de días cerrados,
 * y sin los que ya pasaron si el día es hoy).
 */
export function generarAgendaDisponible(params: {
  /** Fecha de hoy en Montevideo, "YYYY-MM-DD". */
  hoy: string;
  /** Hora actual en Montevideo, "HH:MM". */
  horaActual: string;
  closedDates: ReadonlySet<string>;
  /** Horarios ya reservados, como "fecha|hora". */
  ocupados: ReadonlySet<string>;
}): SlotDia[] {
  const { hoy, horaActual, closedDates, ocupados } = params;
  const totalDias = AGENDA_MODISTA.semanasVisibles * 7;
  const dias: SlotDia[] = [];

  for (let i = 0; i < totalDias; i++) {
    const fecha = addDays(hoy, i);
    if (closedDates.has(fecha)) continue;

    const dia = diaConfiguradoPara(fecha);
    if (!dia) continue;

    let horarios = horariosDelDia(dia.horaInicio, dia.horaFin, AGENDA_MODISTA.duracionMinutos);
    if (fecha === hoy) {
      horarios = horarios.filter((h) => h > horaActual);
    }
    horarios = horarios.filter((h) => !ocupados.has(`${fecha}|${h}`));

    if (horarios.length > 0) {
      dias.push({ fecha, etiqueta: dia.etiqueta, horarios });
    }
  }

  return dias;
}
