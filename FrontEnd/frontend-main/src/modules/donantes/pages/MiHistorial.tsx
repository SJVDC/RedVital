import { Link } from 'react-router-dom'
import { useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { fecha } from '@/shared/formato'
import { Aviso, Dato, EstadoVacio, Tarjeta, TituloSeccion } from '@/shared/ui/Primitivos'
import { Revelar } from '@/shared/ui/Revelar'
import { IconoCalendario, IconoCorazon, IconoGota, IconoRegistro } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { DonacionPropia } from '@/shared/tipos'

/**
 * M1-U2-05 — Mi historial de donaciones (GET /v1/donantes/me/donaciones).
 * M1-U2-06 — Historial vacío.
 *
 * DD V3.0, decisión D-01: cada entrada muestra la fecha y si fue en una
 * jornada, con un mensaje neutro idéntico para todo donante. NO muestra
 * resultado de tamizaje ni destino de las unidades derivadas.
 */
export function MiHistorial() {
  useTituloPagina('Mi historial')
  const consulta = useConsulta((api) => api.donantes.listarMisDonaciones(), [])

  return (
    <div className="space-y-6">
      <TituloSeccion etiqueta="Historial" descripcion="Cada vez que donaste y si fue en una jornada.">
        Mis donaciones
      </TituloSeccion>
      <EstadoDeConsulta consulta={consulta}>{(donaciones) => <Historial donaciones={donaciones} />}</EstadoDeConsulta>
    </div>
  )
}

function Historial({ donaciones }: { donaciones: DonacionPropia[] }) {
  if (donaciones.length === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no tienes donaciones registradas"
        icono={<IconoGota />}
        accion={
          <Link to="/jornadas" className="font-bold text-vino-700 underline underline-offset-4">
            Ver jornadas
          </Link>
        }
      >
        Cuando dones por primera vez con tu documento, la donación aparecerá aquí con su fecha.
      </EstadoVacio>
    )
  }

  const ordenadas = [...donaciones].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const primera = ordenadas[ordenadas.length - 1]
  const enJornada = donaciones.filter((d) => d.campaniaId).length

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Revelar>
          <Dato etiqueta="Donaciones" valor={donaciones.length} destacado icono={<IconoCorazon className="h-5 w-5" />} />
        </Revelar>
        <Revelar retraso={90}>
          <Dato etiqueta="En jornadas" valor={enJornada} nota="Donaciones hechas en una campaña" icono={<IconoCalendario className="h-5 w-5" />} />
        </Revelar>
        <Revelar retraso={180}>
          <Dato etiqueta="Primera vez" valor={primera.fecha.slice(0, 4)} nota={fecha(primera.fecha)} icono={<IconoRegistro className="h-5 w-5" />} />
        </Revelar>
      </div>

      <ol className="relative mt-2">
        {ordenadas.map((d, i) => (
          <Revelar as="li" key={d.id} retraso={Math.min(i, 6) * 90}>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-vino-200 bg-white text-vino-500 shadow-nivel-1"
                >
                  <IconoGota className="h-5 w-5" />
                </span>
                {i < ordenadas.length - 1 && <span aria-hidden="true" className="w-0.5 flex-1 bg-gradient-to-b from-vino-200 to-vino-100" />}
              </div>
              <div className="flex-1 pb-4">
                <Tarjeta>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-lg font-bold text-vino-800">{fecha(d.fecha)}</p>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-texto-tenue">
                      {d.campaniaId ? 'En jornada' : 'Donación espontánea'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-texto-gris">{d.mensaje}</p>
                </Tarjeta>
              </div>
            </div>
          </Revelar>
        ))}
      </ol>

      <Aviso tono="informacion" titulo="Gracias por cada una de estas veces">
        Tu sangre se separa en varios componentes que pueden ayudar a distintas personas. Si quieres saber algo puntual
        sobre alguna de tus donaciones, comunícate con el banco donde donaste.
      </Aviso>
    </>
  )
}
