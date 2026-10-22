import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aviso, Boton, Etiqueta, MensajeError, Tarjeta, unir } from '@/shared/ui/Primitivos'
import { IndicadorPasos } from '@/shared/ui/Pasos'
import { SelectorMunicipio } from '@/shared/ui/SelectorMunicipio'
import { Isotipo } from '@/shared/layout/Isotipo'
import { IconoCalendario, IconoEscudo, IconoUbicacion } from '@/shared/ui/Iconos'
import { GRUPOS_SANGUINEOS } from '@/shared/datos/catalogos'
import { nombreCompletoMunicipio } from '@/shared/datos/divipola'
import { useAccion } from '@/shared/consulta/useConsulta'
import { codigoLegible, fecha } from '@/shared/formato'
import { GuardarCodigo } from '@/modules/donantes/GuardarCodigo'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { GrupoSanguineo } from '@/shared/tipos'

/**
 * M1-U1-01 a M1-U1-04 — Registro anónimo (RF-01, POST /v1/intenciones).
 *
 * RNF-03: se completa en TRES pasos. EC-17: cero campos de identificación, ni
 * obligatorios ni opcionales: solo un grupo autodeclarado y un municipio, y
 * ambos se pueden omitir. La pantalla del código es el RESULTADO del
 * registro, no un cuarto paso.
 */

const TOTAL_PASOS = 3

export function RegistroAnonimo() {
  useTituloPagina('Quiero donar')
  const [paso, setPaso] = useState(1)
  const [grupo, setGrupo] = useState<GrupoSanguineo | 'no_lo_se' | null>(null)
  const [municipio, setMunicipio] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ codigo: string; expiraEn: string } | null>(null)
  const registro = useAccion((api) =>
    api.donantes.registrarIntencion({ grupo: grupo === 'no_lo_se' ? null : grupo, municipioRuta: municipio }),
  )

  if (resultado) return <CodigoEntregado codigo={resultado.codigo} expiraEn={resultado.expiraEn} municipio={municipio} />

  async function terminar() {
    const r = await registro.ejecutar()
    if (r) setResultado(r)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <IndicadorPasos actual={paso} total={TOTAL_PASOS} />

      <Tarjeta enmarcada>
        <div key={paso} className="animate-entrar-panel min-h-[24rem]">
          {paso === 1 && (
            <section aria-labelledby="paso1">
              <Etiqueta>Paso 1 de 3</Etiqueta>
              <h1 id="paso1" className="mt-4 text-3xl font-bold tracking-tight text-vino-800">
                Tu tipo de sangre
              </h1>
              <p className="mt-2 text-texto-gris">
                Si no lo sabes, no hay problema. En el banco te lo confirman antes de donar.
              </p>
              <div className="mt-7 grid grid-cols-4 gap-2.5">
                {GRUPOS_SANGUINEOS.map((g) => (
                  <OpcionBoton key={g} activa={grupo === g} onClick={() => setGrupo(g)} grande>
                    {g}
                  </OpcionBoton>
                ))}
              </div>
              <div className="mt-2.5">
                <OpcionBoton activa={grupo === 'no_lo_se'} onClick={() => setGrupo('no_lo_se')}>
                  No lo sé
                </OpcionBoton>
              </div>
              <div className="mt-8">
                <Boton onClick={() => setPaso(2)} deshabilitado={!grupo} conFlecha ancho>
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 2 && (
            <section aria-labelledby="paso2">
              <Etiqueta>Paso 2 de 3</Etiqueta>
              <h1 id="paso2" className="mt-4 text-3xl font-bold tracking-tight text-vino-800">
                Dónde quieres donar
              </h1>
              <p className="mt-2 flex items-start gap-2 text-texto-gris">
                <IconoUbicacion className="mt-1 h-4 w-4 shrink-0 text-vino-400" />
                Solo para mostrarte las jornadas más cercanas. No necesitamos tu dirección, y puedes dejarlo en blanco.
              </p>
              <div className="mt-7">
                <SelectorMunicipio ruta={municipio} onCambio={setMunicipio} />
              </div>
              <div className="mt-8 flex gap-3">
                <Boton variante="secundario" onClick={() => setPaso(1)}>
                  Atrás
                </Boton>
                <Boton onClick={() => setPaso(3)} conFlecha>
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 3 && (
            <section aria-labelledby="paso3">
              <Etiqueta>Paso 3 de 3</Etiqueta>
              <h1 id="paso3" className="mt-4 text-3xl font-bold tracking-tight text-vino-800">
                Confirma y listo
              </h1>
              <p className="mt-2 text-texto-gris">Revisa lo que registraste. No te pedimos nombre, documento ni correo.</p>
              <dl className="mt-6 divide-y divide-vino-50 overflow-hidden rounded-tarjeta border border-vino-100">
                <FilaResumen etiqueta="Tipo de sangre" valor={grupo === 'no_lo_se' || !grupo ? 'No lo sé' : grupo} />
                <FilaResumen
                  etiqueta="Municipio"
                  valor={municipio ? nombreCompletoMunicipio(municipio.split('/').pop()!) : 'Sin indicar'}
                />
              </dl>
              {registro.error && (
                <div className="mt-5">
                  <MensajeError>
                    {registro.error.estado === 429
                      ? 'Hiciste demasiados registros seguidos. Espera un minuto antes de volver a intentarlo.'
                      : 'No pudimos completar el registro. Revisa tu conexión e inténtalo de nuevo.'}
                  </MensajeError>
                </div>
              )}
              <div className="mt-8 flex gap-3">
                <Boton variante="secundario" onClick={() => setPaso(2)} deshabilitado={registro.enCurso}>
                  Atrás
                </Boton>
                <Boton onClick={terminar} conFlecha cargando={registro.enCurso}>
                  Terminar registro
                </Boton>
              </div>
            </section>
          )}
        </div>
      </Tarjeta>

      <Aviso tono="informacion" titulo="Por qué no te pedimos datos personales">
        Puedes donar sin entregar tu identidad. Si más adelante quieres tener historial y reconocimientos, puedes crear
        una cuenta cuando tú quieras.
      </Aviso>
    </div>
  )
}

function OpcionBoton({
  children,
  activa,
  onClick,
  grande = false,
}: {
  children: React.ReactNode
  activa: boolean
  onClick: () => void
  grande?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={unir(
        'w-full rounded-suave border font-bold transition-all duration-[var(--dur-rapida)] ease-salida active:scale-[0.97] motion-reduce:active:scale-100',
        grande ? 'min-h-14 text-base' : 'min-h-11 px-4 text-sm',
        activa
          ? 'border-vino-600 bg-vino-600 text-white shadow-nivel-2'
          : 'border-vino-200 bg-white text-vino-800 hover:border-vino-400 hover:bg-vino-50',
      )}
    >
      {children}
    </button>
  )
}

function FilaResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between bg-white px-4 py-3.5 text-sm">
      <dt className="text-texto-gris">{etiqueta}</dt>
      <dd className="font-bold text-vino-800">{valor}</dd>
    </div>
  )
}

