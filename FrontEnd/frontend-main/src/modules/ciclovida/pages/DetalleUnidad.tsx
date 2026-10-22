import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Api } from '@/api/contratos'
import type { ErrorApi } from '@/api/errores'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { ETIQUETA_COMPONENTE, ETIQUETA_OBSERVACION, tituloEventoUnidad } from '@/shared/datos/catalogos'
import { fecha, fechaHora, idCorto } from '@/shared/formato'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { DialogoConfirmacion } from '@/shared/ui/DialogoConfirmacion'
import { InsigniaEstadoUnidad } from '@/shared/ui/EstadoUnidad'
import { Boton, CampoTexto, Dato, Tarjeta, TituloSeccion } from '@/shared/ui/Primitivos'
import { IconoReloj } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { EventoUnidad, Unidad } from '@/shared/tipos'

/**
 * M3-U3-04 — Detalle de la unidad y su recorrido (GET /v1/unidades/{id} y /eventos).
 * M3-U3-05 a 09 — Acciones del operador según el estado (DD V3.0, sección 10).
 *
 * Solo se ofrecen las transiciones que la matriz permite desde el estado
 * actual: la interfaz no deja intentar lo que el servicio rechazaría. El
 * tamizaje es un veredicto sin motivo (RNF-01). Despachar y desechar exigen
 * escribir el identificador completo de la unidad (EC-19, EC-41).
 */

interface DatosUnidad {
  unidad: Unidad
  eventos: EventoUnidad[]
}

type Accion =
  | { tipo: 'fraccionar' }
  | { tipo: 'ingreso' }
  | { tipo: 'tamizaje'; apta: boolean }
  | { tipo: 'reservar' }
  | { tipo: 'liberar' }
  | { tipo: 'despachar' }
  | { tipo: 'disponer' }

export function DetalleUnidad() {
  const { id = '' } = useParams()
  useTituloPagina(`Unidad ${idCorto(id)}`)
  const consulta = useConsulta(
    async (api): Promise<DatosUnidad> => {
      const [unidad, eventos] = await Promise.all([api.trazabilidad.obtenerUnidad(id), api.trazabilidad.listarEventosUnidad(id)])
      return { unidad, eventos }
    },
    [id],
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/ciclovida/unidades" className="text-sm font-bold text-vino-700 underline-offset-4 hover:underline">
        ← Unidades
      </Link>
      <EstadoDeConsulta consulta={consulta} noEncontrado="La unidad no existe o no está bajo custodia de tu banco.">
        {(datos) => <Contenido datos={datos} onCambio={consulta.recargar} />}
      </EstadoDeConsulta>
    </div>
  )
}

