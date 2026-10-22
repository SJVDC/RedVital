import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { NoEncontrado } from '@/shared/paginas/NoEncontrado'
import type { RolId } from '@/shared/tipos'
import { useSesion } from './SesionContexto'

/**
 * Sin sesión, lleva a iniciar sesión y recuerda a dónde se quería ir. Con
 * sesión de otro perfil, la ruta no existe para él: la interfaz no insinúa
 * que hay algo que no le corresponde (TR-03, RNF-02).
 */
export function RutaProtegida({ roles, children }: { roles: RolId[]; children: ReactNode }) {
  const { estado, usuario, salidaVoluntaria } = useSesion()
  const ubicacion = useLocation()

  if (estado === 'anonima' || !usuario) {
    if (salidaVoluntaria) return <Navigate to="/" replace />
    return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />
  }
  if (!roles.includes(usuario.rol)) return <NoEncontrado />
  return <>{children}</>
}
