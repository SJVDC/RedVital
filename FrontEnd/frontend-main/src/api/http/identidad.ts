import { rolDesdeCodigo } from '@/shared/datos/roles'
import { territorioDeRuta } from '@/shared/datos/divipola'
import type { Jurisdiccion, RolId, TokenEmitido } from '@/shared/tipos'
import type { ServicioIdentidad } from '../contratos'
import { Problemas } from '../errores'
import type { ClienteHttp } from './cliente'

/**
 * Adaptador del Servicio de Identidad. Contrato verificado contra
 * SesionesController y UsuariosController: snake_case, `{ correo, credencial }`
 * -> `{ token_acceso, tipo, expira_en }`, y la cookie `redvital_renovacion`
 * limitada a /api/v1/sesiones.
 */

interface TokenRespuesta {
  token_acceso: string
  tipo: string
  expira_en: number
}

interface AmbitoRespuesta {
  ambito: 'institucion' | 'territorio'
  territorio_codigo: string | null
  territorio_ruta: string | null
  institucion_id: string | null
}

interface UsuarioRespuesta {
  id: string
  correo: string
  nombre: string | null
  rol: string
  ambitos: AmbitoRespuesta[]
}

const aToken = (r: TokenRespuesta): TokenEmitido => ({ tokenAcceso: r.token_acceso, expiraEn: r.expira_en })

export function crearIdentidadHttp(cliente: ClienteHttp): ServicioIdentidad {
  return {
    async iniciarSesion(correo, credencial) {
      return aToken(
        await cliente.solicitar<TokenRespuesta>('POST', '/v1/sesiones', {
          cuerpo: { correo, credencial },
          sinSesion: true,
        }),
      )
    },

    async renovarSesion() {
      return aToken(await cliente.solicitar<TokenRespuesta>('POST', '/v1/sesiones/renovacion', { sinSesion: true }))
    },

    async cerrarSesion() {
      await cliente.solicitar<void>('DELETE', '/v1/sesiones/actual')
    },

    async obtenerUsuarioActual() {
      const r = await cliente.solicitar<UsuarioRespuesta>('GET', '/v1/usuarios/me')
      const rol = rolDesdeCodigo(r.rol)
      if (!rol) throw Problemas.noPermitida()
      return { id: r.id, rol, nombre: r.nombre, correo: r.correo, jurisdiccion: jurisdiccion(r.ambitos[0], rol) }
    },
  }
}

/**
 * Sin Servicio Institucional todavia no hay nombre de banco que mostrar: la
 * jurisdiccion institucional se declara como «tu banco de sangre», y la
 * territorial con el nombre DIVIPOLA del territorio.
 */
function jurisdiccion(ambito: AmbitoRespuesta | undefined, rol: RolId): Jurisdiccion {
  if (!ambito) {
    return { ambito: 'ninguno', etiqueta: rol === 'U2' ? 'Tus propios datos' : 'Sin jurisdicción asignada' }
  }
  if (ambito.ambito === 'institucion') {
    return { ambito: 'institucion', etiqueta: 'Tu banco de sangre', institucionId: ambito.institucion_id ?? undefined }
  }
  const territorio = ambito.territorio_ruta ? territorioDeRuta(ambito.territorio_ruta) : null
  return {
    ambito: 'territorio',
    etiqueta: !territorio ? 'Jurisdicción territorial' : territorio.codigo === '00' ? 'Territorio nacional' : territorio.nombre,
    territorioRuta: ambito.territorio_ruta ?? undefined,
  }
}
