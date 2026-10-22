import { Suspense, lazy } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/shared/layout/AppShell'
import { RUTA_INICIAL } from '@/shared/layout/navegacion'
import { RutaProtegida } from '@/shared/sesion/RutaProtegida'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { CargandoRedVital } from '@/shared/ui/Cargando'
import type { RolId } from '@/shared/tipos'

/**
 * Rutas de la aplicación. Cada perfil ve solo los módulos con servicio
 * desplegado (matriz del SRS V4.0 recortada por el alcance vigente): M1, M3 y
 * M4 en Donación, M2 en Campañas. Transferencias, bitácora, red territorial y
 * analítica esperan al Servicio Institucional.
 *
 * Cada módulo se carga por separado: el donante que entra a registrarse no
 * descarga el código del inventario.
 */

// Transversal
const InicioSesion = pagina(() => import('@/shared/paginas/InicioSesion'), 'InicioSesion')
const SinModulos = pagina(() => import('@/shared/paginas/SinModulos'), 'SinModulos')
const Denegacion = pagina(() => import('@/shared/paginas/Denegacion'), 'Denegacion')
const NoEncontrado = pagina(() => import('@/shared/paginas/NoEncontrado'), 'NoEncontrado')

// M1 — Gestión de Donantes
const Bienvenida = pagina(() => import('@/modules/donantes/pages/Bienvenida'), 'Bienvenida')
const RegistroAnonimo = pagina(() => import('@/modules/donantes/pages/RegistroAnonimo'), 'RegistroAnonimo')
const ConsultaRegistro = pagina(() => import('@/modules/donantes/pages/ConsultaRegistro'), 'ConsultaRegistro')
const CrearCuenta = pagina(() => import('@/modules/donantes/pages/CrearCuenta'), 'CrearCuenta')
const MiPerfil = pagina(() => import('@/modules/donantes/pages/MiPerfil'), 'MiPerfil')
const MiHistorial = pagina(() => import('@/modules/donantes/pages/MiHistorial'), 'MiHistorial')
const MisReconocimientos = pagina(() => import('@/modules/donantes/pages/MisReconocimientos'), 'MisReconocimientos')
const ConsultaDonante = pagina(() => import('@/modules/donantes/pages/ConsultaDonante'), 'ConsultaDonante')

// M2 — Campañas
const Jornadas = pagina(() => import('@/modules/campanas/pages/Jornadas'), 'Jornadas')
const CampaniasJurisdiccion = pagina(() => import('@/modules/campanas/pages/CampaniasJurisdiccion'), 'CampaniasJurisdiccion')

// M3 — Ciclo de vida de la unidad
const RegistroDonacion = pagina(() => import('@/modules/ciclovida/pages/RegistroDonacion'), 'RegistroDonacion')
const ListaUnidades = pagina(() => import('@/modules/ciclovida/pages/ListaUnidades'), 'ListaUnidades')
const DetalleUnidad = pagina(() => import('@/modules/ciclovida/pages/DetalleUnidad'), 'DetalleUnidad')

// M4 — Inventario y alertas
const PanelInventario = pagina(() => import('@/modules/inventario/pages/PanelInventario'), 'PanelInventario')
const Alertas = pagina(() => import('@/modules/inventario/pages/Alertas'), 'Alertas')

export function App() {
  return (
    <Routes>
      <Route path="ingresar" element={<Carga><InicioSesion /></Carga>} />

      <Route element={<AppShell />}>
        {/* Público (U1). Quien tiene sesión también puede verlo. */}
        <Route index element={<Inicio />} />
        <Route path="donar" element={<Carga><RegistroAnonimo /></Carga>} />
        <Route path="donar/consulta" element={<Carga><ConsultaRegistro /></Carga>} />
        <Route path="jornadas" element={<Carga><Jornadas /></Carga>} />
        <Route path="registro" element={<Carga><CrearCuenta /></Carga>} />

        {/* M1 — Donante con cuenta (U2) */}
        <Route path="donantes/perfil" element={<Protegida roles={['U2']}><MiPerfil /></Protegida>} />
        <Route path="donantes/historial" element={<Protegida roles={['U2']}><MiHistorial /></Protegida>} />
        <Route path="donantes/reconocimientos" element={<Protegida roles={['U2']}><MisReconocimientos /></Protegida>} />
        <Route path="donantes/consulta" element={<Protegida roles={['U3']}><ConsultaDonante /></Protegida>} />

        {/* M3 */}
        <Route path="ciclovida/registro-donacion" element={<Protegida roles={['U3']}><RegistroDonacion /></Protegida>} />
        <Route path="ciclovida/unidades" element={<Protegida roles={['U3', 'U4']}><ListaUnidades /></Protegida>} />
        <Route path="ciclovida/unidades/:id" element={<Protegida roles={['U3', 'U4']}><DetalleUnidad /></Protegida>} />

        {/* M4 */}
        <Route path="inventario" element={<Protegida roles={['U3', 'U4']}><PanelInventario /></Protegida>} />
        <Route path="inventario/alertas" element={<Protegida roles={['U3', 'U4']}><Alertas /></Protegida>} />

        {/* M2 institucional */}
        <Route path="campanias" element={<Protegida roles={['U3', 'U4', 'U5', 'U6']}><CampaniasJurisdiccion /></Protegida>} />

        {/* Transversal */}
        <Route path="sin-modulos" element={<Protegida roles={['U7']}><SinModulos /></Protegida>} />
        <Route path="denegado" element={<Carga><Denegacion /></Carga>} />
        <Route path="*" element={<Carga><NoEncontrado /></Carga>} />
      </Route>
    </Routes>
  )
}

function Carga({ children }: { children: ReactNode }) {
  return <Suspense fallback={<CargandoRedVital />}>{children}</Suspense>
}

function Protegida({ roles, children }: { roles: RolId[]; children: ReactNode }) {
  return (
    <RutaProtegida roles={roles}>
      <Carga>{children}</Carga>
    </RutaProtegida>
  )
}

/** El visitante ve la portada; quien tiene sesión, su primera pantalla. */
function Inicio() {
  const { usuario } = useSesion()
  if (usuario) return <Navigate to={RUTA_INICIAL[usuario.rol]} replace />
  return (
    <Carga>
      <Bienvenida />
    </Carga>
  )
}

/**
 * Envuelve una importación diferida y toma la exportación con nombre del
 * módulo, para que un cambio de nombre falle en compilación.
 */
function pagina<N extends string>(importar: () => Promise<Record<N, ComponentType>>, nombre: N) {
  return lazy(async () => ({ default: (await importar())[nombre] }))
}
