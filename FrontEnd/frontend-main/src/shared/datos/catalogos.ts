import type {
  ComponenteSanguineo,
  EstadoAlerta,
  EstadoCampania,
  EstadoUnidad,
  GrupoSanguineo,
  TipoAlerta,
} from '@/shared/tipos'

/**
 * Catalogos cerrados y sus etiquetas en pantalla. Un unico lugar para el
 * texto de cada codigo: las pantallas nunca muestran el codigo crudo.
 */

export const GRUPOS_SANGUINEOS: GrupoSanguineo[] = [
  'O+',
  'O-',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
]

export const COMPONENTES: ComponenteSanguineo[] = [
  'globulos_rojos',
  'plaquetas',
  'plasma',
]

export const ETIQUETA_COMPONENTE: Record<ComponenteSanguineo, string> = {
  globulos_rojos: 'Glóbulos rojos',
  plaquetas: 'Plaquetas',
  plasma: 'Plasma',
}

/** Vida util orientativa, para explicar al donante y al operador. */
export const VIDA_UTIL_COMPONENTE: Record<ComponenteSanguineo, string> = {
  globulos_rojos: 'Duran unos 35 días',
  plaquetas: 'Duran apenas 5 días',
  plasma: 'Se puede congelar un año',
}

export const ESTADOS_UNIDAD: EstadoUnidad[] = [
  'captada',
  'fraccionada',
  'en_tamizaje',
  'disponible',
  'reservada',
  'despachada',
  'no_apta',
  'vencida',
  'desechada',
]

export const ETIQUETA_ESTADO_UNIDAD: Record<EstadoUnidad, string> = {
  captada: 'Captada',
  fraccionada: 'Fraccionada',
  en_tamizaje: 'En tamizaje',
  disponible: 'Disponible',
  reservada: 'Reservada',
  despachada: 'Despachada',
  no_apta: 'No apta',
  vencida: 'Vencida',
  desechada: 'Desechada',
}

export const ETIQUETA_ESTADO_CAMPANIA: Record<EstadoCampania, string> = {
  borrador: 'Borrador',
  publicada: 'Publicada',
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
}

export const ETIQUETA_TIPO_ALERTA: Record<TipoAlerta, string> = {
  escasez: 'Escasez',
  vencimiento_proximo: 'Vencimiento próximo',
}

export const ETIQUETA_ESTADO_ALERTA: Record<EstadoAlerta, string> = {
  abierta: 'Abierta',
  atendida: 'Atendida',
  caducada: 'Cerrada por el sistema',
}

/** Anotaciones operativas cerradas (DD, D-02). Ninguna describe una condicion clinica. */
export const ETIQUETA_OBSERVACION: Record<string, string> = {
  traslado_interno: 'Traslado interno',
  reetiquetado: 'Reetiquetado',
  control_temperatura: 'Control de temperatura',
  empaque_envio: 'Empaque para envío',
  recepcion_conforme: 'Recepción conforme',
  verificacion_inventario: 'Verificación de inventario',
}

/**
 * Titulo de cada evento del recorrido de una unidad, derivado de la
 * transicion. El texto describe el paso del procedimiento y nunca insinua una
 * causa: "Resultado de tamizaje: no apta" es todo lo que el sistema sabe.
 */
export function tituloEventoUnidad(
  anterior: EstadoUnidad | null,
  nuevo: EstadoUnidad,
): string {
  if (anterior === null) return 'Captación registrada'
  switch (nuevo) {
    case 'fraccionada':
      return 'Fraccionamiento confirmado'
    case 'en_tamizaje':
      return 'Ingreso a tamizaje'
    case 'disponible':
      return anterior === 'reservada'
        ? 'Reserva liberada'
        : 'Resultado de tamizaje: apta'
    case 'no_apta':
      return 'Resultado de tamizaje: no apta'
    case 'reservada':
      return 'Reservada'
    case 'despachada':
      return 'Despachada para transfusión'
    case 'vencida':
      return 'Exclusión automática por vencimiento'
    case 'desechada':
      return 'Disposición final ejecutada'
    default:
      return ETIQUETA_ESTADO_UNIDAD[nuevo]
  }
}
