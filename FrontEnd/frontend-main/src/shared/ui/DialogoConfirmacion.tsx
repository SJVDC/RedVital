import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Boton, MensajeError } from './Primitivos'

/**
 * Confirmación explícita de una acción con efecto (publicar, desechar,
 * atender). El botón de confirmar queda deshabilitado mientras la acción está
 * en curso, para que un doble clic no la repita.
 */
export function DialogoConfirmacion({
  abierto,
  titulo,
  descripcion,
  children,
  textoConfirmar,
  onConfirmar,
  onCerrar,
  cargando = false,
  error,
  confirmarDeshabilitado = false,
}: {
  abierto: boolean
  titulo: string
  descripcion: ReactNode
  children?: ReactNode
  textoConfirmar: string
  onConfirmar: () => void
  onCerrar: () => void
  cargando?: boolean
  error?: string | null
  confirmarDeshabilitado?: boolean
}) {
  return (
    <Dialog.Root open={abierto} onOpenChange={(abrir) => !abrir && !cargando && onCerrar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-vino-900/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-tarjeta border border-vino-100 bg-white p-6 shadow-elevada">
          <Dialog.Title className="text-lg font-bold text-vino-800">{titulo}</Dialog.Title>
          <Dialog.Description asChild>
            <div className="mt-2 text-sm leading-relaxed text-texto-gris">{descripcion}</div>
          </Dialog.Description>
          {children && <div className="mt-4">{children}</div>}
          {error && (
            <div className="mt-4">
              <MensajeError>{error}</MensajeError>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Boton variante="texto" onClick={onCerrar} deshabilitado={cargando}>
              Cancelar
            </Boton>
            <Boton onClick={onConfirmar} cargando={cargando} deshabilitado={confirmarDeshabilitado}>
              {textoConfirmar}
            </Boton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
