import type { Alerta, ComponenteSanguineo, EstadoAlerta, GrupoSanguineo, TipoAlerta, Umbral } from '@/shared/tipos'
import type { ServicioInventario } from '../contratos'
import type { ClienteHttp } from './cliente'

/** Adaptador de M4 en el Servicio de Donación (DD 15.4, Tabla 36). */

interface UmbralRespuesta {
  componente: ComponenteSanguineo
  grupo_sanguineo: GrupoSanguineo | null
  minimo_unidades: number
  dias_previos_vencimiento: number
}

interface AlertaRespuesta {
  id: string
  tipo: TipoAlerta
  componente: ComponenteSanguineo
  grupo_sanguineo: GrupoSanguineo | null
  unidad_id: string | null
  valor_observado: number
  estado: EstadoAlerta
  generada_en: string
  cerrada_en: string | null
}

const aUmbral = (u: UmbralRespuesta): Umbral => ({
  componente: u.componente,
  grupo: u.grupo_sanguineo,
  minimoUnidades: u.minimo_unidades,
  diasPreviosVencimiento: u.dias_previos_vencimiento,
})

const aAlerta = (a: AlertaRespuesta): Alerta => ({
  id: a.id,
  tipo: a.tipo,
  componente: a.componente,
  grupo: a.grupo_sanguineo,
  unidadId: a.unidad_id,
  valorObservado: a.valor_observado,
  estado: a.estado,
  generadaEn: a.generada_en,
  cerradaEn: a.cerrada_en,
})

export function crearInventarioHttp(cliente: ClienteHttp): ServicioInventario {
  return {
    async consultarExistencias() {
      const r = await cliente.solicitar<
        {
          componente: ComponenteSanguineo
          grupo_sanguineo: GrupoSanguineo
          unidades_disponibles: number
          vencimiento_mas_proximo: string | null
        }[]
      >('GET', '/v1/inventario')
      return r.map((e) => ({
        componente: e.componente,
        grupo: e.grupo_sanguineo,
        disponibles: e.unidades_disponibles,
        vencimientoMasProximo: e.vencimiento_mas_proximo,
      }))
    },
    async consultarUmbrales() {
      return (await cliente.solicitar<UmbralRespuesta[]>('GET', '/v1/inventario/umbrales')).map(aUmbral)
    },
    async guardarUmbrales(umbrales) {
      const r = await cliente.solicitar<UmbralRespuesta[]>('PUT', '/v1/inventario/umbrales', {
        cuerpo: {
          umbrales: umbrales.map((u) => ({
            componente: u.componente,
            grupo_sanguineo: u.grupo,
            minimo_unidades: u.minimoUnidades,
            dias_previos_vencimiento: u.diasPreviosVencimiento,
          })),
        },
      })
      return r.map(aUmbral)
    },
    async listarAlertas(estado) {
      return (await cliente.solicitar<AlertaRespuesta[]>('GET', '/v1/alertas', { consulta: { estado } })).map(aAlerta)
    },
    async atenderAlerta(id) {
      return aAlerta(await cliente.solicitar<AlertaRespuesta>('POST', `/v1/alertas/${id}/atencion`))
    },
  }
}
