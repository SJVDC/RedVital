import { useId } from 'react'
import { unir } from '@/shared/ui/Primitivos'

/**
 * Isotipo de RedVital: marcador de ubicacion con una serpiente enroscada en el
 * vastago. Cobertura territorial mas dominio de la salud.
 *
 * La geometria esta trazada sobre redvital-docs/assets/IMG_2394.PNG. El
 * marcador es analitico — circulo ajustado a la cupula y dos rectas hasta la
 * punta redondeada — y la serpiente son contornos tomados del original, de
 * modo que el dibujo terminado es el logotipo, no una interpretacion.
 *
 * El reparto en tres capas viene de como esta construido el logotipo: la
 * serpiente pasa por delante del vastago en el tramo central y por detras
 * arriba y abajo, y deja un surco del color del fondo alli donde se cruza con
 * el. Por eso se dibuja marcador, luego surcos, luego cuerpo: el tramo que
 * cruza por delante no es una pieza aparte, aparece cuando los dos surcos
 * recortan el vastago.
 */

/** Cupula, los dos lados rectos y el casquete de la punta. */
const MARCADOR =
  'M14.27 31.79A25.99 25.99 0 1 1 65.87 31.95L41.62 115.15A1.66 1.66 0 0 1 38.43 115.15Z'

/** Surcos del color del fondo que la serpiente deja sobre el vastago. */
const SURCOS =
  'M22.07 58.14C22.91 58.37 25.35 60.52 27.65 61.64C29.95 62.77 33.05 64.05 35.85 64.89C38.66 65.73 41.94 66.32 44.48 66.70C47.02 67.08 49.26 67.09 51.09 67.16C52.92 67.22 54.82 66.75 55.47 67.09C56.12 67.43 55.40 68.76 55.01 69.21C54.62 69.66 54.89 69.78 53.11 69.78C51.33 69.78 46.49 69.43 44.30 69.21C42.11 68.99 41.74 68.88 39.95 68.48C38.16 68.08 35.30 67.34 33.54 66.81C31.78 66.28 31.07 66.06 29.40 65.29C27.73 64.52 24.67 63.05 23.54 62.21C22.41 61.37 22.84 60.95 22.59 60.27C22.34 59.59 21.23 57.91 22.07 58.14ZM27.99 78.21C29.68 78.25 34.98 79.94 38.53 80.52C42.08 81.09 47.22 81.32 49.31 81.66C51.40 82.00 50.98 81.82 51.08 82.56C51.18 83.30 50.21 85.83 49.92 86.11C49.63 86.39 51.25 84.77 49.36 84.26C47.47 83.76 41.80 83.58 38.59 83.08C35.38 82.58 31.80 81.73 30.10 81.27C28.40 80.81 28.73 80.81 28.38 80.30C28.03 79.79 26.30 78.17 27.99 78.21Z'

/** Tramos del cuerpo que sobresalen del vastago: lomo, cola y el giro derecho. */
const CUERPO =
  'M55.03 70.31C55.94 68.62 56.48 70.51 57.16 70.77C57.84 71.03 58.51 71.44 59.11 71.86C59.71 72.28 60.28 72.78 60.78 73.32C61.28 73.86 61.61 74.13 62.09 75.12C62.57 76.11 63.38 77.84 63.68 79.27C63.98 80.70 64.06 82.25 63.89 83.70C63.72 85.15 63.04 86.93 62.67 87.97C62.30 89.01 62.28 89.03 61.66 89.95C61.04 90.87 60.29 92.23 58.97 93.51C57.65 94.79 55.28 96.63 53.72 97.61C52.16 98.59 50.39 99.31 49.62 99.37C48.84 99.43 48.59 100.37 49.07 97.98C49.55 95.59 52.03 87.89 52.47 85.04C52.91 82.19 51.26 83.34 51.69 80.89C52.12 78.44 54.12 72.00 55.03 70.31ZM17.02 49.58C17.26 49.77 16.56 50.96 16.48 51.67C16.40 52.38 16.41 53.14 16.54 53.86C16.67 54.58 16.95 55.30 17.27 55.96C17.59 56.62 17.49 56.74 18.47 57.83C19.45 58.92 21.67 59.23 23.16 62.50C24.65 65.78 27.03 75.06 27.39 77.48C27.75 79.90 26.34 77.39 25.32 77.01C24.30 76.63 22.87 76.10 21.26 75.20C19.65 74.30 17.10 72.73 15.66 71.59C14.22 70.45 13.45 69.56 12.61 68.36C11.77 67.16 11.03 65.81 10.60 64.42C10.17 63.03 9.98 61.48 10.04 60.03C10.10 58.58 10.40 57.04 10.95 55.70C11.50 54.36 12.67 52.84 13.35 51.98C14.03 51.12 14.44 50.96 15.05 50.56C15.66 50.16 16.78 49.39 17.02 49.58ZM25.23 87.51C25.91 87.38 27.14 87.34 27.39 87.66C27.64 87.98 26.41 88.57 26.73 89.41C27.05 90.25 28.72 91.45 29.33 92.70C29.94 93.95 30.55 96.31 30.41 96.94C30.27 97.57 29.12 96.75 28.48 96.49C27.84 96.23 27.44 96.07 26.58 95.40C25.72 94.73 24.00 93.31 23.33 92.49C22.66 91.66 22.59 91.12 22.58 90.45C22.57 89.78 22.84 88.93 23.28 88.44C23.72 87.95 24.55 87.64 25.23 87.51Z'

