import type {
  Consentimiento,
  DonantePresente,
  Elegibilidad,
  FinalidadConsentimiento,
  GrupoSanguineo,
  Intencion,
  PerfilDonante,
  Reconocimiento,
} from '@/shared/tipos'
import { CONFIG } from '../config'
import type { ServicioDonantes } from '../contratos'
import type { ClienteHttp } from './cliente'

/** Adaptador de M1 en el Servicio de Donación (DD 15.4, Tabla 34). */

interface ElegibilidadRespuesta {
  elegible: boolean
  elegible_desde: string | null
  dias_restantes: number | null
}

interface PerfilRespuesta {
  nombre: string
  correo: string | null
  telefono: string | null
  municipio_ruta: string | null
  grupo_sanguineo: GrupoSanguineo | null
  fecha_ultima_donacion: string | null
  total_donaciones: number
}

interface ConsentimientoRespuesta {
  finalidad: FinalidadConsentimiento
  otorgado: boolean
  version_aviso: string
  registrado_en: string
}

export const aElegibilidad = (e: ElegibilidadRespuesta): Elegibilidad => ({
  elegible: e.elegible,
  elegibleDesde: e.elegible_desde,
  diasRestantes: e.dias_restantes,
})

const aPerfil = (p: PerfilRespuesta): PerfilDonante => ({
  nombre: p.nombre,
  correo: p.correo,
  telefono: p.telefono,
  municipioRuta: p.municipio_ruta,
  grupo: p.grupo_sanguineo,
  fechaUltimaDonacion: p.fecha_ultima_donacion,
  totalDonaciones: p.total_donaciones,
})

const aConsentimiento = (c: ConsentimientoRespuesta): Consentimiento => ({
  finalidad: c.finalidad,
  otorgado: c.otorgado,
  versionAviso: c.version_aviso,
  registradoEn: c.registrado_en,
})

export function crearDonantesHttp(cliente: ClienteHttp): ServicioDonantes {
  return {
    async registrarIntencion(datos) {
      const r = await cliente.solicitar<{ codigo: string; expira_en: string }>('POST', '/v1/intenciones', {
        cuerpo: { grupo_sanguineo: datos.grupo, municipio_ruta: datos.municipioRuta },
        idempotente: true,
        sinSesion: true,
      })
      return { codigo: r.codigo, expiraEn: r.expira_en }
    },

    async consultarIntencion(codigo) {
      const r = await cliente.solicitar<{
        codigo: string
        estado: Intencion['estado']
        expira_en: string
        grupo_sanguineo: GrupoSanguineo | null
        municipio_ruta: string | null
      }>('GET', `/v1/intenciones/${encodeURIComponent(codigo)}`)
      return {
        codigo: r.codigo,
        estado: r.estado,
        expiraEn: r.expira_en,
        grupoAutodeclarado: r.grupo_sanguineo,
        municipioRuta: r.municipio_ruta,
      }
    },

    async registrarDonante(d) {
      await cliente.solicitar<void>('POST', '/v1/donantes', {
        cuerpo: {
          documento: d.documento,
          nombre: d.nombre,
          fecha_nacimiento: d.fechaNacimiento,
          correo_acceso: d.correoAcceso,
          credencial: d.credencial,
          correo: d.correoContacto,
          telefono: d.telefono,
          municipio_ruta: d.municipioRuta,
          autoriza_tratamiento_datos: d.autorizaTratamiento,
          autoriza_avisos_campanas: d.autorizaAvisos,
          version_aviso: d.versionAviso,
        },
        idempotente: true,
        sinSesion: true,
      })
    },

    async obtenerPerfil() {
      return aPerfil(await cliente.solicitar<PerfilRespuesta>('GET', '/v1/donantes/me'))
    },

    async actualizarPerfil(c) {
      return aPerfil(
        await cliente.solicitar<PerfilRespuesta>('PUT', '/v1/donantes/me', {
          cuerpo: { nombre: c.nombre, correo: c.correo, telefono: c.telefono, municipio_ruta: c.municipioRuta },
        }),
      )
    },

    async obtenerElegibilidad() {
      return aElegibilidad(await cliente.solicitar<ElegibilidadRespuesta>('GET', '/v1/donantes/me/elegibilidad'))
    },

    async listarMisDonaciones() {
      const r = await cliente.solicitar<
        { id: string; fecha_captacion: string; campania_id: string | null; mensaje: string }[]
      >('GET', '/v1/donantes/me/donaciones')
      return r.map((d) => ({ id: d.id, fecha: d.fecha_captacion, campaniaId: d.campania_id, mensaje: d.mensaje }))
    },

    async listarReconocimientos() {
      const r = await cliente.solicitar<
        {
          codigo: string
          nombre: string
          descripcion: string
          criterio_donaciones: number
          orden: number
          otorgado_en: string | null
        }[]
      >('GET', '/v1/donantes/me/reconocimientos')
      return r.map(
        (x): Reconocimiento => ({
          codigo: x.codigo,
          nombre: x.nombre,
          descripcion: x.descripcion,
          criterioDonaciones: x.criterio_donaciones,
          orden: x.orden,
          obtenidoEn: x.otorgado_en,
        }),
      )
    },

    async listarConsentimientos() {
      return (await cliente.solicitar<ConsentimientoRespuesta[]>('GET', '/v1/donantes/me/consentimientos')).map(
        aConsentimiento,
      )
    },

    async registrarConsentimiento(finalidad, otorgado) {
      const r = await cliente.solicitar<ConsentimientoRespuesta[]>('POST', '/v1/donantes/me/consentimientos', {
        cuerpo: { finalidad, otorgado, version_aviso: CONFIG.versionAvisoPrivacidad },
      })
      return r.map(aConsentimiento)
    },

    async buscarDonantePresente(documento) {
      const r = await cliente.solicitar<{ id: string; nombre: string; elegibilidad: ElegibilidadRespuesta }>(
        'POST',
        '/v1/donantes/busqueda',
        { cuerpo: { documento } },
      )
      return { id: r.id, nombre: r.nombre, elegibilidad: aElegibilidad(r.elegibilidad) } satisfies DonantePresente
    },
  }
}