function Contenido({ datos, onCambio }: { datos: DatosUnidad; onCambio: () => void }) {
  const { unidad, eventos } = datos
  const { usuario } = useSesion()
  const opera = usuario?.rol === 'U3'
  const [accion, setAccion] = useState<Accion | null>(null)

  return (
    <>
      <TituloSeccion etiqueta={ETIQUETA_COMPONENTE[unidad.componente]}>
        <span className="flex flex-wrap items-center gap-3">
          Unidad {idCorto(unidad.id)}
          <InsigniaEstadoUnidad estado={unidad.estado} tamano="grande" />
        </span>
      </TituloSeccion>
      <p className="-mt-4 break-all font-mono text-xs text-texto-tenue">{unidad.id}</p>

      <div className="grid gap-4 sm:grid-cols-4">
        <Dato etiqueta="Grupo" valor={unidad.grupo} />
        <Dato etiqueta="Captación" valor={<span className="text-lg">{fecha(unidad.fechaCaptacion)}</span>} />
        <Dato etiqueta="Vence" valor={<span className="text-lg">{fecha(unidad.fechaVencimiento)}</span>} />
        <Dato etiqueta="Volumen" valor={unidad.volumenMl ? `${unidad.volumenMl} ml` : '—'} />
      </div>

      {opera && <Acciones unidad={unidad} onElegir={setAccion} />}

      <Tarjeta>
        <h2 className="text-lg font-bold text-vino-800">Recorrido</h2>
        <ol className="mt-5 space-y-0">
          {[...eventos]
            .sort((a, b) => b.ocurridoEn.localeCompare(a.ocurridoEn))
            .map((e, i, lista) => (
              <li key={e.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-vino-400 bg-white" />
                  {i < lista.length - 1 && <span aria-hidden="true" className="w-0.5 flex-1 bg-vino-100" />}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-bold text-vino-800">{tituloEventoUnidad(e.estadoAnterior, e.estadoNuevo)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-texto-tenue">
                    <IconoReloj className="h-3.5 w-3.5" />
                    {fechaHora(e.ocurridoEn)} · {e.actorTipo === 'sistema' ? 'Proceso automático' : 'Personal del banco'}
                    {e.observacion && ` · ${ETIQUETA_OBSERVACION[e.observacion] ?? e.observacion}`}
                  </p>
                </div>
              </li>
            ))}
        </ol>
      </Tarjeta>

      {accion && (
        <DialogoAccion
          unidad={unidad}
          accion={accion}
          onCerrar={() => setAccion(null)}
          onHecho={() => {
            setAccion(null)
            onCambio()
          }}
        />
      )}
    </>
  )
}

function Acciones({ unidad, onElegir }: { unidad: Unidad; onElegir: (a: Accion) => void }) {
  const botones: { texto: string; accion: Accion; variante?: 'primario' | 'secundario' }[] = (() => {
    switch (unidad.estado) {
      case 'captada':
        return [{ texto: 'Confirmar fraccionamiento', accion: { tipo: 'fraccionar' } }]
      case 'fraccionada':
        return [{ texto: 'Ingresar a tamizaje', accion: { tipo: 'ingreso' } }]
      case 'en_tamizaje':
        return [
          { texto: 'Resultado: apta', accion: { tipo: 'tamizaje', apta: true } },
          { texto: 'Resultado: no apta', accion: { tipo: 'tamizaje', apta: false }, variante: 'secundario' },
        ]
      case 'disponible':
        return [{ texto: 'Reservar', accion: { tipo: 'reservar' } }]
      case 'reservada':
        return [
          { texto: 'Despachar', accion: { tipo: 'despachar' } },
          { texto: 'Liberar reserva', accion: { tipo: 'liberar' }, variante: 'secundario' },
        ]
      case 'no_apta':
      case 'vencida':
        return [{ texto: 'Registrar disposición final', accion: { tipo: 'disponer' } }]
      default:
        return []
    }
  })()

  if (botones.length === 0) {
    return (
      <Tarjeta>
        <p className="text-sm text-texto-gris">La unidad terminó su recorrido. No admite más acciones.</p>
      </Tarjeta>
    )
  }
  return (
    <Tarjeta>
      <h2 className="text-base font-bold text-vino-800">Siguiente paso</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {botones.map((b) => (
          <Boton key={b.texto} variante={b.variante ?? 'primario'} onClick={() => onElegir(b.accion)}>
            {b.texto}
          </Boton>
        ))}
      </div>
    </Tarjeta>
  )
}

const TEXTOS: Record<Accion['tipo'], { titulo: string; confirmar: string }> = {
  fraccionar: { titulo: 'Confirmar fraccionamiento', confirmar: 'Confirmar' },
  ingreso: { titulo: 'Ingresar a tamizaje', confirmar: 'Ingresar' },
  tamizaje: { titulo: 'Registrar resultado de tamizaje', confirmar: 'Registrar resultado' },
  reservar: { titulo: 'Reservar unidad', confirmar: 'Reservar' },
  liberar: { titulo: 'Liberar reserva', confirmar: 'Liberar' },
  despachar: { titulo: 'Despachar unidad', confirmar: 'Despachar' },
  disponer: { titulo: 'Registrar disposición final', confirmar: 'Registrar disposición' },
}

function DialogoAccion({ unidad, accion, onCerrar, onHecho }: { unidad: Unidad; accion: Accion; onCerrar: () => void; onHecho: () => void }) {
  const [confirmacion, setConfirmacion] = useState('')
  const pideId = accion.tipo === 'despachar' || accion.tipo === 'disponer'
  const ejecutar = useAccion((api: Api): Promise<unknown> => {
    const t = api.trazabilidad
    switch (accion.tipo) {
      case 'fraccionar':
        return t.confirmarFraccionamiento(unidad.donacionId)
      case 'ingreso':
        return t.iniciarTamizaje(unidad.id)
      case 'tamizaje':
        return t.registrarTamizaje(unidad.id, accion.apta)
      case 'reservar':
        return t.reservarUnidad(unidad.id)
      case 'liberar':
        return t.liberarReserva(unidad.id)
      case 'despachar':
        return t.despacharUnidad(unidad.id, confirmacion.trim())
      case 'disponer':
        return t.disponerUnidad(unidad.id, confirmacion.trim())
    }
  })
  const coincide = confirmacion.trim().toLowerCase() === unidad.id.toLowerCase()

  async function confirmar() {
    const r = await ejecutar.ejecutar()
    if (r !== undefined) onHecho()
  }

  return (
    <DialogoConfirmacion
      abierto
      titulo={TEXTOS[accion.tipo].titulo}
      textoConfirmar={TEXTOS[accion.tipo].confirmar}
      descripcion={descripcion(accion, unidad)}
      onConfirmar={confirmar}
      onCerrar={onCerrar}
      cargando={ejecutar.enCurso}
      confirmarDeshabilitado={pideId && !coincide}
      error={ejecutar.error ? mensajeAccion(ejecutar.error) : null}
    >
      {pideId && (
        <CampoTexto
          id="confirmacion-unidad"
          etiqueta="Identificador de la unidad"
          ayuda="Escanea la etiqueta o escribe el identificador completo para confirmar que es la unidad correcta."
          valor={confirmacion}
          onCambio={setConfirmacion}
          autoComplete="off"
          maxLength={36}
          error={confirmacion && !coincide && confirmacion.length >= 36 ? 'No coincide con esta unidad.' : null}
        />
      )}
    </DialogoConfirmacion>
  )
}

function descripcion(accion: Accion, unidad: Unidad): string {
  const nombre = `${ETIQUETA_COMPONENTE[unidad.componente]} ${unidad.grupo} (${idCorto(unidad.id)})`
  switch (accion.tipo) {
    case 'fraccionar':
      return 'Se confirma el fraccionamiento de la donación completa: todas sus unidades pasan a fraccionadas.'
    case 'ingreso':
      return `La unidad ${nombre} queda en tamizaje.`
    case 'tamizaje':
      return accion.apta
        ? `La unidad ${nombre} queda disponible para uso.`
        : `La unidad ${nombre} queda como no apta. El sistema no registra el motivo.`
    case 'reservar':
      return `La unidad ${nombre} queda reservada y deja de contar como disponible.`
    case 'liberar':
      return `La unidad ${nombre} vuelve a estar disponible.`
    case 'despachar':
      return `La unidad ${nombre} sale del banco para transfusión. Esta acción no se puede deshacer.`
    case 'disponer':
      return `Se registra la disposición final de la unidad ${nombre}. Esta acción no se puede deshacer.`
  }
}

function mensajeAccion(e: ErrorApi): string {
  if (e.tipo === 'unidad-no-vigente') return 'La unidad está vencida o no es apta: no se puede reservar ni despachar.'
  if (e.estado === 409) return 'La unidad cambió de estado mientras tanto. Cierra este diálogo para ver su estado actual.'
  if (e.tipo === 'confirmacion-invalida') return 'El identificador escrito no coincide con esta unidad.'
  if (e.estado === 404) return 'La unidad ya no está bajo custodia de tu banco.'
  return 'No pudimos registrar la acción. Inténtalo de nuevo.'
}
