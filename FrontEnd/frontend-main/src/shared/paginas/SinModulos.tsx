import { useSesion } from '@/shared/sesion/SesionContexto'
import { Aviso, TituloSeccion } from '@/shared/ui/Primitivos'

/**
 * Perfil con sesión pero sin módulos disponibles en esta versión. El auditor
 * (U7) trabaja sobre la bitácora y la trazabilidad, que se consultan a través
 * del Servicio Institucional, todavía no desplegado.
 */
export function SinModulos() {
  const { rol } = useSesion()
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <TituloSeccion etiqueta={rol.nombre}>Aún no hay módulos disponibles para tu perfil</TituloSeccion>
      <Aviso tono="informacion" titulo="Tu acceso está activo">
        Tu cuenta y tu jurisdicción están vigentes. Las consultas de tu perfil se habilitarán en esta misma
        aplicación cuando el servicio que las atiende entre en operación; no tienes que hacer nada.
      </Aviso>
    </div>
  )
}
