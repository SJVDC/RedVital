/**
 * Modelo de dominio de la aplicacion web de RedVital.
 *
 * Son los tipos que consumen las pantallas. La capa `src/api` traduce las
 * respuestas del gateway (snake_case) a esta forma, de modo que un cambio de
 * contrato en un servicio se absorbe en su adaptador y no en la interfaz.
 *
 * Restriccion RNF-01: en ninguna parte de este archivo existe un campo que
 * pueda almacenar la causa clinica de una unidad no apta ni el resultado
 * individual de una prueba (DD V3.0, IN-01).
 */

/* ------------------------------------------------------------------ Perfiles */

/** Los siete perfiles del SRS. U1 es el visitante sin sesion. */
export type RolId = 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'U7'

/** Codigo de rol tal como viaja en la reivindicacion `role` del token. */
export type RolCodigo =
  | 'donante'
  | 'operador'
  | 'admin_banco'
  | 'coordinador'
  | 'admin_nacional'
  | 'auditor'

export interface Rol {
  id: RolId
  codigo: RolCodigo | null
  nombre: string
  descripcion: string
}

/* ------------------------------------------------------------------- Sesion */

export interface Jurisdiccion {
  ambito: 'institucion' | 'territorio' | 'ninguno'
  /** Texto legible del ambito, el que se declara en la barra de contexto. */
  etiqueta: string
  institucionId?: string
  territorioRuta?: string
}

export interface UsuarioSesion {
  id: string
  rol: RolId
  nombre: string | null
  correo: string
  jurisdiccion: Jurisdiccion
}

export interface TokenEmitido {
  tokenAcceso: string
  /** Segundos de vigencia del token de acceso. */
  expiraEn: number
}

/* ---------------------------------------------------------------- Catalogos */

export type ComponenteSanguineo = 'globulos_rojos' | 'plasma' | 'plaquetas'

export type GrupoSanguineo = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'

/** Municipio o departamento del listado DIVIPOLA. */
export interface Territorio {
  codigo: string
  nombre: string
  /** Ruta territorial derivada del codigo: /00/05/05001. */
  ruta: string
}

/* ------------------------------------------------------------ M1 — Donantes */

export interface Elegibilidad {
  elegible: boolean
  /** Fecha (AAAA-MM-DD) desde la que puede donar. Nula si nunca podra por edad. */
  elegibleDesde: string | null
  diasRestantes: number | null
}

/** Registro anonimo previo a la donacion. Sin ningun dato de identificacion. */
export interface Intencion {
  codigo: string
  estado: 'pendiente' | 'atendida' | 'caducada'
  expiraEn: string
  /** Solo lo recibe el operador. Autodeclarado: no es dato confiable. */
  grupoAutodeclarado: GrupoSanguineo | null
  municipioRuta: string | null
}

export interface NuevaIntencion {
  grupo: GrupoSanguineo | null
  municipioRuta: string | null
}

export interface RegistroDonante {
  documento: string
  nombre: string
  fechaNacimiento: string
  correoAcceso: string
  credencial: string
  correoContacto: string | null
  telefono: string | null
  municipioRuta: string | null
  autorizaTratamiento: boolean
  autorizaAvisos: boolean
  versionAviso: string
}

export interface PerfilDonante {
  nombre: string
  correo: string | null
  telefono: string | null
  municipioRuta: string | null
  /** Grupo tipificado en la primera donacion. Nulo antes de ella. */
  grupo: GrupoSanguineo | null
  fechaUltimaDonacion: string | null
  totalDonaciones: number
}

export interface CambioPerfil {
  nombre: string
  correo: string | null
  telefono: string | null
  municipioRuta: string | null
}

/**
 * Donacion vista por su propio donante. Sin resultado de tamizaje ni destino
 * de las unidades (DD V3.0, decision D-01).
 */
export interface DonacionPropia {
  id: string
  fecha: string
  campaniaId: string | null
  /** Mensaje neutro, identico para todo donante. */
  mensaje: string
}

export interface Reconocimiento {
  codigo: string
  nombre: string
  descripcion: string
  criterioDonaciones: number
  orden: number
  obtenidoEn: string | null
}

export type FinalidadConsentimiento = 'tratamiento_datos' | 'avisos_campanas'

