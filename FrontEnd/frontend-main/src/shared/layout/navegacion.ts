import type { RolId } from '@/shared/tipos'

export type IconoNav =
  | 'gota'
  | 'corazon'
  | 'persona'
  | 'registro'
  | 'medalla'
  | 'buscar'
  | 'inventario'
  | 'alerta'
  | 'calendario'

export interface EntradaNav {
  etiqueta: string
  ruta: string
  icono: IconoNav
  /** Perfiles que ven esta entrada (matriz del SRS V4.0, sección 4). */
  roles: RolId[]
}

/**
 * Única fuente de la navegación (TR-03, RNF-02). Una entrada cuyo perfil no
 * está en `roles` no se dibuja: no aparece deshabilitada ni con candado.
 *
 * Solo figuran los módulos con servicio desplegado. Transferencias, bitácora,
 * jerarquía territorial y analítica dependen del Servicio Institucional, que
 * aún no existe, y por eso no se ofrecen.
 */
export const NAVEGACION: EntradaNav[] = [
  // Visitante sin sesión (U1)
  { etiqueta: 'Inicio', ruta: '/', icono: 'corazon', roles: ['U1'] },
  { etiqueta: 'Quiero donar', ruta: '/donar', icono: 'gota', roles: ['U1'] },
  { etiqueta: 'Jornadas', ruta: '/jornadas', icono: 'calendario', roles: ['U1', 'U2'] },
  { etiqueta: 'Consultar mi registro', ruta: '/donar/consulta', icono: 'buscar', roles: ['U1'] },

  // M1 — Donante registrado (U2)
  { etiqueta: 'Mi perfil', ruta: '/donantes/perfil', icono: 'persona', roles: ['U2'] },
  { etiqueta: 'Mi historial', ruta: '/donantes/historial', icono: 'registro', roles: ['U2'] },
  { etiqueta: 'Mis reconocimientos', ruta: '/donantes/reconocimientos', icono: 'medalla', roles: ['U2'] },

  // M3 — Trazabilidad (U3 escribe, U4 consulta)
  { etiqueta: 'Registrar donación', ruta: '/ciclovida/registro-donacion', icono: 'gota', roles: ['U3'] },
  { etiqueta: 'Unidades', ruta: '/ciclovida/unidades', icono: 'registro', roles: ['U3', 'U4'] },
  // M1 — Solo el operador busca al donante presente
  { etiqueta: 'Consultar donante', ruta: '/donantes/consulta', icono: 'buscar', roles: ['U3'] },

  // M4 — Inventario y alertas
  { etiqueta: 'Inventario', ruta: '/inventario', icono: 'inventario', roles: ['U3', 'U4'] },
  { etiqueta: 'Alertas', ruta: '/inventario/alertas', icono: 'alerta', roles: ['U3', 'U4'] },

  // M2 — Campañas de la jurisdicción
  { etiqueta: 'Campañas', ruta: '/campanias', icono: 'calendario', roles: ['U3', 'U4', 'U5', 'U6'] },
]

export function navegacionDe(rol: RolId): EntradaNav[] {
  return NAVEGACION.filter((entrada) => entrada.roles.includes(rol))
}

/** Primera pantalla con sentido para cada perfil al entrar. */
export const RUTA_INICIAL: Record<RolId, string> = {
  U1: '/',
  U2: '/donantes/perfil',
  U3: '/ciclovida/unidades',
  U4: '/inventario',
  U5: '/campanias',
  U6: '/campanias',
  U7: '/sin-modulos',
}

/** Rutas a las que puede volver un perfil después de iniciar sesión. */
export function rutaPermitida(rol: RolId, ruta: string): boolean {
  if (ruta === '/ingresar' || ruta === '/registro') return false
  return NAVEGACION.some(
    (e) => e.roles.includes(rol) && e.ruta !== '/' && (ruta === e.ruta || ruta.startsWith(e.ruta + '/')),
  )
}
