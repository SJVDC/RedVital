import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useApi } from '@/api'
import { gestorSesion } from '@/api/gestorSesion'
import { almacenToken, segundosRestantes } from '@/api/token'
import { ROLES } from '@/shared/datos/roles'
import type { Rol, UsuarioSesion } from '@/shared/tipos'

/**
 * Sesión del usuario (RF-23 y RF-24, ADR-008).
 *
 *  - Al cargar la página intenta renovar en silencio con la cookie de
 *    renovación: si la sesión de ocho horas sigue vigente, el usuario no
 *    vuelve a escribir su contraseña.
 *  - Renueva el token de quince minutos un minuto antes de que venza.
 *  - Si la renovación se rechaza, la sesión terminó: se marca `expirada` sin
 *    borrar al usuario, para que la pantalla en curso siga montada detrás del
 *    diálogo y no se pierda el trabajo (TR-05).
 */

type Estado = 'iniciando' | 'anonima' | 'activa'

interface Sesion {
  estado: Estado
  usuario: UsuarioSesion | null
  /** Perfil vigente: U1 cuando no hay sesión. */
  rol: Rol
  expirada: boolean
  /** La sesión terminó porque la persona la cerró: se vuelve a la portada, no al inicio de sesión. */
  salidaVoluntaria: boolean
  iniciarSesion: (correo: string, credencial: string) => Promise<UsuarioSesion>
  cerrarSesion: () => Promise<void>
  /** Abandona una sesión expirada sin volver a entrar. */
  descartar: () => void
}

const Contexto = createContext<Sesion | null>(null)

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const api = useApi()
  const [estado, setEstado] = useState<Estado>('iniciando')
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [expirada, setExpirada] = useState(false)
  const [salidaVoluntaria, setSalidaVoluntaria] = useState(false)
  const [versionToken, setVersionToken] = useState(0)

  // Restauración silenciosa al cargar la página.
  useEffect(() => {
    let vigente = true
    gestorSesion
      .renovar()
      .then(async (renovada) => {
        if (!renovada) return null
        return api.identidad.obtenerUsuarioActual()
      })
      .catch(() => null)
      .then((u) => {
        if (!vigente) return
        setUsuario(u)
        setEstado(u ? 'activa' : 'anonima')
      })
    return () => {
      vigente = false
    }
  }, [api])

  // Eventos del gestor: renovación (reprograma el temporizador) o expiración.
  useEffect(
    () =>
      gestorSesion.suscribir((evento) => {
        if (evento === 'expirada') setExpirada(true)
        else setVersionToken((v) => v + 1)
      }),
    [],
  )

  // Renovación proactiva un minuto antes de que venza el token de acceso.
  useEffect(() => {
    if (estado !== 'activa' || expirada) return
    const restantes = segundosRestantes()
    if (restantes === null) return
    const espera = Math.max((restantes - 60) * 1000, 5_000)
    const temporizador = window.setTimeout(() => void gestorSesion.renovar(), espera)
    return () => window.clearTimeout(temporizador)
  }, [estado, expirada, versionToken])

  const iniciarSesion = useCallback(
    async (correo: string, credencial: string) => {
      const emitido = await api.identidad.iniciarSesion(correo, credencial)
      almacenToken.establecer(emitido.tokenAcceso)
      try {
        const actual = await api.identidad.obtenerUsuarioActual()
        setUsuario(actual)
        setEstado('activa')
        setExpirada(false)
        setSalidaVoluntaria(false)
        setVersionToken((v) => v + 1)
        return actual
      } catch (e) {
        almacenToken.limpiar()
        throw e
      }
    },
    [api],
  )

  const cerrarSesion = useCallback(async () => {
    try {
      if (almacenToken.obtener()) await api.identidad.cerrarSesion()
    } catch {
      // Cerrar una sesión que ya no existe no es un error para quien sale.
    } finally {
      almacenToken.limpiar()
      setSalidaVoluntaria(true)
      setUsuario(null)
      setEstado('anonima')
      setExpirada(false)
    }
  }, [api])

  const descartar = useCallback(() => {
    almacenToken.limpiar()
    setUsuario(null)
    setEstado('anonima')
    setExpirada(false)
  }, [])

  const valor = useMemo<Sesion>(
    () => ({
      estado,
      usuario,
      rol: ROLES[usuario?.rol ?? 'U1'],
      expirada,
      salidaVoluntaria,
      iniciarSesion,
      cerrarSesion,
      descartar,
    }),
    [estado, usuario, expirada, salidaVoluntaria, iniciarSesion, cerrarSesion, descartar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSesion(): Sesion {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>')
  return valor
}
