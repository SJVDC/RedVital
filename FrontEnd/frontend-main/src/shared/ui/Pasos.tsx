import { unir } from './Primitivos'
import { IconoVerificado } from './Iconos'

/**
 * Indicador de progreso para los registros por pasos.
 *
 * Vive en `shared` porque lo usan el registro anonimo de tres pasos (RNF-03)
 * y el registro voluntario con perfil, que tiene cuatro. El numero de pasos
 * es un parametro justamente para que ninguna de las dos pantallas herede el
 * limite de la otra.
 *
 * El paso alcanzado se marca con un icono ademas del color, para que el
 * avance no dependa solo de distinguir tonos.
 */
export function IndicadorPasos({
  actual,
  total,
}: {
  actual: number
  total: number
}) {
  return (
    <div>
      <ol className="flex items-center gap-2" aria-label="Progreso del registro">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <li key={n} className="flex flex-1 items-center gap-2">
            <span
              className={unir(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-[var(--dur-media)] ease-resorte',
                n < actual && 'bg-vino-600 text-white',
                n === actual &&
                  'scale-110 bg-vino-600 text-white shadow-nivel-2',
                n > actual && 'border border-vino-200 bg-white text-texto-tenue',
              )}
              aria-current={n === actual ? 'step' : undefined}
            >
              {n < actual ? <IconoVerificado className="h-4 w-4" /> : n}
            </span>
            {n < total && (
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-vino-100">
                {/* Solo escala en horizontal: no recalcula el diseno */}
                <span
                  className={unir(
                    'block h-full origin-left rounded-full bg-vino-600 transition-transform duration-[var(--dur-lenta)] ease-salida',
                    n < actual ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.14em] text-texto-tenue">
        Paso {actual} de {total}
      </p>
    </div>
  )
}
