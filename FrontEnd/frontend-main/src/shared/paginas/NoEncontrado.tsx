import { useNavigate } from 'react-router-dom'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { RUTA_INICIAL } from '@/shared/layout/navegacion'
import { Boton, Tarjeta } from '@/shared/ui/Primitivos'

/**
 * TR-09 — Recurso no encontrado. Se distingue a propósito de la denegación por
 * jurisdicción: «no existe» y «existe pero no te corresponde» son respuestas
 * distintas, y confundirlas filtra información. Este texto nunca menciona
 * jurisdicciones.
 */
export function NoEncontrado() {
  const navegar = useNavigate()
  const { rol } = useSesion()
  return (
    <div className="mx-auto max-w-xl">
      <Tarjeta>
        <h1 className="text-2xl font-bold text-vino-800">No encontramos esta página</h1>
        <p className="mt-3 text-sm text-texto-gris">
          La dirección que abriste no corresponde a ninguna pantalla disponible. Puede que el enlace esté
          desactualizado.
        </p>
        <div className="mt-6">
          <Boton onClick={() => navegar(RUTA_INICIAL[rol.id])}>Volver al inicio</Boton>
        </div>
      </Tarjeta>
    </div>
  )
}