const CABEZA =
  'M72.94 47.80C74.34 47.63 76.19 47.89 77.24 48.07C78.29 48.25 78.31 48.34 79.24 48.88C80.17 49.42 81.73 50.38 82.84 51.29C83.95 52.20 85.36 53.50 85.87 54.37C86.38 55.24 86.09 55.85 85.89 56.50C85.69 57.15 85.41 57.50 84.67 58.27C83.93 59.05 82.28 60.48 81.44 61.15C80.60 61.82 80.59 61.86 79.61 62.31C78.63 62.77 76.95 63.48 75.57 63.88C74.19 64.28 72.75 64.61 71.32 64.70C69.89 64.79 68.08 64.57 67.01 64.42C65.95 64.27 65.93 64.23 64.93 63.82C63.93 63.41 61.76 62.57 61.01 61.96C60.26 61.35 60.09 61.84 60.42 60.16C60.75 58.48 61.60 53.73 63.00 51.89C64.40 50.05 67.16 49.78 68.82 49.10C70.48 48.42 71.54 47.97 72.94 47.80Z'

/**
 * Recorrido del cuerpo, de la cola a la cabeza, incluidos los dos tramos que
 * quedan ocultos tras el vastago. Es el eje de la mascara que descubre la
 * serpiente: al pasar por un tramo oculto no hay nada que mostrar, y por eso
 * el dibujo desaparece por detras del marcador y reaparece al otro lado.
 */
const EJE =
  'M25.0 87.0C25.38 88.03 25.83 91.55 27.30 93.20C28.77 94.85 31.08 96.05 33.80 96.90C36.52 97.75 40.33 98.40 43.60 98.30C46.87 98.20 50.95 97.70 53.40 96.30C55.85 94.90 57.62 91.98 58.30 89.90C58.98 87.82 58.87 85.50 57.50 83.80C56.13 82.10 53.37 80.93 50.10 79.70C46.83 78.47 41.98 77.57 37.90 76.40C33.82 75.23 29.00 74.13 25.60 72.70C22.20 71.27 19.20 69.63 17.50 67.80C15.80 65.97 15.52 63.82 15.40 61.70C15.28 59.58 15.63 56.70 16.80 55.10C17.97 53.50 19.83 52.43 22.40 52.10C24.97 51.77 28.67 52.47 32.20 53.10C35.73 53.73 39.80 54.95 43.60 55.90C47.40 56.85 51.45 58.80 55.00 58.80C58.55 58.80 61.73 56.48 64.90 55.90C68.07 55.32 70.98 55.35 74.00 55.30C77.02 55.25 81.50 55.55 83.00 55.60'

/**
 * Grosor del trazo de la mascara. Se midio contra los contornos: 23 unidades
 * es lo minimo que cubre el punto del cuerpo mas alejado del eje, asi que al
 * terminar el recorrido no queda ningun trozo sin descubrir.
 */
const GROSOR_MASCARA = 24

