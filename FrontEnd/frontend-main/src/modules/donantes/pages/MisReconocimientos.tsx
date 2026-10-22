import { useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { fecha } from '@/shared/formato'
import { Aviso, Tarjeta, TituloSeccion, unir } from '@/shared/ui/Primitivos'
import { Revelar } from '@/shared/ui/Revelar'
import { IconoCandado, IconoVerificado } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Reconocimiento } from '@/shared/tipos'

/**
 * M1-U2-07 — Mis reconocimientos (GET /v1/donantes/me/reconocimientos).
 * M1-U2-08 — Los no obtenidos se muestran atenuados y con candado.
 *
 * Decreto 1571 de 1993: la donación no puede remunerarse. En esta pantalla no
 * existe saldo, puntos, canje, descuento, bono ni clasificación contra otros
 * donantes. Solo insignias y agradecimiento.
 */
export function MisReconocimientos() {
  useTituloPagina('Mis reconocimientos')
  const consulta = useConsulta((api) => api.donantes.listarReconocimientos(), [])

  return (
    <div className="space-y-6">
      <TituloSeccion etiqueta="Reconocimientos" descripcion="Una forma de decir gracias. No tienen valor económico ni se canjean por nada.">
        Gracias por volver
      </TituloSeccion>
      <EstadoDeConsulta consulta={consulta}>{(lista) => <Insignias lista={lista} />}</EstadoDeConsulta>
      <Aviso tono="informacion" titulo="Por qué no hay premios ni puntos">
        En Colombia la donación de sangre es un acto voluntario y solidario, y la ley no permite que se pague ni se
        compense de ninguna forma. Estas insignias son solo una manera de agradecerte.
      </Aviso>
    </div>
  )
}

function Insignias({ lista }: { lista: Reconocimiento[] }) {
  const ordenada = [...lista].sort((a, b) => a.orden - b.orden)
  const obtenidos = ordenada.filter((r) => r.obtenidoEn).length
  const total = ordenada.length

  return (
    <>
      <div className="rounded-tarjeta border border-vino-100 bg-white p-5 shadow-nivel-1">
        <p className="text-sm text-texto-gris">
          Has obtenido{' '}
          <strong className="font-bold text-vino-700">
            {obtenidos} de {total}
          </strong>{' '}
          insignias.
        </p>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-vino-100"
          role="progressbar"
          aria-valuenow={obtenidos}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Insignias obtenidas"
        >
          <div
            className="h-full rounded-full bg-vino-600 transition-[width] duration-[900ms] ease-salida"
            style={{ width: total ? `${(obtenidos / total) * 100}%` : '0%' }}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ordenada.map((r, i) => (
          <Revelar key={r.codigo} retraso={i * 90}>
            <TarjetaInsignia reconocimiento={r} />
          </Revelar>
        ))}
      </div>
    </>
  )
}

function TarjetaInsignia({ reconocimiento: r }: { reconocimiento: Reconocimiento }) {
  const obtenido = r.obtenidoEn !== null
  return (
    <Tarjeta className={unir('h-full', !obtenido && 'border-dashed bg-white/60')}>
      <div className="flex items-start gap-4">
        <Sello obtenido={obtenido} />
        <div className="min-w-0 flex-1">
          <h3 className={unir('text-base font-bold', obtenido ? 'text-vino-800' : 'text-texto-tenue')}>{r.nombre}</h3>
          <p className="mt-1 text-sm leading-relaxed text-texto-gris">{r.descripcion}</p>
          <p className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-texto-tenue">
            {obtenido ? (
              <>
                <IconoVerificado className="h-3.5 w-3.5 text-exito-600" />
                Obtenida el {fecha(r.obtenidoEn)}
              </>
            ) : (
              <>
                <IconoCandado className="h-3.5 w-3.5" />
                {r.criterioDonaciones === 1 ? 'Con tu primera donación' : `Al llegar a ${r.criterioDonaciones} donaciones`}
              </>
            )}
          </p>
        </div>
      </div>
    </Tarjeta>
  )
}

/** Sello de la insignia: dibujo propio, nunca emoji. */
function Sello({ obtenido }: { obtenido: boolean }) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" className={unir('h-14 w-14 shrink-0', obtenido ? 'text-vino-600' : 'text-vino-200')}>
      <path
        d="M28 3.5 34 9l8-1.2 2.2 7.9 7.3 3.6-3 7.6 3 7.6-7.3 3.6L42 45.6 34 44.4 28 50l-6-5.6-8 1.2-2.2-7.9-7.3-3.6 3-7.6-3-7.6 7.3-3.6L14 7.8 22 9l6-5.5Z"
        fill="currentColor"
        opacity={obtenido ? 0.14 : 0.5}
      />
      <circle cx="28" cy="27" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
      {obtenido ? (
        <path d="m20.5 27.5 5 5 10.5-11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M23.5 26v-3a4.5 4.5 0 0 1 9 0v3M21.5 26h13v9h-13z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}
