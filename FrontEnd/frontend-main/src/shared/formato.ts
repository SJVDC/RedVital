/**
 * Formato de fechas y codigos para pantalla, en espanol de Colombia y en la
 * hora de Bogota. Las fechas sin hora (AAAA-MM-DD) se tratan como fechas del
 * calendario, sin conversion de zona, para que no se corran un dia.
 */

const ZONA = 'America/Bogota'

function aFecha(valor: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split('-').map(Number)
    return new Date(Date.UTC(a, m - 1, d, 12))
  }
  return new Date(valor)
}

export function fecha(valor: string | null | undefined): string {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA }).format(
    aFecha(valor),
  )
}

export function fechaCorta(valor: string | null | undefined): string {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA }).format(
    aFecha(valor),
  )
}

export function fechaHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
  }).format(aFecha(valor))
}

/** Los ocho primeros caracteres del identificador: legibles en una etiqueta o al teléfono. */
export function idCorto(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

/** «K7P3MXR29QHT» → «K7P3-MXR2-9QHT». */
export function codigoLegible(codigo: string): string {
  return (codigo.match(/.{1,4}/g) ?? [codigo]).join('-')
}

/** Fecha de hoy (AAAA-MM-DD) en Bogotá. */
export function hoy(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date())
}