interface IsotipoProps {
  className?: string
  /** Enrosca la serpiente en bucle. */
  animado?: boolean
  /**
   * Velocidad del enroscado. `carga` es el bucle corto de las esperas — un
   * indicador lento se lee como que algo se colgo. `ambiente` es el bucle
   * largo y sin corte para piezas que estan siempre a la vista.
   */
  ritmo?: 'carga' | 'ambiente'
  /** Latido lento del conjunto. Para el encabezado y la portada. */
  latiendo?: boolean
  /** Color de los surcos, el aro y el ojo. Debe ser el del fondo detras. */
  colorFondo?: string
}

export function Isotipo({
  className,
  animado = false,
  ritmo = 'carga',
  latiendo = false,
  colorFondo = 'var(--color-crema)',
}: IsotipoProps) {
  const idMascara = `enroscar-${useId()}`

  return (
    <svg
      viewBox="0 0 86 120"
      role="img"
      aria-label="Isotipo de RedVital"
      className={unir(className, latiendo && 'animate-latido')}
      style={{ transformOrigin: '50% 50%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {animado && (
        <defs>
          <mask
            id={idMascara}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="86"
            height="120"
          >
            {/*
              `pathLength` normaliza el largo a 100, de modo que el recorte no
              depende del largo real del recorrido. El hueco de 200 mantiene el
              siguiente tramo del patron fuera del dibujo: sin el, su extremo
              redondeado asomaria por la cabeza antes de empezar.

              El grosor tambien entra en el calculo de los fotogramas clave del
              tema, porque el remate redondo sobresale media anchura por cada
              punta. Si se toca, hay que revisar `enroscar` y
              `enroscar-ambiente` en tema.css.
            */}
            <path
              d={EJE}
              fill="none"
              stroke="#fff"
              strokeWidth={GROSOR_MASCARA}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100 200"
              className={
                ritmo === 'ambiente'
                  ? 'animate-enroscar-ambiente'
                  : 'animate-enroscar'
              }
            />
          </mask>
        </defs>
      )}

      <path d={MARCADOR} fill="currentColor" />
      <circle cx="40.1" cy="28.15" r="19.65" fill={colorFondo} />
      <circle cx="40.1" cy="28.15" r="16.91" fill="currentColor" />

      <g mask={animado ? `url(#${idMascara})` : undefined}>
        <path d={SURCOS} fill={colorFondo} />
        <path d={CUERPO} fill="currentColor" />
        <path d={CABEZA} fill="currentColor" />
        <circle cx="73.92" cy="52.99" r="1.08" fill={colorFondo} />
      </g>
    </svg>
  )
}

/**
 * Dibuja el isotipo en un lienzo con la misma geometria del SVG, en su espacio
 * de 86 x 120 unidades: quien llama fija la posicion y la escala con la
 * transformacion del contexto. Lo usa la imagen descargable del codigo de
 * donacion, que se genera en el navegador.
 */
export function dibujarIsotipo(ctx: CanvasRenderingContext2D, color: string, colorFondo: string) {
  const circulo = (x: number, y: number, r: number, relleno: string) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = relleno
    ctx.fill()
  }
  ctx.fillStyle = color
  ctx.fill(new Path2D(MARCADOR))
  circulo(40.1, 28.15, 19.65, colorFondo)
  circulo(40.1, 28.15, 16.91, color)
  ctx.fillStyle = colorFondo
  ctx.fill(new Path2D(SURCOS))
  ctx.fillStyle = color
  ctx.fill(new Path2D(CUERPO))
  ctx.fill(new Path2D(CABEZA))
  circulo(73.92, 52.99, 1.08, colorFondo)
}

/**
 * Bloque de marca completo: isotipo mas nombre y bajada.
 * `compacto` lo reduce a una linea para barras de navegacion.
 */
export function Marca({
  className,
  compacto = false,
  latiendo = false,
  colorFondo,
}: {
  className?: string
  compacto?: boolean
  latiendo?: boolean
  colorFondo?: string
}) {
  return (
    <div className={unir('flex items-center gap-2.5', className)}>
      <Isotipo
        className={compacto ? 'h-8 w-8' : 'h-11 w-11'}
        latiendo={latiendo}
        colorFondo={colorFondo}
      />
      <div className="leading-none">
        <p
          className={unir(
            'font-bold tracking-tight',
            compacto ? 'text-lg' : 'text-2xl',
          )}
        >
          RedVital
        </p>
        {!compacto && (
          <p className="mt-1 text-[11px] leading-tight opacity-80">
            Plataforma nacional de donacion de sangre
          </p>
        )}
      </div>
    </div>
  )
}
