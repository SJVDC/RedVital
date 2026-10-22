import { nuevoId } from '@/shared/utilidades/ids'
import { ErrorApi, type Problema } from '../errores'
import { gestorSesion } from '../gestorSesion'

/**
 * Cliente HTTP hacia el gateway (APISIX).
 *
 *  - Toda ruta se resuelve contra `base` (por defecto `/api`), que el gateway
 *    reescribe a `/v1/...` antes de reenviar (T-305.1).
 *  - Cada peticion lleva `X-Correlacion-Id`; el gateway lo respeta y lo
 *    propaga, y aparece en los errores para poder rastrearlos (T-305.5).
 *  - Las operaciones marcadas `idempotente` llevan `Idempotency-Key`. La
 *    clave se fija antes del primer intento, de modo que el reintento tras
 *    renovar la sesion es la misma operacion y no una segunda.
 *  - La cookie de renovacion es HttpOnly: el navegador la envia sola a
 *    /api/v1/sesiones porque la peticion es del mismo origen.
 */

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface OpcionesSolicitud {
  cuerpo?: unknown
  consulta?: Record<string, string | undefined>
  idempotente?: boolean
  /** Operacion de sesion: no lleva token ni se reintenta tras renovar. */
  sinSesion?: boolean
}

export interface ClienteHttp {
  solicitar<T>(metodo: Metodo, ruta: string, opciones?: OpcionesSolicitud): Promise<T>
}

export function crearClienteHttp(base: string): ClienteHttp {
  async function enviar<T>(
    metodo: Metodo,
    ruta: string,
    opciones: OpcionesSolicitud,
    token: string | null,
    claveIdempotencia: string | null,
  ): Promise<T> {
    const url = new URL(base + ruta, window.location.origin)
    for (const [clave, valor] of Object.entries(opciones.consulta ?? {})) {
      if (valor !== undefined && valor !== '') url.searchParams.set(clave, valor)
    }

    const cabeceras: Record<string, string> = {
      Accept: 'application/json, application/problem+json',
      'X-Correlacion-Id': nuevoId(),
    }
    if (opciones.cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
    if (token) cabeceras.Authorization = `Bearer ${token}`
    if (claveIdempotencia) cabeceras['Idempotency-Key'] = claveIdempotencia

    let respuesta: Response
    try {
      respuesta = await fetch(url, {
        method: metodo,
        headers: cabeceras,
        body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
        credentials: 'same-origin',
      })
    } catch {
      throw ErrorApi.sinConexion()
    }

    const correlacion = respuesta.headers.get('X-Correlacion-Id')
    const texto = respuesta.status === 204 ? '' : await respuesta.text()
    const datos = texto ? leerJson(texto) : undefined

    if (!respuesta.ok) {
      throw ErrorApi.desdeProblema(
        (datos ?? {}) as Partial<Problema>,
        respuesta.status,
        correlacion,
      )
    }
    return datos as T
  }

  return {
    solicitar<T>(metodo: Metodo, ruta: string, opciones: OpcionesSolicitud = {}) {
      const clave = opciones.idempotente ? nuevoId() : null
      if (opciones.sinSesion) return enviar<T>(metodo, ruta, opciones, null, clave)
      return gestorSesion.conSesion((token) => enviar<T>(metodo, ruta, opciones, token, clave))
    },
  }
}

function leerJson(texto: string): unknown {
  try {
    return JSON.parse(texto)
  } catch {
    return undefined
  }
}
