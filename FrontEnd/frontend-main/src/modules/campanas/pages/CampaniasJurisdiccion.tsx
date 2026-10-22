import { useState } from 'react'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { nombreCompletoMunicipio } from '@/shared/datos/divipola'
import { fechaHora } from '@/shared/formato'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { Aviso, Boton, EstadoVacio, Tabla, Td, Th, TituloSeccion, unir } from '@/shared/ui/Primitivos'
import { DialogoConfirmacion } from '@/shared/ui/DialogoConfirmacion'
import { IconoCalendario } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Campania, EstadoCampania } from '@/shared/tipos'

/**
 * M2-U3-01, M2-U4-01 a 04, M2-U5-01 y M2-U6-01 — Campañas de la jurisdicción
 * (GET /v1/campanias con rol institucional). El administrador de banco publica
 * y cierra; los demás perfiles consultan. Publicar envía el evento a Donación
 * por Kafka, que la confirma al registrar donaciones y avisa a los donantes.
 */

const ETIQUETA: Record<EstadoCampania, string> = {
  borrador: 'Borrador',
  publicada: 'Publicada',
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
}

export function CampaniasJurisdiccion() {
  useTituloPagina('Campañas')
  const { rol, usuario } = useSesion()
  const puedeEscribir = rol.id === 'U4'
  const consulta = useConsulta((api) => api.campanias.listar(), [])
  const [pendiente, setPendiente] = useState<{ campania: Campania; accion: 'publicar' | 'cerrar' } | null>(null)
  const cambio = useAccion((api, id: string, accion: 'publicar' | 'cerrar') =>
    accion === 'publicar' ? api.campanias.publicar(id) : api.campanias.cerrar(id),
  )

  async function confirmar() {
    if (!pendiente) return
    const actualizada = await cambio.ejecutar(pendiente.campania.id, pendiente.accion)
    if (actualizada && consulta.datos) {
      consulta.establecer(consulta.datos.map((c) => (c.id === actualizada.id ? actualizada : c)))
      setPendiente(null)
    }
  }

  return (
    <div className="space-y-5">
      <TituloSeccion descripcion={`Campañas de ${usuario?.jurisdiccion.etiqueta.toLowerCase() ?? 'tu jurisdicción'}.`}>
        Campañas
      </TituloSeccion>

      <EstadoDeConsulta consulta={consulta}>
        {(campanias) =>
          campanias.length === 0 ? (
            <EstadoVacio titulo="No hay campañas en tu jurisdicción" icono={<IconoCalendario />}>
              Cuando un banco de tu jurisdicción programe una campaña, aparecerá aquí.
            </EstadoVacio>
          ) : (
            <Tabla>
              <thead>
                <tr>
                  <Th>Campaña</Th>
                  <Th>Sede</Th>
                  <Th>Fechas</Th>
                  <Th>Estado</Th>
                  <Th>Cupo disponible</Th>
                  <Th>Donaciones registradas</Th>
                  {puedeEscribir && <Th>Acción</Th>}
                </tr>
              </thead>
              <tbody>
                {[...campanias]
                  .sort((a, b) => b.iniciaEn.localeCompare(a.iniciaEn))
                  .map((c) => (
                    <tr key={c.id}>
                      <Td className="font-bold text-vino-800">{c.nombre}</Td>
                      <Td>
                        {c.sede}
                        <span className="block text-xs text-texto-tenue">{nombreCompletoMunicipio(c.territorioCodigo)}</span>
                      </Td>
                      <Td className="whitespace-nowrap text-xs">
                        {fechaHora(c.iniciaEn)}
                        <span className="block text-texto-tenue">a {fechaHora(c.terminaEn)}</span>
                      </Td>
                      <Td>
                        <span
                          className={unir(
                            'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold',
                            c.estado === 'publicada'
                              ? 'border-exito-600/40 bg-exito-50 text-exito-600'
                              : 'border-vino-200 bg-white text-texto-gris',
                          )}
                        >
                          {ETIQUETA[c.estado]}
                        </span>
                      </Td>
                      <Td>{c.cupoTotal === null ? 'Sin límite' : `${c.cupoDisponible} de ${c.cupoTotal}`}</Td>
                      <Td className="font-bold">{c.donacionesRegistradas ?? '—'}</Td>
                      {puedeEscribir && (
                        <Td>
                          {c.estado === 'borrador' && (
                            <Boton variante="texto" onClick={() => setPendiente({ campania: c, accion: 'publicar' })}>
                              Publicar
                            </Boton>
                          )}
                          {c.estado === 'publicada' && (
                            <Boton variante="texto" onClick={() => setPendiente({ campania: c, accion: 'cerrar' })}>
                              Cerrar
                            </Boton>
                          )}
                        </Td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </Tabla>
          )
        }
      </EstadoDeConsulta>

      <Aviso tono="informacion" titulo="Sobre las donaciones registradas">
        Es un conteo de donaciones asociadas a cada campaña. No identifica a ningún donante ni indica el resultado de
        las unidades.
      </Aviso>

      <DialogoConfirmacion
        abierto={pendiente !== null}
        titulo={pendiente?.accion === 'publicar' ? 'Publicar campaña' : 'Cerrar campaña'}
        descripcion={
          pendiente?.accion === 'publicar'
            ? `Al publicar «${pendiente?.campania.nombre}» queda visible para los donantes y se avisa a quienes autorizaron los avisos de campañas en su municipio.`
            : `Al cerrar «${pendiente?.campania.nombre}» deja de mostrarse a los donantes.`
        }
        textoConfirmar={pendiente?.accion === 'publicar' ? 'Publicar' : 'Cerrar campaña'}
        onConfirmar={confirmar}
        onCerrar={() => {
          setPendiente(null)
          cambio.limpiarError()
        }}
        cargando={cambio.enCurso}
        error={
          cambio.error
            ? cambio.error.estado === 409
              ? 'El estado de la campaña cambió. Recarga la página para ver su estado actual.'
              : cambio.error.estado === 422
                ? 'La campaña ya terminó y no puede publicarse.'
                : 'No fue posible completar la acción. Inténtalo de nuevo.'
            : null
        }
      />
    </div>
  )
}
