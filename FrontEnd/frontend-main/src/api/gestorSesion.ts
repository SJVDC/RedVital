import type { TokenEmitido } from '@/shared/tipos'
import { ErrorApi } from './errores'
import { almacenToken } from './token'

/**
 * Coordina la renovacion del token de acceso (ADR-008: token de 15 minutos,
 * sesion de 8 horas).
 *
 * Toda llamada autenticada pasa por `conSesion`. Si el servicio responde 401
 * y habia token, se renueva una sola vez con la cookie de renovacion y se
 * repite la llamada. Varias llamadas que fallan a la vez comparten la misma
 * renovacion: el secreto de la cookie rota en cada uso, y dos renovaciones
 * simultaneas harian que el servicio detectara reutilizacion y revocara la
 * sesion entera.
 *
 * Si la renovacion se rechaza, la sesion termino (RF-24) y se avisa a los
 * suscriptores con `expirada`, que es lo que muestra el dialogo de sesion
 * expirada sin desmontar la pantalla en curso.
 */

export type EventoSesion = 'renovada' | 'expirada'

class GestorSesion {
  private renovador: (() => Promise<TokenEmitido>) | null = null
  private enCurso: Promise<boolean> | null = null
  private oyentes = new Set<(evento: EventoSesion) => void>()

  configurarRenovador(renovador: () => Promise<TokenEmitido>) {
    this.renovador = renovador
  }

  suscribir(oyente: (evento: EventoSesion) => void) {
    this.oyentes.add(oyente)
    return () => {
      this.oyentes.delete(oyente)
    }
  }

  private emitir(evento: EventoSesion) {
    for (const oyente of this.oyentes) oyente(evento)
  }

  /**
   * Pide un token nuevo. Devuelve falso si no hay sesion que renovar. Un
   * fallo de red no da la sesion por terminada: solo un 401 lo hace.
   */
  renovar(): Promise<boolean> {
    const renovador = this.renovador
    if (!renovador) return Promise.resolve(false)
    if (!this.enCurso) {
      const habiaSesion = almacenToken.obtener() !== null
      this.enCurso = renovador()
        .then((emitido) => {
          almacenToken.establecer(emitido.tokenAcceso)
          this.emitir('renovada')
          return true
        })
        .catch((e: unknown) => {
          if (e instanceof ErrorApi && e.estado === 401) {
            almacenToken.limpiar()
            if (habiaSesion) this.emitir('expirada')
          }
          return false
        })
        .finally(() => {
          this.enCurso = null
        })
    }
    return this.enCurso
  }

  async conSesion<T>(llamada: (token: string | null) => Promise<T>): Promise<T> {
    const token = almacenToken.obtener()
    try {
      return await llamada(token)
    } catch (e) {
      if (e instanceof ErrorApi && e.estado === 401 && token) {
        if (await this.renovar()) return llamada(almacenToken.obtener())
      }
      throw e
    }
  }
}

export const gestorSesion = new GestorSesion()
