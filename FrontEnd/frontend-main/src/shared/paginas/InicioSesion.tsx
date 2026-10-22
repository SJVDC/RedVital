import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { FormularioCredenciales } from '@/shared/sesion/FormularioCredenciales'
import { RUTA_INICIAL, rutaPermitida } from '@/shared/layout/navegacion'
import { Isotipo, Marca } from '@/shared/layout/Isotipo'
import { Tarjeta } from '@/shared/ui/Primitivos'
import { useTituloPagina } from '@/shared/useTituloPagina'

/**
 * TR-01 — Inicio de sesión de los perfiles con cuenta (U2 a U7). El donante
 * anónimo no inicia sesión: dona con su código.
 */
export function InicioSesion() {
  useTituloPagina('Iniciar sesión')
  const { estado, usuario } = useSesion()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const desde = (ubicacion.state as { desde?: string } | null)?.desde

  if (estado === 'activa' && usuario) return <Navigate to={RUTA_INICIAL[usuario.rol]} replace />

  return (
    <div className="flex min-h-full items-center justify-center bg-crema px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-panel border border-vino-100 bg-white shadow-elevada md:grid-cols-2">
        <section className="relative hidden flex-col justify-between bg-vino-600 p-10 text-white md:flex">
          <Marca latiendo colorFondo="var(--color-vino-600)" />
          <div>
            <Isotipo className="h-24 w-24 text-white" colorFondo="var(--color-vino-600)" animado ritmo="ambiente" />
            <p className="mt-6 text-2xl font-bold leading-snug">De la raíz a la red.</p>
            <p className="mt-2 text-sm leading-relaxed text-vino-100">
              Cada unidad trazable desde la donación hasta su destino, sin exponer datos de salud.
            </p>
          </div>
          <p className="text-xs text-vino-100/80">Plataforma nacional de donación de sangre</p>
        </section>

        <section className="p-6 sm:p-10">
          <div className="md:hidden">
            <Marca colorFondo="#ffffff" className="text-vino-700" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-vino-800 md:mt-0">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-texto-gris">Entra con el correo y la contraseña de tu cuenta.</p>

          <Tarjeta className="mt-6 border-none p-0 shadow-none">
            <FormularioCredenciales
              alEntrar={(u) => navegar(desde && rutaPermitida(u.rol, desde) ? desde : RUTA_INICIAL[u.rol], { replace: true })}
            />
          </Tarjeta>

          <div className="mt-8 space-y-2 border-t border-vino-100 pt-5 text-sm text-texto-gris">
            <p>
              ¿Quieres donar y aún no tienes cuenta?{' '}
              <Link to="/registro" className="font-bold text-vino-700 underline-offset-4 hover:underline">
                Crea tu cuenta
              </Link>
            </p>
            <p>
              También puedes donar sin cuenta:{' '}
              <Link to="/donar" className="font-bold text-vino-700 underline-offset-4 hover:underline">
                regístrate de forma anónima
              </Link>
              .
            </p>
            <p>
              <Link to="/" className="text-texto-tenue underline-offset-4 hover:underline">
                Volver al inicio
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
