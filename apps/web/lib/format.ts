/** Formateo de presentación (la capa de UI es la única que formatea importes/fechas). */

/** Centavos → string de moneda. Default MXN. */
export function formatMoney(cents: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(cents / 100);
}

/** Fecha ISO (date) → "28 jun 2026". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}
