import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ErrorApi } from '@/api/errores'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { COMPONENTES, ETIQUETA_COMPONENTE, GRUPOS_SANGUINEOS } from '@/shared/datos/catalogos'
import { codigoLegible, fecha, fechaCorta, hoy, idCorto } from '@/shared/formato'
import {
  Aviso,
  Boton,
  CampoTexto,
  Fila,
  MensajeError,
  Selector,
  Tabla,
  Tarjeta,
  Td,
  Th,
  TituloSeccion,
  unir,
} from '@/shared/ui/Primitivos'
import { InsigniaEstadoUnidad } from '@/shared/ui/EstadoUnidad'
import { IconoBuscar, IconoVerificado } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Campania, ComponenteSanguineo, Donacion, DonantePresente, GrupoSanguineo, Intencion } from '@/shared/tipos'

/**
 * M3-U3-01 — Registro de la donación (POST /v1/donaciones).
 * M3-U3-02 — Confirmación del fraccionamiento (transición 1).
 *
 * La donación se asocia a una cuenta de donante, a un código de registro
 * anónimo o a nadie. Se crea una unidad por componente en estado `captada` y
 * el fraccionamiento las pasa a `fraccionada`. La campaña es opcional: Donación
 * la valida contra su proyección local de campañas publicadas (EV-03).
 */

type Origen = 'cuenta' | 'codigo' | 'sin_identificar'

const ORIGENES: { id: Origen; titulo: string; texto: string }[] = [
  { id: 'cuenta', titulo: 'Donante con cuenta', texto: 'Se busca por documento.' },
  { id: 'codigo', titulo: 'Registro anónimo', texto: 'Con el código que trae la persona.' },
  { id: 'sin_identificar', titulo: 'Sin identificar', texto: 'Sin cuenta ni código.' },
]

export function RegistroDonacion() {
  useTituloPagina('Registrar donación')
  const ubicacion = useLocation()
  const donanteInicial = (ubicacion.state as { donante?: DonantePresente } | null)?.donante ?? null
  const [donacion, setDonacion] = useState<Donacion | null>(null)
  const [reinicio, setReinicio] = useState(0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <TituloSeccion etiqueta="Ciclo de vida" descripcion="Registra la captación y confirma el fraccionamiento. Cada componente queda como una unidad trazable.">
        Registrar donación
      </TituloSeccion>
      {donacion ? (
        <DonacionRegistrada
          donacion={donacion}
          onActualizada={setDonacion}
          onNueva={() => {
            setDonacion(null)
            setReinicio((r) => r + 1)
          }}
        />
      ) : (
        <Formulario key={reinicio} donanteInicial={reinicio === 0 ? donanteInicial : null} onRegistrada={setDonacion} />
      )}
    </div>
  )
}

