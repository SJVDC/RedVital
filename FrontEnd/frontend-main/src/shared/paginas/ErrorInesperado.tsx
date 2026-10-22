import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/**
 * Última barrera: si una pantalla falla al dibujarse, se muestra un mensaje en
 * lugar de una página en blanco. No expone el detalle técnico al usuario.
 */
export class ErrorInesperado extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlado en la interfaz', error, info.componentStack)
  }

  render() {
    if (!this.state.fallo) return this.props.children
    return (
      <div className="flex min-h-full items-center justify-center bg-crema px-4">
        <div className="max-w-md rounded-tarjeta border border-vino-100 bg-white p-6 text-center shadow-nivel-2">
          <h1 className="text-xl font-bold text-vino-800">Algo salió mal</h1>
          <p className="mt-2 text-sm text-texto-gris">Recarga la página. Si el problema continúa, inténtalo más tarde.</p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-vino-600 px-5 text-sm font-bold text-white"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }
}