/**
 * M1-U1-04 — Código entregado. El código sustituye al perfil: sin él no hay
 * forma de consultar el registro después, y la pantalla lo advierte y ofrece
 * guardarlo como imagen o copiarlo.
 */
function CodigoEntregado({ codigo, expiraEn, municipio }: { codigo: string; expiraEn: string; municipio: string | null }) {
  const navegar = useNavigate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Tarjeta enmarcada>
        <div className="animate-entrar-panel text-center">
          <Isotipo className="mx-auto h-16 w-16 text-vino-600" animado latiendo />
          <div className="mt-6">
            <Etiqueta tono="exito">Registro completo</Etiqueta>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-vino-800">Listo. Gracias por querer donar.</h1>
          <p className="mt-3 text-texto-gris">Este es tu código de donación. Preséntalo en el punto de donación.</p>
          <p
            className="mx-auto mt-7 w-fit rounded-tarjeta border-2 border-dashed border-vino-400 bg-vino-50 px-8 py-5 font-mono text-3xl font-bold tracking-[0.15em] text-vino-700 shadow-nivel-1"
            aria-label={`Código ${codigo.split('').join(' ')}`}
          >
            {codigoLegible(codigo)}
          </p>
          <p className="mt-3 text-sm text-texto-tenue">Válido hasta el {fecha(expiraEn)}.</p>
          <div className="mt-6">
            <GuardarCodigo codigo={codigo} expiraEn={expiraEn} />
          </div>
          <div className="mt-4 text-left">
            <Aviso tono="operativo" titulo="Guarda este código">
              Como no registramos tus datos personales, este código es la única forma de consultar tu registro después.
              Descarga la imagen, cópialo o tómale una foto antes de salir.
            </Aviso>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Boton
              conFlecha
              icono={<IconoCalendario />}
              onClick={() => navegar(municipio ? `/jornadas?territorio=${encodeURIComponent(municipio)}` : '/jornadas')}
            >
              Ver jornadas cercanas
            </Boton>
            <Boton variante="secundario" icono={<IconoEscudo />} onClick={() => navegar('/registro')}>
              Crear una cuenta
            </Boton>
          </div>
        </div>
      </Tarjeta>
    </div>
  )
}
