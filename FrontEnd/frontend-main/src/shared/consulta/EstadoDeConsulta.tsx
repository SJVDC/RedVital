import type { ReactNode } from 'react'
import type { ErrorApi } from '@/api/errores'
import { Denegacion } from '@/shared/paginas/Denegacion'
import { Boton, EstadoVacio } from '@/shared/ui/Primitivos'
import { CargandoRedVital } from '@/shared/ui/Cargando'
import { IconoAlerta, IconoBuscar, IconoRecargar } from '@/shared/ui/Iconos'
import type { Consulta } from './useConsulta'

/**
 * Pinta una consulta: la carga, el error con su significado (no encontrado,
 * fuera de jurisdicción, sin conexión, servicio caído) o los datos.
 */
export function EstadoDeConsulta<T>({
  consulta,
  children,
  cargando,
  noEncontrado = 'No encontramos lo que buscas, o no está dentro de tu alcance.',
}: {
  consulta: Consulta<T>
  children: (datos: T) => ReactNode
  cargando?: ReactNode
  noEncontrado?: string
}) {
  if (consulta.estado === 'error') {
    return <ErrorDeServicio error={consulta.error} onReintentar={consulta.recargar} noEncontrado={noEncontrado} />
  }
  if (consulta.datos === undefined) {
    return <>{cargando ?? <CargandoRedVital />}</>
  }
  return <>{children(consulta.datos)}</>
}

export function ErrorDeServicio({
  error,
  onReintentar,
  noEncontrado = 'No encontramos lo que buscas, o no está dentro de tu alcance.',
}: {
  error: ErrorApi
  onReintentar?: () => void
  noEncontrado?: string
}) {
  if (error.tipo === 'fuera-de-jurisdiccion') return <Denegacion />
  if (error.estado === 404) {
    return (
      <EstadoVacio titulo="No encontrado" icono={<IconoBuscar />}>
        {noEncontrado}
      </EstadoVacio>
    )
  }
  if (error.estado === 401) {
    return (
      <EstadoVacio titulo="Tu sesión terminó" icono={<IconoAlerta />}>
        Inicia sesión de nuevo para continuar.
      </EstadoVacio>
    )
  }
  if (error.estado === 403) {
    return (
      <EstadoVacio titulo="Esta acción no está disponible para tu perfil" icono={<IconoAlerta />}>
        Si crees que deberías tener acceso, comunícate con el administrador de tu institución.
      </EstadoVacio>
    )
  }
  const sinConexion = error.estado === 0
  return (
    <EstadoVacio
      titulo={sinConexion ? 'Sin conexión' : 'El servicio no respondió'}
      icono={<IconoAlerta />}
      accion={
        onReintentar && (
          <Boton variante="secundario" icono={<IconoRecargar />} onClick={onReintentar}>
            Reintentar
          </Boton>
        )
      }
    >
      {sinConexion
        ? 'No pudimos comunicarnos con RedVital. Revisa tu conexión e inténtalo de nuevo.'
        : 'Ocurrió un problema al consultar la información. Inténtalo de nuevo en unos momentos.'}
      {error.correlacionId && (
        <span className="mt-2 block text-xs text-texto-tenue">Referencia: {error.correlacionId}</span>
      )}
    </EstadoVacio>
  )
}
