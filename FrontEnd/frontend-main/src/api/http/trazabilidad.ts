import type {
  ComponenteSanguineo,
  Donacion,
  EstadoUnidad,
  EventoUnidad,
  GrupoSanguineo,
  Pagina,
  Transicion,
  Unidad,
} from '@/shared/tipos'
import type { ServicioTrazabilidad } from '../contratos'
import type { ClienteHttp } from './cliente'

/** Adaptador de M3 en el Servicio de Donación (DD 15.4, Tabla 35). */

interface UnidadRespuesta {
  id: string
  donacion_id: string
  componente: ComponenteSanguineo
  grupo_sanguineo: GrupoSanguineo
  institucion_custodia_id: string
  estado: EstadoUnidad
  apta: boolean | null
  fecha_vencimiento: string
  volumen_ml: number | null
  fecha_captacion: string
}

interface DonacionRespuesta {
  id: string
  donante_id: string | null
  intencion_id: string | null
  institucion_id: string
  campania_id: string | null
  campania_confirmada: boolean
  fecha_captacion: string
  unidades: UnidadRespuesta[]
}

interface TransicionRespuesta {
  unidad_id: string
  estado_anterior: EstadoUnidad | null
  estado_nuevo: EstadoUnidad
  ocurrido_en: string
}

export const aUnidad = (u: UnidadRespuesta): Unidad => ({
  id: u.id,
  donacionId: u.donacion_id,
  componente: u.componente,
  grupo: u.grupo_sanguineo,
  estado: u.estado,
  apta: u.apta,
  institucionCustodiaId: u.institucion_custodia_id,
  fechaCaptacion: u.fecha_captacion,
  fechaVencimiento: u.fecha_vencimiento,
  volumenMl: u.volumen_ml,
})

const aDonacion = (d: DonacionRespuesta): Donacion => ({
  id: d.id,
  donanteId: d.donante_id,
  intencionId: d.intencion_id,
  institucionId: d.institucion_id,
  campaniaId: d.campania_id,
  campaniaConfirmada: d.campania_confirmada,
  fechaCaptacion: d.fecha_captacion,
  unidades: d.unidades.map(aUnidad),
})

const aTransicion = (t: TransicionRespuesta): Transicion => ({
  unidadId: t.unidad_id,
  estadoAnterior: t.estado_anterior,
  estadoNuevo: t.estado_nuevo,
  ocurridoEn: t.ocurrido_en,
})

export function crearTrazabilidadHttp(cliente: ClienteHttp): ServicioTrazabilidad {
  const transicion = async (metodo: 'POST' | 'DELETE', ruta: string, cuerpo?: unknown, idempotente = false) =>
    aTransicion(await cliente.solicitar<TransicionRespuesta>(metodo, ruta, { cuerpo, idempotente }))

  return {
    async registrarDonacion(d) {
      return aDonacion(
        await cliente.solicitar<DonacionRespuesta>('POST', '/v1/donaciones', {
          cuerpo: {
            donante_id: d.donanteId,
            intencion_codigo: d.intencionCodigo,
            grupo_sanguineo: d.grupo,
            campania_id: d.campaniaId,
            componentes: d.componentes.map((c) => ({ componente: c.componente, volumen_ml: c.volumenMl })),
          },
          idempotente: true,
        }),
      )
    },
    async obtenerDonacion(id) {
      return aDonacion(await cliente.solicitar<DonacionRespuesta>('GET', `/v1/donaciones/${id}`))
    },
    async confirmarFraccionamiento(id) {
      return aDonacion(
        await cliente.solicitar<DonacionRespuesta>('POST', `/v1/donaciones/${id}/fraccionamiento`, {
          idempotente: true,
        }),
      )
    },
    async listarUnidades(filtro = {}) {
      const r = await cliente.solicitar<{ elementos: UnidadRespuesta[]; total: number; pagina: number; tamano: number }>(
        'GET',
        '/v1/unidades',
        {
          consulta: {
            estado: filtro.estado,
            componente: filtro.componente,
            pagina: filtro.pagina === undefined ? undefined : String(filtro.pagina),
            tamano: filtro.tamano === undefined ? undefined : String(filtro.tamano),
          },
        },
      )
      return { ...r, elementos: r.elementos.map(aUnidad) } satisfies Pagina<Unidad>
    },
    async obtenerUnidad(id) {
      return aUnidad(await cliente.solicitar<UnidadRespuesta>('GET', `/v1/unidades/${id}`))
    },
    async listarEventosUnidad(id) {
      const r = await cliente.solicitar<
        {
          id: string
          estado_anterior: EstadoUnidad | null
          estado_nuevo: EstadoUnidad
          actor_tipo: 'usuario' | 'sistema'
          observacion: string | null
          ocurrido_en: string
        }[]
      >('GET', `/v1/unidades/${id}/eventos`)
      return r.map(
        (e): EventoUnidad => ({
          id: e.id,
          ocurridoEn: e.ocurrido_en,
          estadoAnterior: e.estado_anterior,
          estadoNuevo: e.estado_nuevo,
          actorTipo: e.actor_tipo,
          observacion: e.observacion,
        }),
      )
    },
    iniciarTamizaje: (id) => transicion('POST', `/v1/unidades/${id}/ingreso-tamizaje`),
    registrarTamizaje: (id, apta) => transicion('POST', `/v1/unidades/${id}/tamizaje`, { apta }),
    reservarUnidad: (id) => transicion('POST', `/v1/unidades/${id}/reserva`),
    liberarReserva: (id) => transicion('DELETE', `/v1/unidades/${id}/reserva`),
    despacharUnidad: (id, confirmacion) =>
      transicion('POST', `/v1/unidades/${id}/despacho`, { confirmacion }, true),
    disponerUnidad: (id, confirmacion) =>
      transicion('POST', `/v1/unidades/${id}/disposicion-final`, { confirmacion }, true),
  }
}
