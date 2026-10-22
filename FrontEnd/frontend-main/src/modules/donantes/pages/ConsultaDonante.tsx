import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccion } from '@/shared/consulta/useConsulta'
import { fecha } from '@/shared/formato'
import { Aviso, Boton, CampoTexto, Dato, EstadoVacio, MensajeError, Tarjeta, TituloSeccion } from '@/shared/ui/Primitivos'
import { IconoBuscar, IconoGota, IconoPersona } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { DonantePresente } from '@/shared/tipos'

/**
 * M1-U3-01 — Búsqueda del donante presente (POST /v1/donantes/busqueda).
 * M1-U3-02 — Donante no elegible.
 *
 * El documento viaja en el cuerpo, nunca en la ruta ni en la consulta: no
 * queda en registros de acceso ni en el historial del navegador.
 *
 * RNF-01: el operador ve la fecha y el bloqueo, nunca la causa.
 */
export function ConsultaDonante() {
  useTituloPagina('Consultar donante')
  const navegar = useNavigate()
  const [documento, setDocumento] = useState('')
  const [resultado, setResultado] = useState<DonantePresente | null>(null)
  const busqueda = useAccion((api, doc: string) => api.donantes.buscarDonantePresente(doc))

  async function buscar(e: FormEvent) {
    e.preventDefault()
    setResultado(null)
    const r = await busqueda.ejecutar(documento.trim())
    if (r) setResultado(r)
  }

  const noEncontrado = busqueda.error?.estado === 404

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <TituloSeccion descripcion="Consulta de solo lectura para asociar una donación a la persona presente. No incluye historia clínica.">
        Consultar donante
      </TituloSeccion>

      <Tarjeta>
        <form onSubmit={buscar} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <CampoTexto
              id="documento-donante"
              etiqueta="Número de documento"
              valor={documento}
              onCambio={(v) => {
                setDocumento(v)
                setResultado(null)
                busqueda.limpiarError()
              }}
              inputMode="numeric"
              autoComplete="off"
              maxLength={20}
            />
          </div>
          <Boton tipo="submit" icono={<IconoBuscar />} cargando={busqueda.enCurso} deshabilitado={documento.trim().length < 5}>
            Buscar
          </Boton>
        </form>
        {busqueda.error && busqueda.error.estado !== 404 && (
          <div className="mt-4">
            <MensajeError>No pudimos hacer la búsqueda. Inténtalo de nuevo en unos momentos.</MensajeError>
          </div>
        )}
      </Tarjeta>

      {noEncontrado && (
        <EstadoVacio
          titulo="No hay una cuenta de donante con ese documento"
          icono={<IconoPersona />}
          accion={
            <Boton variante="secundario" icono={<IconoGota />} onClick={() => navegar('/ciclovida/registro-donacion')}>
              Registrar donación sin cuenta
            </Boton>
          }
        >
          La persona puede donar igual: registra la donación con su código de registro anónimo o sin identificar.
        </EstadoVacio>
      )}

      {resultado && (
        <Resultado
          donante={resultado}
          onRegistrar={() => navegar('/ciclovida/registro-donacion', { state: { donante: resultado } })}
        />
      )}
    </div>
  )
}

function Resultado({ donante, onRegistrar }: { donante: DonantePresente; onRegistrar: () => void }) {
  const { elegibilidad } = donante
  if (elegibilidad.elegible) {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Dato etiqueta="Donante" valor={<span className="text-xl">{donante.nombre}</span>} />
          <Dato etiqueta="Elegibilidad" valor="Vigente" nota="Puede donar hoy" />
        </div>
        <Tarjeta>
          <p className="text-sm text-texto-gris">Verifica la identidad con el documento físico antes de continuar.</p>
          <div className="mt-4">
            <Boton conFlecha onClick={onRegistrar}>
              Registrar donación
            </Boton>
          </div>
        </Tarjeta>
      </>
    )
  }
  return (
    <Tarjeta>
      <h2 className="text-lg font-bold text-vino-800">{donante.nombre} aún no es elegible</h2>
      <p className="mt-2 text-sm text-texto-gris">
        {elegibilidad.elegibleDesde ? (
          <>
            Podrá donar a partir del <strong className="text-vino-700">{fecha(elegibilidad.elegibleDesde)}</strong>. No es
            posible registrar una donación antes de esa fecha.
          </>
        ) : (
          'No es posible registrar una donación para esta persona.'
        )}
      </p>
      <div className="mt-4">
        {/* RNF-01: el operador tampoco ve el motivo. */}
        <Aviso tono="operativo" titulo="Registro bloqueado">
          El sistema no muestra el motivo de la no elegibilidad. Si el donante pregunta, remítelo al procedimiento de
          atención del banco.
        </Aviso>
      </div>
    </Tarjeta>
  )
}
