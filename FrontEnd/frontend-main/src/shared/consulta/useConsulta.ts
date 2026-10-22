import { useCallback, useEffect, useRef, useState } from 'react'
import type { DependencyList } from 'react'
import { useApi } from '@/api'
import type { Api } from '@/api/contratos'
import { comoErrorApi, type ErrorApi } from '@/api/errores'

/**
 * Lectura de datos con sus tres estados reales: cargando, listo o error. Las
 * pantallas nunca muestran datos inventados: si el servicio no responde, lo
 * dicen.
 */
export type EstadoConsulta<T> =
  | { estado: 'cargando'; datos: T | undefined; error: null }
  | { estado: 'listo'; datos: T; error: null }
  | { estado: 'error'; datos: T | undefined; error: ErrorApi }

export type Consulta<T> = EstadoConsulta<T> & {
  recargar: () => void
  /** Reemplaza los datos tras una accion, sin volver a pedirlos. */
  establecer: (datos: T) => void
}

export function useConsulta<T>(cargar: (api: Api) => Promise<T>, dependencias: DependencyList): Consulta<T> {
  const api = useApi()
  const [estado, setEstado] = useState<EstadoConsulta<T>>({ estado: 'cargando', datos: undefined, error: null })
  const [version, setVersion] = useState(0)
  const turno = useRef(0)

  useEffect(() => {
    const propio = ++turno.current
    setEstado((previo) => ({ estado: 'cargando', datos: previo.datos, error: null }))
    cargar(api).then(
      (datos) => {
        if (turno.current === propio) setEstado({ estado: 'listo', datos, error: null })
      },
      (e: unknown) => {
        if (turno.current === propio) setEstado((previo) => ({ estado: 'error', datos: previo.datos, error: comoErrorApi(e) }))
      },
    )
    // `cargar` cambia en cada render; las dependencias reales las declara quien llama.
  }, [api, version, ...dependencias])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const establecer = useCallback((datos: T) => setEstado({ estado: 'listo', datos, error: null }), [])
  return { ...estado, recargar, establecer }
}

/**
 * Accion que escribe (registrar, confirmar, atender). Expone si esta en curso
 * y el ultimo error, para deshabilitar el boton y explicar el fallo.
 */
export function useAccion<A extends unknown[], R>(accion: (api: Api, ...args: A) => Promise<R>) {
  const api = useApi()
  const [enCurso, setEnCurso] = useState(false)
  const [error, setError] = useState<ErrorApi | null>(null)
  // La accion suele cerrar sobre el estado del formulario: se ejecuta siempre
  // la del ultimo render, no la del primero.
  const vigente = useRef(accion)
  vigente.current = accion

  const ejecutar = useCallback(
    async (...args: A): Promise<R | undefined> => {
      setEnCurso(true)
      setError(null)
      try {
        return await vigente.current(api, ...args)
      } catch (e) {
        setError(comoErrorApi(e))
        return undefined
      } finally {
        setEnCurso(false)
      }
    },
    [api],
  )
  const limpiarError = useCallback(() => setError(null), [])

  return { ejecutar, enCurso, error, limpiarError }
}