function Formulario({ donanteInicial, onRegistrada }: { donanteInicial: DonantePresente | null; onRegistrada: (d: Donacion) => void }) {
  const [origen, setOrigen] = useState<Origen>(donanteInicial ? 'cuenta' : 'codigo')
  const [donante, setDonante] = useState<DonantePresente | null>(donanteInicial)
  const [intencion, setIntencion] = useState<Intencion | null>(null)
  const [grupo, setGrupo] = useState<GrupoSanguineo | ''>('')
  const [campaniaId, setCampaniaId] = useState('')
  const [componentes, setComponentes] = useState<Record<ComponenteSanguineo, { activo: boolean; volumen: string }>>({
    globulos_rojos: { activo: true, volumen: '' },
    plaquetas: { activo: true, volumen: '' },
    plasma: { activo: true, volumen: '' },
  })
  const campanias = useConsulta((api) => api.campanias.listar(), [])
  const vigentes = (campanias.datos ?? []).filter(campaniaVigente)

  const registro = useAccion((api) =>
    api.trazabilidad.registrarDonacion({
      donanteId: origen === 'cuenta' ? (donante?.id ?? null) : null,
      intencionCodigo: origen === 'codigo' ? (intencion?.codigo ?? null) : null,
      grupo: grupo as GrupoSanguineo,
      campaniaId: campaniaId || null,
      componentes: COMPONENTES.filter((c) => componentes[c].activo).map((c) => ({
        componente: c,
        volumenMl: componentes[c].volumen ? Number(componentes[c].volumen) : null,
      })),
    }),
  )

  const volumenInvalido = COMPONENTES.some((c) => {
    const v = componentes[c].volumen
    return componentes[c].activo && v !== '' && (!/^\d+$/.test(v) || Number(v) <= 0 || Number(v) > 1000)
  })
  const algunComponente = COMPONENTES.some((c) => componentes[c].activo)
  const identificado =
    origen === 'sin_identificar' ||
    (origen === 'cuenta' && donante?.elegibilidad.elegible === true) ||
    (origen === 'codigo' && intencion?.estado === 'pendiente')
  const listo = identificado && grupo !== '' && algunComponente && !volumenInvalido

  async function registrar() {
    const d = await registro.ejecutar()
    if (d) onRegistrada(d)
  }

  return (
    <div className="space-y-5">
      <Tarjeta>
        <h2 className="text-base font-bold text-vino-800">1. Quién dona</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Origen de la donación">
          {ORIGENES.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={origen === o.id}
              onClick={() => setOrigen(o.id)}
              className={unir(
                'rounded-suave border p-3.5 text-left transition-colors duration-[var(--dur-rapida)]',
                origen === o.id ? 'border-vino-500 bg-vino-50' : 'border-vino-100 bg-white hover:border-vino-300',
              )}
            >
              <span className="block text-sm font-bold text-vino-800">{o.titulo}</span>
              <span className="mt-0.5 block text-xs text-texto-gris">{o.texto}</span>
            </button>
          ))}
        </div>
        <div className="mt-5">
          {origen === 'cuenta' && <BuscarDonante donante={donante} onDonante={setDonante} />}
          {origen === 'codigo' && <VerificarCodigo intencion={intencion} onIntencion={setIntencion} />}
          {origen === 'sin_identificar' && (
            <Aviso tono="informacion" titulo="Donación sin identificar">
              La donación queda registrada sin asociarse a ninguna persona. No suma al historial de nadie.
            </Aviso>
          )}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-vino-800">2. Grupo y jornada</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Selector
            id="grupo-confirmado"
            etiqueta="Grupo sanguíneo confirmado"
            ayuda="El tipificado por el banco, no el autodeclarado."
            valor={grupo}
            onCambio={(v) => setGrupo(v as GrupoSanguineo | '')}
            vacio="Selecciona el grupo"
            opciones={GRUPOS_SANGUINEOS.map((g) => ({ valor: g, texto: g }))}
          />
          <Selector
            id="campania"
            etiqueta="Jornada"
            ayuda={campanias.estado === 'error' ? 'No se pudieron cargar las jornadas; puedes registrar sin jornada.' : 'Opcional. Solo jornadas publicadas y vigentes hoy.'}
            valor={campaniaId}
            onCambio={setCampaniaId}
            vacio="Sin jornada (donación espontánea)"
            deshabilitado={campanias.estado === 'cargando'}
            opciones={vigentes.map((c) => ({ valor: c.id, texto: `${c.nombre} — ${c.sede}` }))}
          />
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-base font-bold text-vino-800">3. Componentes obtenidos</h2>
        <p className="mt-1 text-xs text-texto-gris">Cada componente marcado se registra como una unidad independiente.</p>
        <div className="mt-4 space-y-2.5">
          {COMPONENTES.map((c) => {
            const estado = componentes[c]
            const v = estado.volumen
            const err = estado.activo && v !== '' && (!/^\d+$/.test(v) || Number(v) <= 0 || Number(v) > 1000)
            return (
              <div key={c} className={unir('flex flex-wrap items-center gap-4 rounded-suave border p-3.5', estado.activo ? 'border-vino-300 bg-vino-50/50' : 'border-vino-100 bg-white')}>
                <label className="flex min-w-44 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={estado.activo}
                    onChange={(e) => setComponentes({ ...componentes, [c]: { ...estado, activo: e.target.checked } })}
                    className="h-5 w-5 accent-vino-600"
                  />
                  <span className="text-sm font-bold text-vino-800">{ETIQUETA_COMPONENTE[c]}</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-texto-gris">
                  Volumen (ml, opcional)
                  <input
                    value={v}
                    disabled={!estado.activo}
                    inputMode="numeric"
                    maxLength={4}
                    aria-invalid={err || undefined}
                    onChange={(e) => setComponentes({ ...componentes, [c]: { ...estado, volumen: e.target.value.trim() } })}
                    className={unir('min-h-10 w-24 rounded-suave border bg-white px-3 text-sm text-vino-800 disabled:bg-vino-50/60', err ? 'border-error-500' : 'border-vino-200')}
                  />
                </label>
              </div>
            )
          })}
        </div>
        {volumenInvalido && <p className="mt-2 text-xs font-bold text-error-500">El volumen debe ser un número entre 1 y 1000.</p>}
      </Tarjeta>

      {registro.error && <MensajeError>{mensajeRegistro(registro.error)}</MensajeError>}

      <div className="flex justify-end">
        <Boton conFlecha tamano="grande" onClick={registrar} cargando={registro.enCurso} deshabilitado={!listo}>
          Registrar captación
        </Boton>
      </div>
    </div>
  )
}

