import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { ETIQUETA_COMPONENTE, ETIQUETA_ESTADO_ALERTA, ETIQUETA_TIPO_ALERTA } from '@/shared/datos/catalogos'
import { fechaHora, idCorto } from '@/shared/formato'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { DialogoConfirmacion } from '@/shared/ui/DialogoConfirmacion'
import { Boton, EstadoVacio, Tarjeta, TituloSeccion, unir } from '@/shared/ui/Primitivos'
import { IconoAlerta, IconoReloj, IconoVerificado } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Alerta } from '@/shared/tipos'

/**
 * M4-U3-02 / M4-U4-03 — Alertas de inventario (GET /v1/alertas).
 * M4-U4-04 — Atender una alerta (POST /v1/alertas/{id}/atencion), solo U4.
 *
 * Las alertas las genera un proceso programado de Donación a partir de los
 * umbrales. Una alerta se cierra sola cuando su condición desaparece.
 */
export function Alertas() {
  useTituloPagina('Alertas')
  const { usuario } = useSesion()
  const atiende = usuario?.rol === 'U4'
  const [parametros, setParametros] = useSearchParams()
  const soloAbiertas = parametros.get('todas') !== '1'
  const consulta = useConsulta((api) => api.inventario.listarAlertas(soloAbiertas ? 'abierta' : undefined), [soloAbiertas])
  const [porAtender, setPorAtender] = useState<Alerta | null>(null)

  return (
    <div className="space-y-6">
      <TituloSeccion etiqueta="Inventario" descripcion="Escasez frente a los umbrales y unidades próximas a vencer.">
        Alertas
      </TituloSeccion>

      <div role="tablist" aria-label="Filtro de alertas" className="flex gap-2">
        {[
          { id: true, texto: 'Abiertas' },
          { id: false, texto: 'Todas' },
        ].map((o) => (
          <button
            key={o.texto}
            role="tab"
            aria-selected={soloAbiertas === o.id}
            onClick={() => setParametros(o.id ? {} : { todas: '1' }, { replace: true })}
            className={unir(
              'min-h-10 rounded-full border px-4 text-sm font-bold transition-colors duration-[var(--dur-rapida)]',
              soloAbiertas === o.id ? 'border-vino-600 bg-vino-600 text-white' : 'border-vino-200 bg-white text-vino-700 hover:bg-vino-50',
            )}
          >
            {o.texto}
          </button>
        ))}
      </div>

      <EstadoDeConsulta consulta={consulta}>
        {(alertas) =>
          alertas.length === 0 ? (
            <EstadoVacio titulo={soloAbiertas ? 'No hay alertas abiertas' : 'No hay alertas'} icono={<IconoVerificado />}>
              {soloAbiertas ? 'El inventario está dentro de los umbrales configurados.' : 'Aún no se ha generado ninguna alerta.'}
            </EstadoVacio>
          ) : (
            <ul className="space-y-3">
              {[...alertas]
                .sort((a, b) => b.generadaEn.localeCompare(a.generadaEn))
                .map((a) => (
                  <li key={a.id}>
                    <TarjetaAlerta alerta={a} atiende={atiende} onAtender={() => setPorAtender(a)} />
                  </li>
                ))}
            </ul>
          )
        }
      </EstadoDeConsulta>

      {porAtender && (
        <DialogoAtencion
          alerta={porAtender}
          onCerrar={() => setPorAtender(null)}
          onHecho={() => {
            setPorAtender(null)
            consulta.recargar()
          }}
        />
      )}
    </div>
  )
}

function TarjetaAlerta({ alerta: a, atiende, onAtender }: { alerta: Alerta; atiende: boolean; onAtender: () => void }) {
  const abierta = a.estado === 'abierta'
  return (
    <Tarjeta className={unir(!abierta && 'opacity-75')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <span
            aria-hidden="true"
            className={unir(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              a.tipo === 'escasez' ? 'bg-vino-50 text-vino-600' : 'bg-aviso-50 text-aviso-600',
            )}
          >
            {a.tipo === 'escasez' ? <IconoAlerta className="h-4 w-4" /> : <IconoReloj className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-sm font-bold text-vino-800">
              {ETIQUETA_TIPO_ALERTA[a.tipo]}: {ETIQUETA_COMPONENTE[a.componente]}
              {a.grupo && ` ${a.grupo}`}
            </p>
            <p className="mt-1 text-sm text-texto-gris">{detalle(a)}</p>
            <p className="mt-1 text-xs text-texto-tenue">
              Generada el {fechaHora(a.generadaEn)} · {ETIQUETA_ESTADO_ALERTA[a.estado]}
              {a.cerradaEn && ` el ${fechaHora(a.cerradaEn)}`}
            </p>
          </div>
        </div>
        {abierta && atiende && (
          <Boton variante="secundario" onClick={onAtender}>
            Marcar como atendida
          </Boton>
        )}
      </div>
    </Tarjeta>
  )
}

function detalle(a: Alerta) {
  if (a.tipo === 'escasez') {
    return `${a.valorObservado} ${a.valorObservado === 1 ? 'unidad disponible' : 'unidades disponibles'} al evaluarla.`
  }
  return (
    <>
      {a.valorObservado <= 0 ? 'Vence hoy' : `Vence en ${a.valorObservado} ${a.valorObservado === 1 ? 'día' : 'días'}`}
      {a.unidadId && (
        <>
          {' · '}
          <Link to={`/ciclovida/unidades/${a.unidadId}`} className="font-mono font-bold text-vino-700 underline-offset-4 hover:underline">
            Unidad {idCorto(a.unidadId)}
          </Link>
        </>
      )}
    </>
  )
}

function DialogoAtencion({ alerta, onCerrar, onHecho }: { alerta: Alerta; onCerrar: () => void; onHecho: () => void }) {
  const atender = useAccion((api) => api.inventario.atenderAlerta(alerta.id))
  return (
    <DialogoConfirmacion
      abierto
      titulo="Marcar alerta como atendida"
      descripcion={`${ETIQUETA_TIPO_ALERTA[alerta.tipo]} de ${ETIQUETA_COMPONENTE[alerta.componente]}${alerta.grupo ? ` ${alerta.grupo}` : ''}. Si la condición persiste, el sistema generará una alerta nueva en la próxima evaluación.`}
      textoConfirmar="Marcar como atendida"
      onCerrar={onCerrar}
      onConfirmar={async () => {
        const r = await atender.ejecutar()
        if (r) onHecho()
      }}
      cargando={atender.enCurso}
      error={
        atender.error
          ? atender.error.estado === 409
            ? 'La alerta ya estaba cerrada.'
            : 'No pudimos registrar la atención. Inténtalo de nuevo.'
          : null
      }
    />
  )
}
