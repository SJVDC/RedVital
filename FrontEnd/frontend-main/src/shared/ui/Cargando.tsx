import { Isotipo } from '@/shared/layout/Isotipo'
import { unir } from './Primitivos'

/**
 * Pantalla de carga. La serpiente del isotipo se dibuja sola mientras se
 * espera, en lugar de un indicador generico.
 *
 * El texto de estado va en una region `aria-live`: un lector de pantalla
 * necesita que le anuncien la espera, no puede ver la animacion. Con
 * `prefers-reduced-motion` el trazo queda completo y quieto — la regla global
 * del tema anula la animacion, y el dibujo sigue siendo legible.
 */
export function CargandoRedVital({
  mensaje = 'Preparando la informacion',
}: {
  mensaje?: string
}) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        {/* Ondas concentricas, desfasadas para sugerir alcance territorial */}
        <span
          aria-hidden="true"
          className="animate-anillo absolute inset-0 rounded-full border-2 border-vino-300"
        />
        <span
          aria-hidden="true"
          className="animate-anillo absolute inset-0 rounded-full border-2 border-vino-300 [animation-delay:0.9s]"
        />
        <Isotipo className="relative h-20 w-20 text-vino-600" animado latiendo />
      </div>

      <div>
        <p className="text-base font-bold text-vino-800">{mensaje}</p>
        <p className="mt-1 text-sm text-texto-tenue">Un momento, por favor.</p>
      </div>
    </div>
  )
}

/** Indicador pequeno para acciones dentro de una pantalla ya cargada. */
export function CargandoLinea({ className }: { className?: string }) {
  return (
    <span
      className={unir('inline-flex items-center gap-2', className)}
      role="status"
      aria-live="polite"
    >
      <Isotipo className="h-5 w-5 text-vino-600" animado />
      <span className="text-sm text-texto-gris">Procesando</span>
    </span>
  )
}

/**
 * Bloque gris de carga. Reserva el espacio exacto del contenido que viene,
 * para que la pagina no salte cuando llega (evita el desplazamiento de
 * diseno acumulado).
 */
export function Esqueleto({
  className,
  redondo = false,
}: {
  className?: string
  redondo?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={unir(
        'relative block overflow-hidden bg-vino-100/70',
        redondo ? 'rounded-full' : 'rounded-suave',
        className,
      )}
    >
      <span className="animate-brillo absolute inset-y-0 -left-full w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </span>
  )
}
