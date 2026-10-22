import type { SVGProps } from 'react'

/**
 * Iconografia propia, de trazo fino y uniforme.
 *
 * Regla de la revision de UI: nunca usar emoji como icono. Un emoji cambia de
 * forma segun el sistema operativo, no hereda el color del texto y los
 * lectores de pantalla lo anuncian con un nombre que no corresponde.
 *
 * Todos los iconos son decorativos por defecto (`aria-hidden`): el significado
 * lo aporta el texto que los acompana. Cuando un icono va solo dentro de un
 * boton, el boton debe llevar su propia etiqueta accesible.
 */

type PropsIcono = SVGProps<SVGSVGElement>

function Base({ children, ...props }: PropsIcono) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconoGota(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 3.2c3.4 4 5.6 6.9 5.6 9.6a5.6 5.6 0 0 1-11.2 0c0-2.7 2.2-5.6 5.6-9.6Z" />
      <path d="M9.6 13.4a2.6 2.6 0 0 0 2 2.5" />
    </Base>
  )
}

export function IconoVerificado(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="m4.5 12.5 4.6 4.6L19.5 6.7" />
    </Base>
  )
}

export function IconoCalendario(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8.5 3.5v4M15.5 3.5v4" />
    </Base>
  )
}

export function IconoReloj(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.3V12l3.1 2.1" />
    </Base>
  )
}

export function IconoUbicacion(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 21.2s7-6.6 7-11.3a7 7 0 1 0-14 0c0 4.7 7 11.3 7 11.3Z" />
      <circle cx="12" cy="9.8" r="2.7" />
    </Base>
  )
}

export function IconoEscudo(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V5.8L12 3Z" />
      <path d="m9.3 12 1.9 1.9 3.6-3.7" />
    </Base>
  )
}

export function IconoFlecha(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M4.8 12h14.4M13.4 6.2 19.2 12l-5.8 5.8" />
    </Base>
  )
}

export function IconoAlerta(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 4.4 2.9 19.6h18.2L12 4.4Z" />
      <path d="M12 10v3.9M12 16.6h.01" />
    </Base>
  )
}

export function IconoMedalla(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="14.6" r="5.6" />
      <path d="M8.6 9.3 6.2 3.4h11.6l-2.4 5.9M12 12.4l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3.9-1.9Z" />
    </Base>
  )
}

export function IconoPersona(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8.2" r="3.9" />
      <path d="M4.8 20.3a7.6 7.6 0 0 1 14.4 0" />
    </Base>
  )
}

export function IconoHospital(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M4 20.4V8.1l8-4.5 8 4.5v12.3" />
      <path d="M2.6 20.4h18.8M12 9.6v5.2M9.4 12.2h5.2" />
    </Base>
  )
}

export function IconoInventario(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="3.5" y="8.4" width="17" height="12.1" rx="2" />
      <path d="M3.5 12.5h17M9.6 8.4V3.6h4.8v4.8" />
    </Base>
  )
}

export function IconoRegistro(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M15.5 3.5H6.8A2.3 2.3 0 0 0 4.5 5.8v13.4a2.3 2.3 0 0 0 2.3 2.3h10.4a2.3 2.3 0 0 0 2.3-2.3V7.5l-4-4Z" />
      <path d="M8.6 12.4h6.8M8.6 16.2h4.4" />
    </Base>
  )
}

export function IconoDescargar(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 4.5v10.2M7.8 10.6 12 14.8l4.2-4.2" />
      <path d="M4.5 15.5v2.7a2.3 2.3 0 0 0 2.3 2.3h10.4a2.3 2.3 0 0 0 2.3-2.3v-2.7" />
    </Base>
  )
}

export function IconoCopiar(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.2" />
      <path d="M15.5 8.5V6.7a2.2 2.2 0 0 0-2.2-2.2H6.7a2.2 2.2 0 0 0-2.2 2.2v6.6a2.2 2.2 0 0 0 2.2 2.2h1.8" />
    </Base>
  )
}

export function IconoBuscar(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="10.9" cy="10.9" r="6.4" />
      <path d="m15.6 15.6 4 4" />
    </Base>
  )
}

export function IconoCandado(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="4.8" y="10.4" width="14.4" height="10.1" rx="2.2" />
      <path d="M8.2 10.4V7.9a3.8 3.8 0 0 1 7.6 0v2.5" />
    </Base>
  )
}

export function IconoCorazon(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 20.3s-7.7-4.6-7.7-9.9a4.3 4.3 0 0 1 7.7-2.6 4.3 4.3 0 0 1 7.7 2.6c0 5.3-7.7 9.9-7.7 9.9Z" />
    </Base>
  )
}

export function IconoSalir(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M9.5 20.5H6.8a2.3 2.3 0 0 1-2.3-2.3V5.8a2.3 2.3 0 0 1 2.3-2.3h2.7" />
      <path d="m15.5 16.5 4.5-4.5-4.5-4.5M20 12H9.5" />
    </Base>
  )
}

export function IconoEntrar(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M14.5 3.5h2.7a2.3 2.3 0 0 1 2.3 2.3v12.4a2.3 2.3 0 0 1-2.3 2.3h-2.7" />
      <path d="m10 16.5 4.5-4.5L10 7.5M14.5 12H4" />
    </Base>
  )
}

export function IconoOjo(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M2.8 12s3.3-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.3 6.2-9.2 6.2S2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Base>
  )
}

export function IconoOjoTachado(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M9.9 6.1A9.4 9.4 0 0 1 12 5.8c5.9 0 9.2 6.2 9.2 6.2a15.8 15.8 0 0 1-2.4 3.2M6.6 7.7A15.4 15.4 0 0 0 2.8 12s3.3 6.2 9.2 6.2a9 9 0 0 0 4.4-1.1" />
      <path d="M10 10a2.8 2.8 0 0 0 4 4M4 4l16 16" />
    </Base>
  )
}

export function IconoCerrar(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Base>
  )
}

export function IconoRecargar(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.8 4.2v4.6h-4.6" />
    </Base>
  )
}

export function IconoReserva(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8.5 3.5v4M15.5 3.5v4" />
      <path d="m9.3 15 1.9 1.9 3.6-3.6" />
    </Base>
  )
}

export function IconoInformacion(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.2M12 7.8h.01" />
    </Base>
  )
}
