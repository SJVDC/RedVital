import { useNavigate } from 'react-router-dom'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { RUTA_INICIAL } from '@/shared/layout/navegacion'
import { Boton, Tarjeta } from '@/shared/ui/Primitivos'

/**
 * TR-04 — Denegación por jurisdicción (RNF-02). Nombra la jurisdicción PROPIA,
 * nunca la ajena; no confirma que el recurso exista; dice que el intento quedó
 * registrado y qué hacer.
 */
export function Denegacion() {
  const { usuario, rol } = useSesion()
  const navegar = useNavigate()

  return (
    <div className="mx-auto max-w-2xl">
      <Tarjeta>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-vino-600">Acceso denegado</p>
        <h1 className="mt-2 text-2xl font-bold text-vino-800">Esta consulta está fuera de tu jurisdicción</h1>
        <p className="mt-4 text-sm leading-relaxed text-texto-gris">
          Tu jurisdicción asignada es <strong className="text-vino-700">{usuario?.jurisdiccion.etiqueta}</strong>. La
          información que solicitaste pertenece a otro ámbito y por eso no se muestra.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-texto-gris">
          Si necesitas estos datos para tu trabajo, solicítalos al administrador nacional a través de tu institución.
        </p>
        <div className="mt-5 rounded-suave border border-vino-200 bg-vino-50 p-3 text-xs text-vino-800">
          Este intento quedó registrado en la bitácora de auditoría con tu usuario y la fecha. Es un registro normal de
          control, no una sanción.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Boton onClick={() => navegar(-1)}>Volver a la pantalla anterior</Boton>
          <Boton variante="secundario" onClick={() => navegar(RUTA_INICIAL[rol.id])}>
            Ir a mi inicio
          </Boton>
        </div>
      </Tarjeta>
    </div>
  )
}
