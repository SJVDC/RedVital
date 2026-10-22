import { StrictMode } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { crearApi, ProveedorApi } from '@/api'
import { ErrorInesperado } from '@/shared/paginas/ErrorInesperado'
import { ProveedorSesion, useSesion } from '@/shared/sesion/SesionContexto'
import { CargandoRedVital } from '@/shared/ui/Cargando'
import '@fontsource/atkinson-hyperlegible/400.css'
import '@fontsource/atkinson-hyperlegible/400-italic.css'
import '@fontsource/atkinson-hyperlegible/700.css'
import './styles/tema.css'

const contenedor = document.getElementById('root')
if (!contenedor) {
  throw new Error('No se encontró el elemento #root en index.html')
}

const api = crearApi()

/**
 * Mientras se intenta restaurar la sesión con la cookie de renovación no se
 * dibuja ninguna ruta: así una ruta protegida no manda a iniciar sesión a
 * quien ya tenía una sesión vigente.
 */
function TrasRestaurarSesion({ children }: { children: ReactNode }) {
  const { estado } = useSesion()
  if (estado === 'iniciando') return <CargandoRedVital />
  return <>{children}</>
}

createRoot(contenedor).render(
  <StrictMode>
    <ErrorInesperado>
      <BrowserRouter>
        <ProveedorApi api={api}>
          <ProveedorSesion>
            <TrasRestaurarSesion>
              <App />
            </TrasRestaurarSesion>
          </ProveedorSesion>
        </ProveedorApi>
      </BrowserRouter>
    </ErrorInesperado>
  </StrictMode>,
)
