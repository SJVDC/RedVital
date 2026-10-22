import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAccion } from '@/shared/consulta/useConsulta'
import { codigoLegible, fecha } from '@/shared/formato'
import { GuardarCodigo } from '@/modules/donantes/GuardarCodigo'
import { Aviso, Boton, CampoTexto, MensajeError, Tarjeta, TituloSeccion } from '@/shared/ui/Primitivos'
import { IconoBuscar } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Intencion } from '@/shared/tipos'

/**
 * M1-U1-06 — Consulta con el código del registro anónimo
 * (GET /v1/intenciones/{codigo}). Responde por el registro, nunca por la
 * donación: no revela si la donación llegó a producirse ni nada de sus
 * unidades (RNF-01).
 */
export function ConsultaRegistro() {
  useTituloPagina('Consultar mi registro')
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<Intencion | null>(null)
  const consulta = useAccion((api, c: string) => api.donantes.consultarIntencion(c))

  async function consultar(e: FormEvent) {
    e.preventDefault()
    setResultado(null)
    const r = await consulta.ejecutar(codigo.replace(/[\s-]/g, '').toUpperCase())
    if (r) setResultado(r)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <TituloSeccion
        etiqueta="Registro anónimo"
        descripcion="Escribe el código que recibiste al registrarte. Lo puedes escribir con o sin guiones."
      >
        Consultar mi registro
      </TituloSeccion>

      <Tarjeta>
        <form onSubmit={consultar} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <CampoTexto
              id="codigo-registro"
              etiqueta="Código de donación"
              valor={codigo}
              onCambio={setCodigo}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={14}
              autoComplete="off"
            />
          </div>
          <Boton tipo="submit" icono={<IconoBuscar />} cargando={consulta.enCurso} deshabilitado={codigo.trim().length < 12}>
            Consultar
          </Boton>
        </form>
        {consulta.error && (
          <div className="mt-4">
            <MensajeError>
              {consulta.error.estado === 404
                ? 'No encontramos un registro con ese código. Revisa que esté bien escrito.'
                : consulta.error.estado === 429
                  ? 'Hiciste demasiadas consultas seguidas. Espera un minuto antes de volver a intentarlo.'
                  : 'No pudimos hacer la consulta. Inténtalo de nuevo en unos momentos.'}
            </MensajeError>
          </div>
        )}
      </Tarjeta>

      {resultado && <Resultado intencion={resultado} />}
    </div>
  )
}

function Resultado({ intencion }: { intencion: Intencion }) {
  const codigo = codigoLegible(intencion.codigo)
  if (intencion.estado === 'pendiente') {
    return (
      <div className="space-y-4">
        <Aviso tono="exito" titulo={`Tu registro ${codigo} está vigente`}>
          Puedes presentarlo en cualquier punto de donación hasta el {fecha(intencion.expiraEn)}.{' '}
          <Link to="/jornadas" className="font-bold underline underline-offset-4">
            Ver jornadas
          </Link>
        </Aviso>
        <GuardarCodigo codigo={intencion.codigo} expiraEn={intencion.expiraEn} />
      </div>
    )
  }
  if (intencion.estado === 'atendida') {
    return (
      <Aviso tono="informacion" titulo={`El registro ${codigo} ya se presentó en un punto de donación`}>
        Gracias por donar. Si quieres volver a hacerlo, puedes registrarte de nuevo cuando quieras.
      </Aviso>
    )
  }
  return (
    <Aviso tono="operativo" titulo={`El registro ${codigo} venció`}>
      Venció el {fecha(intencion.expiraEn)} sin presentarse. Si aún quieres donar,{' '}
      <Link to="/donar" className="font-bold underline underline-offset-4">
        regístrate de nuevo
      </Link>
      .
    </Aviso>
  )
}