function campaniaVigente(c: Campania): boolean {
  const dia = hoy()
  return c.estado === 'publicada' && c.iniciaEn.slice(0, 10) <= dia && dia <= c.terminaEn.slice(0, 10)
}

function mensajeRegistro(e: ErrorApi): string {
  switch (e.tipo) {
    case 'donante-no-elegible':
      return 'La persona aún no es elegible para donar. No se registró la donación.'
    case 'intencion-no-vigente':
      return 'El código ya fue usado o venció. Puedes registrar la donación sin identificar.'
    case 'consentimiento-requerido':
      return 'La cuenta del donante no tiene vigente la autorización de tratamiento de datos.'
  }
  if (e.estado === 400) return e.detalle
  if (e.estado === 404) return 'No encontramos al donante o el código indicado.'
  return 'No pudimos registrar la donación. Inténtalo de nuevo; si ya se registró, no se duplicará.'
}

function BuscarDonante({ donante, onDonante }: { donante: DonantePresente | null; onDonante: (d: DonantePresente | null) => void }) {
  const [documento, setDocumento] = useState('')
  const busqueda = useAccion((api, doc: string) => api.donantes.buscarDonantePresente(doc))

  if (donante) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-suave border border-vino-200 bg-white p-4">
        <div>
          <p className="text-sm font-bold text-vino-800">{donante.nombre}</p>
          <p className="mt-0.5 text-xs text-texto-gris">
            {donante.elegibilidad.elegible
              ? 'Elegible hoy'
              : donante.elegibilidad.elegibleDesde
                ? `No elegible hasta el ${fecha(donante.elegibilidad.elegibleDesde)}`
                : 'No elegible'}
          </p>
        </div>
        <Boton variante="texto" onClick={() => onDonante(null)}>
          Cambiar
        </Boton>
        {!donante.elegibilidad.elegible && (
          <div className="w-full">
            <Aviso tono="operativo" titulo="Registro bloqueado">
              El sistema no muestra el motivo. Remite a la persona al procedimiento de atención del banco.
            </Aviso>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const r = await busqueda.ejecutar(documento.trim())
          if (r) onDonante(r)
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="min-w-56 flex-1">
          <CampoTexto id="registro-documento" etiqueta="Número de documento" valor={documento} onCambio={setDocumento} inputMode="numeric" autoComplete="off" maxLength={20} />
        </div>
        <Boton tipo="submit" variante="secundario" icono={<IconoBuscar />} cargando={busqueda.enCurso} deshabilitado={documento.trim().length < 5}>
          Buscar
        </Boton>
      </form>
      {busqueda.error && (
        <div className="mt-3">
          <MensajeError>
            {busqueda.error.estado === 404
              ? 'No hay una cuenta de donante con ese documento. Usa el código anónimo o registra sin identificar.'
              : 'No pudimos hacer la búsqueda. Inténtalo de nuevo.'}
          </MensajeError>
        </div>
      )}
    </div>
  )
}

function VerificarCodigo({ intencion, onIntencion }: { intencion: Intencion | null; onIntencion: (i: Intencion | null) => void }) {
  const [codigo, setCodigo] = useState('')
  const consulta = useAccion((api, c: string) => api.donantes.consultarIntencion(c))

  if (intencion) {
    const vigente = intencion.estado === 'pendiente'
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-suave border border-vino-200 bg-white p-4">
          <div>
            <p className="font-mono text-sm font-bold tracking-[0.12em] text-vino-800">{codigoLegible(intencion.codigo)}</p>
            <p className="mt-0.5 text-xs text-texto-gris">
              {vigente ? `Vigente hasta el ${fecha(intencion.expiraEn)}` : intencion.estado === 'atendida' ? 'Ya fue usado' : 'Vencido'}
              {intencion.grupoAutodeclarado && ` · Grupo autodeclarado: ${intencion.grupoAutodeclarado}`}
            </p>
          </div>
          <Boton variante="texto" onClick={() => onIntencion(null)}>
            Cambiar
          </Boton>
        </div>
        {!vigente && (
          <Aviso tono="operativo" titulo="El código no se puede usar">
            Registra la donación sin identificar o pide a la persona un registro nuevo.
          </Aviso>
        )}
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const r = await consulta.ejecutar(codigo.replace(/[\s-]/g, '').toUpperCase())
          if (r) onIntencion(r)
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="min-w-56 flex-1">
          <CampoTexto id="registro-codigo" etiqueta="Código de registro anónimo" valor={codigo} onCambio={setCodigo} placeholder="XXXX-XXXX-XXXX" maxLength={14} autoComplete="off" />
        </div>
        <Boton tipo="submit" variante="secundario" icono={<IconoBuscar />} cargando={consulta.enCurso} deshabilitado={codigo.replace(/[\s-]/g, '').length < 12}>
          Verificar
        </Boton>
      </form>
      {consulta.error && (
        <div className="mt-3">
          <MensajeError>
            {consulta.error.estado === 404 ? 'No existe un registro con ese código.' : 'No pudimos verificar el código. Inténtalo de nuevo.'}
          </MensajeError>
        </div>
      )}
    </div>
  )
}

/** Resultado: unidades en `captada` y el paso de fraccionamiento. */
function DonacionRegistrada({ donacion, onActualizada, onNueva }: { donacion: Donacion; onActualizada: (d: Donacion) => void; onNueva: () => void }) {
  const fraccionamiento = useAccion((api) => api.trazabilidad.confirmarFraccionamiento(donacion.id))
  const fraccionada = donacion.unidades.every((u) => u.estado !== 'captada')

  async function fraccionar() {
    const d = await fraccionamiento.ejecutar()
    if (d) onActualizada(d)
  }

  return (
    <div className="space-y-5">
      <Aviso tono="exito" titulo={`Donación ${idCorto(donacion.id)} registrada`}>
        Captada el {fecha(donacion.fechaCaptacion)} con {donacion.unidades.length}{' '}
        {donacion.unidades.length === 1 ? 'unidad' : 'unidades'}.
        {donacion.campaniaId && !donacion.campaniaConfirmada && ' La jornada indicada no pudo confirmarse; la donación quedó registrada igual.'}
      </Aviso>

      <Tabla>
        <thead>
          <tr>
            <Th>Unidad</Th>
            <Th>Componente</Th>
            <Th>Grupo</Th>
            <Th>Estado</Th>
            <Th>Vence</Th>
          </tr>
        </thead>
        <tbody>
          {donacion.unidades.map((u) => (
            <Fila key={u.id}>
              <Td>
                <Link to={`/ciclovida/unidades/${u.id}`} className="font-mono font-bold text-vino-700 underline-offset-4 hover:underline">
                  {idCorto(u.id)}
                </Link>
              </Td>
              <Td>{ETIQUETA_COMPONENTE[u.componente]}</Td>
              <Td className="font-bold">{u.grupo}</Td>
              <Td>
                <InsigniaEstadoUnidad estado={u.estado} />
              </Td>
              <Td>{fechaCorta(u.fechaVencimiento)}</Td>
            </Fila>
          ))}
        </tbody>
      </Tabla>

      {fraccionamiento.error && <MensajeError>No pudimos confirmar el fraccionamiento. Inténtalo de nuevo.</MensajeError>}

      <div className="flex flex-wrap justify-end gap-3">
        <Boton variante="secundario" onClick={onNueva}>
          Registrar otra donación
        </Boton>
        {fraccionada ? (
          <span className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-bold text-exito-600">
            <IconoVerificado className="h-4 w-4" />
            Fraccionamiento confirmado
          </span>
        ) : (
          <Boton conFlecha onClick={fraccionar} cargando={fraccionamiento.enCurso}>
            Confirmar fraccionamiento
          </Boton>
        )}
      </div>
    </div>
  )
}
