/**
 * Errores de la capa de servicios.
 *
 * Los servicios y el gateway responden los fallos como problema RFC 9457 con
 * los nombres del catalogo de errores del incremento de operaciones:
 * `{ tipo, titulo, estado, detalle, correlacion_id }`. Toda falla, de red o
 * de un servicio, llega a las pantallas como `ErrorApi`, de modo que una
 * pantalla nunca tiene que saber de donde vino.
 */

export interface Problema {
  tipo: string
  titulo: string
  estado: number
  detalle: string
  correlacion_id?: string
}

export class ErrorApi extends Error {
  readonly estado: number
  readonly tipo: string
  readonly titulo: string
  readonly detalle: string
  readonly correlacionId: string | null

  constructor(p: {
    estado: number
    tipo: string
    titulo: string
    detalle: string
    correlacionId?: string | null
  }) {
    super(p.detalle)
    this.name = 'ErrorApi'
    this.estado = p.estado
    this.tipo = p.tipo
    this.titulo = p.titulo
    this.detalle = p.detalle
    this.correlacionId = p.correlacionId ?? null
  }

  static desdeProblema(p: Partial<Problema>, estado: number, correlacion: string | null) {
    return new ErrorApi({
      estado: p.estado ?? estado,
      tipo: p.tipo ?? `http-${estado}`,
      titulo: p.titulo ?? 'Error',
      detalle: p.detalle ?? 'El servicio respondió con un error.',
      correlacionId: p.correlacion_id ?? correlacion,
    })
  }

  static sinConexion() {
    return new ErrorApi({
      estado: 0,
      tipo: 'sin-conexion',
      titulo: 'Sin conexión',
      detalle: 'No pudimos comunicarnos con RedVital. Revisa tu conexión e inténtalo de nuevo.',
    })
  }

  get esSesionInvalida() {
    return this.estado === 401
  }

  get esDenegacion() {
    return this.estado === 403
  }

  get esNoEncontrado() {
    return this.estado === 404
  }
}

export function comoErrorApi(e: unknown): ErrorApi {
  if (e instanceof ErrorApi) return e
  return new ErrorApi({
    estado: 0,
    tipo: 'error-inesperado',
    titulo: 'Error inesperado',
    detalle: e instanceof Error ? e.message : 'Ocurrió un error inesperado.',
  })
}

/** Atajos para construir los errores del catalogo. */
export const Problemas = {
  sesionInvalida: (detalle = 'La sesión no es válida o ya expiró.') =>
    new ErrorApi({ estado: 401, tipo: 'sesion-invalida', titulo: 'Sesión inválida', detalle }),
  noPermitida: () =>
    new ErrorApi({
      estado: 403,
      tipo: 'operacion-no-permitida',
      titulo: 'Operación no permitida',
      detalle: 'El rol no autoriza esta operación.',
    }),
  noEncontrado: (detalle = 'El recurso no existe o no está dentro de tu alcance.') =>
    new ErrorApi({ estado: 404, tipo: 'no-encontrado', titulo: 'No encontrado', detalle }),
  conflicto: (detalle: string) =>
    new ErrorApi({ estado: 409, tipo: 'conflicto', titulo: 'Conflicto', detalle }),
  reglaNegocio: (detalle: string, tipo = 'regla-negocio') =>
    new ErrorApi({ estado: 422, tipo, titulo: 'No es posible completar la operación', detalle }),
  validacion: (detalle: string) =>
    new ErrorApi({ estado: 400, tipo: 'validacion', titulo: 'Datos inválidos', detalle }),
}
