/**
 * Token de acceso en memoria.
 *
 * Nunca se guarda en localStorage ni en sessionStorage: un script inyectado
 * podria leerlo de ahi. Vive solo en esta variable del modulo y se pierde al
 * recargar la pagina, y para eso existe la cookie de renovacion, que es
 * HttpOnly y que el navegador envia sola a /api/v1/sesiones (ADR-008).
 *
 * La firma del token no se verifica aqui: lo hacen el gateway y cada
 * servicio. La interfaz solo lee las reivindicaciones para saber el rol y
 * cuando renovar.
 */

export interface Reivindicaciones {
  sub: string
  role: string
  jurisdiction: string
  exp: number
  iat?: number
}

let actual: { valor: string; reivindicaciones: Reivindicaciones } | null = null

export const almacenToken = {
  obtener(): string | null {
    return actual?.valor ?? null
  },
  reivindicaciones(): Reivindicaciones | null {
    return actual?.reivindicaciones ?? null
  },
  establecer(valor: string) {
    actual = { valor, reivindicaciones: decodificarToken(valor) }
  },
  limpiar() {
    actual = null
  },
}

export function decodificarToken(token: string): Reivindicaciones {
  const carga = token.split('.')[1]
  if (!carga) throw new Error('Token con formato inválido.')
  const base64 = carga.replace(/-/g, '+').replace(/_/g, '/')
  const relleno = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binario = atob(relleno)
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0))
  const datos = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
  return {
    sub: String(datos.sub ?? ''),
    role: String(datos.role ?? ''),
    jurisdiction: String(datos.jurisdiction ?? ''),
    exp: Number(datos.exp ?? 0),
    iat: datos.iat === undefined ? undefined : Number(datos.iat),
  }
}

/** Segundos que le quedan al token vigente. Negativo si ya vencio. */
export function segundosRestantes(): number | null {
  const r = actual?.reivindicaciones
  if (!r) return null
  return r.exp - Math.floor(Date.now() / 1000)
}
