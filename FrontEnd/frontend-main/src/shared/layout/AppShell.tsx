import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { DialogoSesionExpirada } from '@/shared/sesion/DialogoSesionExpirada'
import { esInstitucional } from '@/shared/datos/roles'
import { navegacionDe, RUTA_INICIAL } from './navegacion'
import type { IconoNav } from './navegacion'
import { unir } from '@/shared/ui/Primitivos'
import { Marca } from './Isotipo'
import {
  IconoAlerta,
  IconoBuscar,
  IconoCalendario,
  IconoCorazon,
  IconoEntrar,
  IconoGota,
  IconoInventario,
  IconoMedalla,
  IconoPersona,
  IconoRegistro,
  IconoSalir,
  IconoUbicacion,
} from '@/shared/ui/Iconos'

const ICONOS: Record<IconoNav, typeof IconoGota> = {
  gota: IconoGota,
  corazon: IconoCorazon,
  persona: IconoPersona,
  registro: IconoRegistro,
  medalla: IconoMedalla,
  buscar: IconoBuscar,
  inventario: IconoInventario,
  alerta: IconoAlerta,
  calendario: IconoCalendario,
}

export function AppShell() {
  const { rol, usuario, cerrarSesion } = useSesion()
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const [saliendo, setSaliendo] = useState(false)
  const entradas = navegacionDe(rol.id)
  const esDonante = rol.id === 'U1' || rol.id === 'U2'

  async function salir() {
    setSaliendo(true)
    await cerrarSesion()
    setSaliendo(false)
    navegar('/', { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col bg-crema">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-vino-600 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-30">
        <div className="border-b border-vino-700/40 bg-vino-600/95 text-white backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
            <Link to={RUTA_INICIAL[rol.id]} aria-label="RedVital, ir al inicio" className="rounded-suave">
              <Marca compacto latiendo colorFondo="var(--color-vino-600)" />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              {usuario ? (
                <button
                  type="button"
                  onClick={salir}
                  disabled={saliendo}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                >
                  <IconoSalir className="h-4 w-4" />
                  {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
                </button>
              ) : (
                <>
                  <Link
                    to="/registro"
                    className="hidden min-h-11 items-center rounded-full px-4 text-sm font-bold text-vino-100 transition-colors hover:text-white sm:inline-flex"
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    to="/ingresar"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-vino-700 shadow-nivel-1 transition-colors hover:bg-vino-50"
                  >
                    <IconoEntrar className="h-4 w-4" />
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>

          {entradas.length > 0 && (
            <nav aria-label="Navegación principal" className="border-t border-white/10">
              <ul className="mx-auto flex max-w-7xl flex-wrap gap-0.5 px-3">
                {entradas.map((entrada) => {
                  const Icono = ICONOS[entrada.icono]
                  return (
                    <li key={entrada.ruta}>
                      <NavLink
                        to={entrada.ruta}
                        end={entrada.ruta === '/' || entrada.ruta === '/inventario' || entrada.ruta === '/donar'}
                        className={({ isActive }) =>
                          unir(
                            'group relative flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm font-bold transition-colors duration-[var(--dur-rapida)]',
                            isActive ? 'text-white' : 'text-vino-100/80 hover:text-white',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icono
                              className={unir(
                                'h-4 w-4 transition-opacity duration-[var(--dur-rapida)]',
                                isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100',
                              )}
                            />
                            {entrada.etiqueta}
                            <span
                              aria-hidden="true"
                              className={unir(
                                'absolute inset-x-2 bottom-0 h-0.5 origin-center rounded-full bg-white transition-transform duration-[var(--dur-media)] ease-salida',
                                isActive ? 'scale-x-100' : 'scale-x-0',
                              )}
                            />
                          </>
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}
        </div>

        {/* El ámbito visible siempre está declarado (RNF-02). */}
        {usuario && (
          <div className="border-b border-vino-100 bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 text-xs">
              <span className="flex items-center gap-1.5 text-texto-gris">
                <IconoPersona className="h-3.5 w-3.5 text-vino-400" />
                <strong className="font-bold text-vino-700">{usuario.nombre ?? usuario.correo}</strong>
                <span className="text-texto-tenue">· {rol.nombre}</span>
              </span>
              {esInstitucional(rol.id) && (
                <span className="flex items-center gap-1.5 text-texto-gris">
                  <IconoUbicacion className="h-3.5 w-3.5 text-vino-400" />
                  {usuario.jurisdiccion.etiqueta}
                </span>
              )}
            </div>
          </div>
        )}
      </header>

      <main
        id="contenido"
        key={ubicacion.pathname}
        className={unir('animate-entrar-panel mx-auto w-full flex-1 px-4 py-8', esDonante ? 'max-w-5xl' : 'max-w-7xl')}
      >
        <Outlet />
      </main>

      <footer className="mt-8 border-t border-vino-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-texto-tenue">
          <span>RedVital — Plataforma nacional de donación de sangre. Arkhé Software S.A.S.</span>
          <span>De la raíz a la red</span>
        </div>
      </footer>

      <DialogoSesionExpirada />
    </div>
  )
}
