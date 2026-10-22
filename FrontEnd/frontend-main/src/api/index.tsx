import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { CONFIG } from './config'
import type { Api } from './contratos'
import { gestorSesion } from './gestorSesion'
import { crearCampaniasHttp } from './http/campanias'
import { crearClienteHttp } from './http/cliente'
import { crearDonantesHttp } from './http/donantes'
import { crearIdentidadHttp } from './http/identidad'
import { crearInventarioHttp } from './http/inventario'
import { crearTrazabilidadHttp } from './http/trazabilidad'

/**
 * Punto unico de acceso a los servicios. Todas las peticiones van al gateway
 * por el mismo origen; nunca a un servicio directamente (DD, seccion 15).
 */
export function crearApi(): Api {
  const cliente = crearClienteHttp(CONFIG.baseApi)
  const identidad = crearIdentidadHttp(cliente)
  gestorSesion.configurarRenovador(() => identidad.renovarSesion())
  return {
    identidad,
    donantes: crearDonantesHttp(cliente),
    campanias: crearCampaniasHttp(cliente),
    trazabilidad: crearTrazabilidadHttp(cliente),
    inventario: crearInventarioHttp(cliente),
  }
}

const ContextoApi = createContext<Api | null>(null)

export function ProveedorApi({ api, children }: { api: Api; children: ReactNode }) {
  return <ContextoApi.Provider value={api}>{children}</ContextoApi.Provider>
}

export function useApi(): Api {
  const api = useContext(ContextoApi)
  if (!api) throw new Error('useApi debe usarse dentro de <ProveedorApi>')
  return api
}
