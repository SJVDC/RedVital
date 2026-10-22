import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate } from 'react-router-dom'
import { RUTA_INICIAL } from '@/shared/layout/navegacion'
import { Boton } from '@/shared/ui/Primitivos'
import { useSesion } from './SesionContexto'
import { FormularioCredenciales } from './FormularioCredenciales'

/**
 * TR-05. La sesión de ocho horas terminó o fue revocada. El diálogo se abre
 * encima de la pantalla en curso, que sigue montada: al volver a entrar con la
 * misma cuenta, el trabajo sin guardar sigue ahí. Si entra otra cuenta, se va
 * al inicio de ese perfil, porque la pantalla anterior no le pertenece.
 */
export function DialogoSesionExpirada() {
  const { expirada, usuario, descartar } = useSesion()
  const navegar = useNavigate()
  const [correo] = useState(() => usuario?.correo ?? '')

  return (
    <Dialog.Root open={expirada}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-vino-900/50 backdrop-blur-[2px]" />
        <Dialog.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-vino-100 bg-white p-6 shadow-elevada"
        >
          <Dialog.Title className="text-xl font-bold text-vino-800">Tu sesión terminó</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-texto-gris">
            Por seguridad, la sesión dura como máximo ocho horas. Vuelve a entrar para continuar donde estabas; lo
            que tenías en pantalla se conserva.
          </Dialog.Description>
          <div className="mt-5">
            <FormularioCredenciales
              correoInicial={correo}
              textoBoton="Volver a entrar"
              alEntrar={(nuevo) => {
                if (usuario && nuevo.id !== usuario.id) navegar(RUTA_INICIAL[nuevo.rol], { replace: true })
              }}
            />
          </div>
          <div className="mt-3 flex justify-center">
            <Boton
              variante="texto"
              onClick={() => {
                descartar()
                navegar('/ingresar', { replace: true })
              }}
            >
              Salir
            </Boton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
