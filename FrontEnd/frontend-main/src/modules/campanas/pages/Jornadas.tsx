import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { departamentos, municipio, municipiosDe, nombreCompletoMunicipio, rutaDeCodigo } from '@/shared/datos/divipola'
import { fecha, fechaHora } from '@/shared/formato'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { Aviso, Boton, EstadoVacio, Etiqueta, Selector, Tarjeta, TituloSeccion } from '@/shared/ui/Primitivos'
import { Esqueleto } from '@/shared/ui/Cargando'
import { IconoCalendario, IconoReloj, IconoUbicacion } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Campania } from '@/shared/tipos'

/**
 * M2-U1-01 a 03 y M2-U2-01 — Jornadas de donación publicadas
 * (GET /v1/campanias, público). Ordenadas por fecha, filtradas por territorio
 * DIVIPOLA sin llamar a ningún otro servicio. Una jornada con cupos agotados
 * ofrece la siguiente fecha del mismo banco.
 */
export function Jornadas() {
  useTituloPagina('Jornadas de donación')
  const { usuario } = useSesion()
  const [parametros, setParametros] = useSearchParams()
  const territorio = parametros.get('territorio') ?? ''
  const codigoTerritorio = territorio.split('/').pop() ?? ''
  const departamentoActual = codigoTerritorio ? codigoTerritorio.slice(0, 2) : ''
  const municipioActual = codigoTerritorio.length === 5 ? codigoTerritorio : ''

  const consulta = useConsulta((api) => api.campanias.listar({ territorioRuta: territorio || undefined }), [territorio])

  function filtrar(ruta: string) {
    setParametros(ruta ? { territorio: ruta } : {}, { replace: true })
  }

  return (
    <div className="space-y-6">
      <TituloSeccion
        etiqueta="Jornadas"
        descripcion="Jornadas de donación publicadas por los bancos de sangre. No necesitas cuenta para ir: preséntate en la sede en el horario indicado."
      >
        Dónde donar
      </TituloSeccion>

      <Tarjeta>
        <div className="grid gap-4 sm:grid-cols-2">
          <Selector
            id="filtro-departamento"
            etiqueta="Departamento"
            valor={departamentoActual}
            vacio="Todo el país"
            opciones={departamentos().map((d) => ({ valor: d.codigo, texto: d.nombre }))}
            onCambio={(codigo) => filtrar(codigo ? rutaDeCodigo(codigo) : '')}
          />
          <Selector
            id="filtro-municipio"
            etiqueta="Municipio"
            valor={municipioActual}
            deshabilitado={!departamentoActual}
            vacio={departamentoActual ? 'Todos los municipios' : 'Primero el departamento'}
            opciones={departamentoActual ? municipiosDe(departamentoActual).map((m) => ({ valor: m.codigo, texto: m.nombre })) : []}
            onCambio={(codigo) => filtrar(codigo ? rutaDeCodigo(codigo) : rutaDeCodigo(departamentoActual))}
          />
        </div>
      </Tarjeta>

      <EstadoDeConsulta consulta={consulta} cargando={<ListaCargando />}>
        {(campanias) => (
          <ListaJornadas
            campanias={campanias}
            filtrado={Boolean(territorio)}
            ampliar={() => filtrar(municipioActual ? rutaDeCodigo(departamentoActual) : '')}
          />
        )}
      </EstadoDeConsulta>

      {!usuario && (
        <Aviso tono="informacion" titulo="¿Quieres llevar tu historial?">
          Con una cuenta ves tus donaciones, tus reconocimientos y cuándo vuelves a poder donar.{' '}
          <Link to="/registro" className="font-bold underline underline-offset-4">
            Crea tu cuenta
          </Link>
          .
        </Aviso>
      )}
    </div>
  )
}

function ListaJornadas({ campanias, filtrado, ampliar }: { campanias: Campania[]; filtrado: boolean; ampliar: () => void }) {
  const vigentes = useMemo(
    () =>
      campanias
        .filter((c) => c.estado === 'publicada' && new Date(c.terminaEn) > new Date())
        .sort((a, b) => a.iniciaEn.localeCompare(b.iniciaEn)),
    [campanias],
  )

  if (vigentes.length === 0) {
    return (
      <EstadoVacio
        titulo={filtrado ? 'No hay jornadas publicadas en esta zona' : 'No hay jornadas publicadas por ahora'}
        icono={<IconoCalendario />}
        accion={
          filtrado && (
            <Boton variante="secundario" onClick={ampliar}>
              Ampliar la búsqueda
            </Boton>
          )
        }
      >
        Los bancos de sangre publican sus jornadas con anticipación. También puedes acercarte directamente a cualquier
        banco de sangre en su horario de atención.
      </EstadoVacio>
    )
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {vigentes.map((c) => (
        <li key={c.id}>
          <TarjetaJornada campania={c} siguiente={siguienteDelBanco(c, vigentes)} />
        </li>
      ))}
    </ul>
  )
}

function siguienteDelBanco(c: Campania, todas: Campania[]): Campania | null {
  if (c.cupoDisponible !== 0) return null
  return (
    todas.find((o) => o.id !== c.id && o.institucionId === c.institucionId && o.iniciaEn > c.iniciaEn && o.cupoDisponible !== 0) ??
    null
  )
}

function TarjetaJornada({ campania: c, siguiente }: { campania: Campania; siguiente: Campania | null }) {
  const agotada = c.cupoDisponible === 0
  return (
    <Tarjeta className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-vino-800">{c.nombre}</h2>
        {agotada ? (
          <Etiqueta tono="neutro">Cupos agotados</Etiqueta>
        ) : c.cupoDisponible === null ? (
          <Etiqueta tono="exito">Sin cupo limitado</Etiqueta>
        ) : (
          <Etiqueta tono="exito">{c.cupoDisponible} cupos disponibles</Etiqueta>
        )}
      </div>
      {c.descripcion && <p className="mt-2 text-sm leading-relaxed text-texto-gris">{c.descripcion}</p>}
      <dl className="mt-4 space-y-2 text-sm text-texto-gris">
        <div className="flex items-start gap-2">
          <IconoUbicacion className="mt-0.5 h-4 w-4 shrink-0 text-vino-400" />
          <dd>
            {c.sede}
            <span className="block text-xs text-texto-tenue">
              {municipio(c.territorioCodigo) ? nombreCompletoMunicipio(c.territorioCodigo) : c.territorioCodigo}
            </span>
          </dd>
        </div>
        <div className="flex items-start gap-2">
          <IconoReloj className="mt-0.5 h-4 w-4 shrink-0 text-vino-400" />
          <dd>
            Desde el {fechaHora(c.iniciaEn)}
            <span className="block text-xs text-texto-tenue">Hasta el {fechaHora(c.terminaEn)}</span>
          </dd>
        </div>
      </dl>
      {agotada && siguiente && (
        <p className="mt-4 rounded-suave border border-vino-100 bg-vino-50 px-3 py-2 text-xs text-vino-800">
          El mismo banco tiene otra jornada el {fecha(siguiente.iniciaEn)}: {siguiente.nombre}.
        </p>
      )}
    </Tarjeta>
  )
}

function ListaCargando() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
      {[0, 1].map((i) => (
        <Esqueleto key={i} className="h-44 w-full" />
      ))}
    </div>
  )
}
