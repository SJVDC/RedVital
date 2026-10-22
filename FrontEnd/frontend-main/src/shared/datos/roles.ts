import type { Rol, RolCodigo, RolId } from '@/shared/tipos'

/**
 * Los siete perfiles del SRS V4.0 y su correspondencia con el codigo de rol
 * que emite el Servicio de Identidad en la reivindicacion `role` del token.
 *
 * U1 no tiene codigo: el donante anonimo no inicia sesion (RF-23). Es el
 * perfil de cualquier visitante sin sesion.
 */
export const ROLES: Record<RolId, Rol> = {
  U1: {
    id: 'U1',
    codigo: null,
    nombre: 'Donante anónimo',
    descripcion: 'Dona sin entregar datos personales.',
  },
  U2: {
    id: 'U2',
    codigo: 'donante',
    nombre: 'Donante registrado',
    descripcion: 'Tiene perfil, historial y reconocimientos.',
  },
  U3: {
    id: 'U3',
    codigo: 'operador',
    nombre: 'Operador de banco',
    descripcion: 'Registra el ciclo de vida de las unidades que custodia.',
  },
  U4: {
    id: 'U4',
    codigo: 'admin_banco',
    nombre: 'Administrador de banco',
    descripcion: 'Responsable del inventario, los umbrales, las alertas y las campañas de su banco.',
  },
  U5: {
    id: 'U5',
    codigo: 'coordinador',
    nombre: 'Coordinador territorial',
    descripcion: 'Supervisa los bancos de su jurisdicción.',
  },
  U6: {
    id: 'U6',
    codigo: 'admin_nacional',
    nombre: 'Administrador nacional',
    descripcion: 'Vista nacional consolidada.',
  },
  U7: {
    id: 'U7',
    codigo: 'auditor',
    nombre: 'Auditor',
    descripcion: 'Verifica el cumplimiento. No escribe en ningún módulo.',
  },
}

const POR_CODIGO: Record<RolCodigo, RolId> = {
  donante: 'U2',
  operador: 'U3',
  admin_banco: 'U4',
  coordinador: 'U5',
  admin_nacional: 'U6',
  auditor: 'U7',
}

/** Traduce el rol del token al perfil. `null` si el codigo no es de una persona. */
export function rolDesdeCodigo(codigo: string | undefined | null): RolId | null {
  if (!codigo) return null
  return (POR_CODIGO as Record<string, RolId | undefined>)[codigo] ?? null
}

/** Perfiles institucionales: los que operan con jurisdiccion. */
export function esInstitucional(rol: RolId): boolean {
  return rol !== 'U1' && rol !== 'U2'
}
