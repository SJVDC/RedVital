import { ETIQUETA_ESTADO_UNIDAD } from '@/shared/datos/catalogos'
import type { EstadoUnidad } from '@/shared/tipos'
import { unir } from './Primitivos'

/**
 * RNF-01 — Confidencialidad.
 *
 * Único lugar donde se pinta el estado de una unidad: los nueve de la máquina
 * del DD V3.0. Deliberadamente no recibe motivo, causa ni diagnóstico, y no
 * tiene tooltip, que es el escondite típico de la causa clínica.
 *
 * Cada estado lleva además una forma propia en el punto indicador, para que se
 * distingan sin depender del color.
 */

const ESTILOS: Record<EstadoUnidad, string> = {
  captada: 'border-vino-200 bg-white text-texto-gris',
  fraccionada: 'border-vino-200 bg-white text-texto-gris',
  en_tamizaje: 'border-aviso-600/30 bg-aviso-50 text-aviso-600',
  disponible: 'border-exito-600/40 bg-exito-50 text-exito-600',
  reservada: 'border-exito-600/40 bg-white text-exito-600',
  despachada: 'border-texto-gris/30 bg-vino-50/40 text-texto-gris',
  no_apta: 'border-vino-400 bg-vino-50 text-vino-700',
  vencida: 'border-aviso-600/40 bg-aviso-50 text-aviso-600',
  desechada: 'border-texto-gris/30 bg-white text-texto-gris',
}

const PUNTOS: Record<EstadoUnidad, string> = {
  captada: 'rounded-full border-2 border-texto-tenue bg-transparent',
  fraccionada: 'rounded-full bg-texto-tenue',
  en_tamizaje: 'rounded-full border-2 border-aviso-600 bg-aviso-50',
  disponible: 'rounded-full bg-exito-600',
  reservada: 'rounded-full border-2 border-exito-600 bg-transparent',
  despachada: 'rounded-[1px] bg-texto-gris',
  no_apta: 'rounded-[1px] bg-vino-600',
  vencida: 'rounded-[1px] rotate-45 bg-aviso-600',
  desechada: 'rounded-full border-2 border-texto-gris bg-transparent',
}

export function InsigniaEstadoUnidad({ estado, tamano = 'normal' }: { estado: EstadoUnidad; tamano?: 'normal' | 'grande' }) {
  return (
    <span
      className={unir(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold',
        tamano === 'grande' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs',
        ESTILOS[estado],
      )}
    >
      <span aria-hidden="true" className={unir('h-2 w-2 shrink-0', PUNTOS[estado])} />
      {ETIQUETA_ESTADO_UNIDAD[estado]}
    </span>
  )
}