export interface Consentimiento {
  finalidad: FinalidadConsentimiento
  otorgado: boolean
  versionAviso: string
  registradoEn: string
}

/** Donante presente, tal como lo recibe el operador. Lo minimo para identificarlo. */
export interface DonantePresente {
  id: string
  nombre: string
  elegibilidad: Elegibilidad
}

/* ------------------------------------------------------------ M2 — Campanas */

export type EstadoCampania = 'borrador' | 'publicada' | 'cerrada' | 'cancelada'

export interface Campania {
  id: string
  institucionId: string
  nombre: string
  descripcion: string | null
  sede: string
  territorioCodigo: string
  territorioRuta: string
  iniciaEn: string
  terminaEn: string
  estado: EstadoCampania
  /** Nulo significa sin cupo limitado. */
  cupoTotal: number | null
  cupoDisponible: number | null
  /** Solo para roles institucionales (RF-25). */
  donacionesRegistradas: number | null
}

/* ----------------------------------------- M3 — Trazabilidad y ciclo de vida */

/**
 * Los nueve estados de la maquina cerrada del DD V3.0 (seccion 10). Ninguno
 * va acompanado de causa: `no_apta` es un veredicto, no un diagnostico.
 */
export type EstadoUnidad =
  | 'captada'
  | 'fraccionada'
  | 'en_tamizaje'
  | 'disponible'
  | 'reservada'
  | 'despachada'
  | 'no_apta'
  | 'vencida'
  | 'desechada'

export interface Unidad {
  id: string
  donacionId: string
  componente: ComponenteSanguineo
  grupo: GrupoSanguineo
  estado: EstadoUnidad
  /** Veredicto de tamizaje. Nulo mientras no se ha tamizado. */
  apta: boolean | null
  institucionCustodiaId: string
  fechaCaptacion: string
  fechaVencimiento: string
  volumenMl: number | null
}

export interface EventoUnidad {
  id: string
  ocurridoEn: string
  estadoAnterior: EstadoUnidad | null
  estadoNuevo: EstadoUnidad
  actorTipo: 'usuario' | 'sistema'
  /** Codigo del catalogo operativo (texto cerrado, nunca libre). */
  observacion: string | null
}

export interface Donacion {
  id: string
  donanteId: string | null
  intencionId: string | null
  institucionId: string
  campaniaId: string | null
  /** Falso si la campana indicada no pudo confirmarse (EC-08). */
  campaniaConfirmada: boolean
  fechaCaptacion: string
  unidades: Unidad[]
}

export interface NuevaDonacion {
  donanteId: string | null
  intencionCodigo: string | null
  grupo: GrupoSanguineo
  campaniaId: string | null
  componentes: { componente: ComponenteSanguineo; volumenMl: number | null }[]
}

export interface Pagina<T> {
  elementos: T[]
  total: number
  pagina: number
  tamano: number
}

export interface FiltroUnidades {
  estado?: EstadoUnidad
  componente?: ComponenteSanguineo
  pagina?: number
  tamano?: number
}

/** Resultado de una transicion: el estado anterior y el nuevo. */
export interface Transicion {
  unidadId: string
  estadoAnterior: EstadoUnidad | null
  estadoNuevo: EstadoUnidad
  ocurridoEn: string
}

/* ------------------------------------------------- M4 — Inventario y alertas */

export interface Existencia {
  componente: ComponenteSanguineo
  grupo: GrupoSanguineo
  disponibles: number
  vencimientoMasProximo: string | null
}

export interface Umbral {
  componente: ComponenteSanguineo
  /** Nulo significa «cualquier grupo». */
  grupo: GrupoSanguineo | null
  minimoUnidades: number
  diasPreviosVencimiento: number
}

export type TipoAlerta = 'escasez' | 'vencimiento_proximo'
export type EstadoAlerta = 'abierta' | 'atendida' | 'caducada'

export interface Alerta {
  id: string
  tipo: TipoAlerta
  componente: ComponenteSanguineo
  grupo: GrupoSanguineo | null
  /** Solo en alertas de vencimiento proximo, que son por unidad. */
  unidadId: string | null
  /** Existencias (escasez) o dias restantes (vencimiento) al evaluarla. */
  valorObservado: number
  estado: EstadoAlerta
  generadaEn: string
  cerradaEn: string | null
}
