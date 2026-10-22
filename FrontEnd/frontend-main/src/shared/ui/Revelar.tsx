import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { unir } from './Primitivos'

/**
 * Revela su contenido cuando entra en la pantalla.
 *
 * Usa `IntersectionObserver` y no un escucha de `scroll`: el escucha se
 * dispara en cada cuadro y obliga al navegador a recalcular el diseno, que es
 * lo que hace que el desplazamiento se sienta pesado en telefonos.
 *
 * Solo se animan `opacity` y `transform`, que el navegador resuelve en la
 * tarjeta grafica sin rehacer el diseno de la pagina.
 *
 * Si el usuario pidio movimiento reducido, el contenido aparece de una vez y
 * el observador ni siquiera se registra.
 */
export function Revelar({
  children,
  retraso = 0,
  className,
  as: Etiqueta = 'div',
}: {
  children: ReactNode
  /** Retraso en milisegundos, para escalonar varios elementos. */
  retraso?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
}) {
  const referencia = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(() => prefiereMenosMovimiento())

  useEffect(() => {
    if (prefiereMenosMovimiento()) {
      setVisible(true)
      return
    }

    const nodo = referencia.current
    if (!nodo) return

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            setVisible(true)
            observador.unobserve(entrada.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  return (
    <Etiqueta
      ref={referencia as never}
      style={{ transitionDelay: visible ? `${retraso}ms` : '0ms' }}
      className={unir(
        'transition-[opacity,transform] duration-[720ms] ease-salida motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0',
        className,
      )}
    >
      {children}
    </Etiqueta>
  )
}

function prefiereMenosMovimiento() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
