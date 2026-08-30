export function toISODate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** El local no abre los domingos. */
export function isSunday(iso: string) {
  return new Date(`${iso}T00:00:00`).getDay() === 0;
}

/** Domingo o feriado/cierre puntual cargado en closed_dates. */
export function isDiaCerrado(iso: string, closedDates: ReadonlySet<string>) {
  return isSunday(iso) || closedDates.has(iso);
}

/** Si cae en un día cerrado, la corre día a día hasta el próximo día hábil. */
export function nextBusinessDay(iso: string, closedDates: ReadonlySet<string>) {
  let cursor = iso;
  while (isDiaCerrado(cursor, closedDates)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

/** Sugerencia de devolución: ~4 días desde el retiro, ajustada a día hábil. */
export function sugerirDevolucion(fechaRetiro: string, closedDates: ReadonlySet<string>) {
  return nextBusinessDay(addDays(fechaRetiro, 4), closedDates);
}

export function getMonthMatrix(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const start = new Date(year, month, 1 - startWeekday);
  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}
