import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import type { ErrorApi } from '@/api/errores'
import { comoErrorApi } from '@/api/errores'
import type { UsuarioSesion } from '@/shared/tipos'
import { Boton, MensajeError } from '@/shared/ui/Primitivos'
import { IconoEntrar, IconoOjo, IconoOjoTachado } from '@/shared/ui/Iconos'
import { useSesion } from './SesionContexto'

/**
 * Formulario de correo y contraseña (TR-01). Ante credenciales incorrectas el
 * mensaje no dice cuál de los dos datos falló (TR-02, RF-23) y sí dice qué
 * hacer.
 */
export function FormularioCredenciales({
  correoInicial = '',
  textoBoton = 'Iniciar sesión',
  alEntrar,
}: {
  correoInicial?: string
  textoBoton?: string
  alEntrar: (usuario: UsuarioSesion) => void
}) {
  const { iniciarSesion } = useSesion()
  const id = useId()
  const [correo, setCorreo] = useState(correoInicial)
  const [credencial, setCredencial] = useState('')
  const [visible, setVisible] = useState(false)
  const [enCurso, setEnCurso] = useState(false)
  const [error, setError] = useState<ErrorApi | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!correo.trim() || !credencial) return
    setEnCurso(true)
    setError(null)
    try {
      const usuario = await iniciarSesion(correo.trim(), credencial)
      setCredencial('')
      alEntrar(usuario)
    } catch (err) {
      setError(comoErrorApi(err))
    } finally {
      setEnCurso(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <div>
        <label htmlFor={`${id}-correo`} className="block text-sm font-bold text-vino-800">
          Correo electrónico
        </label>
        <input
          id={`${id}-correo`}
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="mt-2 min-h-11 w-full rounded-suave border border-vino-200 bg-white px-4 text-sm text-vino-800 focus:border-vino-500"
        />
      </div>
      <div>
        <label htmlFor={`${id}-credencial`} className="block text-sm font-bold text-vino-800">
          Contraseña
        </label>
        <div className="relative mt-2">
          <input
            id={`${id}-credencial`}
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={credencial}
            onChange={(e) => setCredencial(e.target.value)}
            className="min-h-11 w-full rounded-suave border border-vino-200 bg-white px-4 pr-12 text-sm text-vino-800 focus:border-vino-500"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-suave text-vino-600 hover:bg-vino-50"
          >
            {visible ? <IconoOjoTachado className="h-5 w-5" /> : <IconoOjo className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {error && <MensajeError>{mensajeDeError(error)}</MensajeError>}

      <Boton tipo="submit" ancho icono={<IconoEntrar />} cargando={enCurso} deshabilitado={!correo.trim() || !credencial}>
        {textoBoton}
      </Boton>
    </form>
  )
}

function mensajeDeError(error: ErrorApi): string {
  if (error.estado === 401) {
    return 'El correo o la contraseña no son correctos. Revisa que estén bien escritos e inténtalo de nuevo. Si no recuerdas tu contraseña, comunícate con el banco de sangre o con el administrador de tu institución.'
  }
  if (error.estado === 429) {
    return 'Hiciste demasiados intentos seguidos. Espera un minuto antes de volver a intentarlo.'
  }
  if (error.estado === 0) {
    return 'No pudimos comunicarnos con RedVital. Revisa tu conexión e inténtalo de nuevo.'
  }
  return 'No fue posible iniciar sesión en este momento. Inténtalo de nuevo en unos minutos.'
}
