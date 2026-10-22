import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Api } from '@/api/contratos'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { COMPONENTES, ETIQUETA_COMPONENTE, VIDA_UTIL_COMPONENTE } from '@/shared/datos/catalogos'
import { nombreCompletoMunicipio } from '@/shared/datos/divipola'
import { fecha } from '@/shared/formato'
import { Aviso, Boton, CampoTexto, Dato, Etiqueta, MensajeError, Tarjeta, unir } from '@/shared/ui/Primitivos'
import { Revelar } from '@/shared/ui/Revelar'
import { SelectorMunicipio } from '@/shared/ui/SelectorMunicipio'
import { IconoCalendario, IconoCorazon, IconoGota } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Consentimiento, Elegibilidad, PerfilDonante } from '@/shared/tipos'

/**
 * M1-U2-03 — Mi perfil: tipo de sangre y elegibilidad.
 * M1-U2-04 — Aún no eres elegible.
 * M1-U2-05 — Datos de contacto y avisos.
 *
 * La elegibilidad la calcula Donación (EC-21): la web no replica la regla.
 *
 * RNF-01: cuando la persona NO es elegible, la pantalla muestra la fecha desde
 * la que puede volver a donar y remite al banco. Nunca nombra una causa.
 */

/** Intervalo mínimo entre donaciones de sangre total, solo para dibujar el anillo. */
const DIAS_INTERVALO = 56

interface DatosPerfil {
  perfil: PerfilDonante
  elegibilidad: Elegibilidad
  consentimientos: Consentimiento[]
}

const cargarPerfil = async (api: Api): Promise<DatosPerfil> => {
  const [perfil, elegibilidad, consentimientos] = await Promise.all([
    api.donantes.obtenerPerfil(),
    api.donantes.obtenerElegibilidad(),
    api.donantes.listarConsentimientos(),
  ])
  return { perfil, elegibilidad, consentimientos }
}

export function MiPerfil() {
  useTituloPagina('Mi perfil')
  const consulta = useConsulta(cargarPerfil, [])
  const ubicacion = useLocation()
  const recienCreada = (ubicacion.state as { bienvenida?: boolean } | null)?.bienvenida === true

  return (
    <div className="space-y-6">
      {recienCreada && (
        <Aviso tono="exito" titulo="Tu cuenta quedó creada">
          Desde aquí ves cuándo puedes volver a donar, tu historial y tus reconocimientos. Te enviamos un correo de
          confirmación con el enlace para entrar; si no lo ves en unos minutos, revisa la carpeta de spam.
        </Aviso>
      )}
      <EstadoDeConsulta consulta={consulta}>
        {(datos) => (
          <ContenidoPerfil
            datos={datos}
            onPerfil={(perfil) => consulta.establecer({ ...datos, perfil })}
            onConsentimientos={(consentimientos) => consulta.establecer({ ...datos, consentimientos })}
          />
        )}
      </EstadoDeConsulta>
    </div>
  )
}

function ContenidoPerfil({
  datos,
  onPerfil,
  onConsentimientos,
}: {
  datos: DatosPerfil
  onPerfil: (p: PerfilDonante) => void
  onConsentimientos: (c: Consentimiento[]) => void
}) {
  const { perfil, elegibilidad } = datos
  const elegible = elegibilidad.elegible
  const nombrePila = perfil.nombre.split(' ')[0]

  return (
    <>
      <Revelar>
        <section className="relative overflow-hidden rounded-panel border border-vino-100 bg-white p-6 shadow-nivel-3 sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-vino-50 blur-3xl" />
          <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <AnilloElegibilidad elegibilidad={elegibilidad} grupo={perfil.grupo} />
            <div className="flex-1 text-center sm:text-left">
              <Etiqueta tono={elegible ? 'exito' : 'marca'}>{elegible ? 'Puedes donar' : 'En periodo de espera'}</Etiqueta>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-vino-800 sm:text-4xl">
                {elegible ? `${nombrePila}, ya puedes donar` : 'Aún no puedes donar'}
              </h1>
              <p className="mt-3 max-w-lg leading-relaxed text-texto-gris">{textoElegibilidad(elegibilidad, perfil)}</p>
              {elegible && (
                <div className="mt-7 flex flex-wrap justify-center gap-3 sm:justify-start">
                  <Link
                    to={perfil.municipioRuta ? `/jornadas?territorio=${encodeURIComponent(perfil.municipioRuta)}` : '/jornadas'}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-vino-600 px-5 py-2.5 text-sm font-bold text-white shadow-nivel-2 hover:bg-vino-700"
                  >
                    <IconoCalendario className="h-4 w-4" />
                    Ver jornadas cercanas
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </Revelar>

      <div className="grid gap-4 sm:grid-cols-3">
        <Revelar retraso={0}>
          <Dato
            etiqueta="Tipo de sangre"
            valor={perfil.grupo ?? '—'}
            nota={perfil.grupo ? 'Confirmado por el banco' : 'Se confirma en tu primera donación'}
            icono={<IconoGota className="h-5 w-5" />}
          />
        </Revelar>
        <Revelar retraso={90}>
          <Dato
            etiqueta="Donaciones"
            valor={perfil.totalDonaciones}
            nota={perfil.fechaUltimaDonacion ? `La última, el ${fecha(perfil.fechaUltimaDonacion)}` : 'Aún ninguna registrada'}
            icono={<IconoCorazon className="h-5 w-5" />}
          />
        </Revelar>
        <Revelar retraso={180}>
          <Dato
            etiqueta="Próxima fecha"
            valor={elegible ? 'Hoy' : elegibilidad.elegibleDesde ? fecha(elegibilidad.elegibleDesde) : '—'}
            nota="Desde cuándo puedes donar"
            icono={<IconoCalendario className="h-5 w-5" />}
          />
        </Revelar>
      </div>

      {!elegible && (
        <Aviso tono="informacion" titulo="Si tienes dudas sobre tu caso">
          Comunícate directamente con el banco de sangre donde donaste. Ellos pueden orientarte de forma personal; esta
          plataforma no maneja información sobre tu salud.
        </Aviso>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <DatosContacto perfil={perfil} onGuardado={onPerfil} />
        <Avisos consentimientos={datos.consentimientos} onCambio={onConsentimientos} />
      </div>

      <Tarjeta>
        <h2 className="text-lg font-bold text-vino-800">Qué pasa con lo que donas</h2>
        <p className="mt-2 text-sm leading-relaxed text-texto-gris">
          Tu donación se separa en glóbulos rojos, plasma y plaquetas. Cada componente tiene un uso distinto y una
          duración distinta, y puede llegar a personas diferentes.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {COMPONENTES.map((c) => (
            <div key={c} className="rounded-suave border border-vino-100 bg-vino-50/50 p-4">
              <p className="text-sm font-bold text-vino-800">{ETIQUETA_COMPONENTE[c]}</p>
              <p className="mt-1 text-xs text-texto-tenue">{VIDA_UTIL_COMPONENTE[c]}</p>
            </div>
          ))}
        </div>
      </Tarjeta>
    </>
  )
}

function textoElegibilidad(e: Elegibilidad, p: PerfilDonante): string {
  if (e.elegible) {
    return p.fechaUltimaDonacion
      ? `Ya pasó el tiempo necesario desde tu última donación, el ${fecha(p.fechaUltimaDonacion)}. Puedes acercarte a cualquier punto de donación o a una jornada.`
      : 'Puedes acercarte a cualquier punto de donación o a una jornada. El banco confirma tu estado antes de donar.'
  }
  if (e.elegibleDesde) {
    return `Podrás donar de nuevo a partir del ${fecha(e.elegibleDesde)}. Entre una donación y la siguiente debe pasar un tiempo mínimo para que tu cuerpo se recupere.`
  }
  return 'Con los datos registrados no es posible donar a través de esta plataforma. El banco de sangre puede orientarte.'
}

/** M1-U2-05 — Nombre, contacto y municipio (PUT /v1/donantes/me). */
function DatosContacto({ perfil, onGuardado }: { perfil: PerfilDonante; onGuardado: (p: PerfilDonante) => void }) {
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(perfil.nombre)
  const [correo, setCorreo] = useState(perfil.correo ?? '')
  const [telefono, setTelefono] = useState(perfil.telefono ?? '')
  const [municipio, setMunicipio] = useState<string | null>(perfil.municipioRuta)
  const guardar = useAccion((api) =>
    api.donantes.actualizarPerfil({
      nombre: nombre.trim(),
      correo: correo.trim() || null,
      telefono: telefono.trim() || null,
      municipioRuta: municipio,
    }),
  )

  const errCorreo = correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ? 'Escribe un correo válido.' : null
  const errTelefono = telefono && !/^[0-9+ ]{7,20}$/.test(telefono.trim()) ? 'Solo números, espacios y el signo +.' : null
  const valido = nombre.trim() !== '' && !errCorreo && !errTelefono

  function cancelar() {
    setNombre(perfil.nombre)
    setCorreo(perfil.correo ?? '')
    setTelefono(perfil.telefono ?? '')
    setMunicipio(perfil.municipioRuta)
    guardar.limpiarError()
    setEditando(false)
  }

  async function enviar() {
    const actualizado = await guardar.ejecutar()
    if (actualizado) {
      onGuardado(actualizado)
      setEditando(false)
    }
  }

  return (
    <Tarjeta>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-vino-800">Tus datos de contacto</h2>
        {!editando && (
          <Boton variante="texto" onClick={() => setEditando(true)}>
            Editar
          </Boton>
        )}
      </div>
      {!editando ? (
        <dl className="mt-4 space-y-3 text-sm">
          <FilaDato etiqueta="Nombre" valor={perfil.nombre} />
          <FilaDato etiqueta="Correo de contacto" valor={perfil.correo ?? 'Sin indicar'} />
          <FilaDato etiqueta="Teléfono" valor={perfil.telefono ?? 'Sin indicar'} />
          <FilaDato
            etiqueta="Municipio"
            valor={perfil.municipioRuta ? nombreCompletoMunicipio(perfil.municipioRuta.split('/').pop()!) : 'Sin indicar'}
          />
        </dl>
      ) : (
        <div className="mt-4 space-y-4">
          <CampoTexto id="perfil-nombre" etiqueta="Nombre completo" valor={nombre} onCambio={setNombre} autoComplete="name" maxLength={120} />
          <CampoTexto id="perfil-correo" etiqueta="Correo de contacto" tipo="email" valor={correo} onCambio={setCorreo} opcional autoComplete="email" maxLength={160} error={errCorreo} />
          <CampoTexto id="perfil-telefono" etiqueta="Teléfono" tipo="tel" valor={telefono} onCambio={setTelefono} opcional autoComplete="tel" error={errTelefono} />
          <div>
            <p className="text-sm font-bold text-vino-800">
              Municipio <span className="font-normal text-texto-tenue">(opcional)</span>
            </p>
            <div className="mt-2">
              <SelectorMunicipio ruta={municipio} onCambio={setMunicipio} />
            </div>
          </div>
          {guardar.error && <MensajeError>No pudimos guardar los cambios. Revisa los datos e inténtalo de nuevo.</MensajeError>}
          <div className="flex flex-wrap gap-3">
            <Boton variante="secundario" onClick={cancelar} deshabilitado={guardar.enCurso}>
              Cancelar
            </Boton>
            <Boton onClick={enviar} cargando={guardar.enCurso} deshabilitado={!valido}>
              Guardar
            </Boton>
          </div>
        </div>
      )}
      <p className="mt-5 text-xs leading-relaxed text-texto-tenue">
        El documento y la fecha de nacimiento no se cambian desde aquí: si hay un error, el banco lo corrige al
        verificar tu identidad.
      </p>
    </Tarjeta>
  )
}

/** M1-U2-02 — Consentimientos: cada finalidad se otorga o se retira por separado. */
function Avisos({ consentimientos, onCambio }: { consentimientos: Consentimiento[]; onCambio: (c: Consentimiento[]) => void }) {
  const tratamiento = consentimientos.find((c) => c.finalidad === 'tratamiento_datos')
  const avisos = consentimientos.find((c) => c.finalidad === 'avisos_campanas')
  const activo = avisos?.otorgado === true
  const cambiar = useAccion((api, otorgar: boolean) => api.donantes.registrarConsentimiento('avisos_campanas', otorgar))

  async function alternar() {
    const r = await cambiar.ejecutar(!activo)
    if (r) onCambio(r)
  }

  return (
    <Tarjeta>
      <h2 className="text-lg font-bold text-vino-800">Tus autorizaciones</h2>
      <div className="mt-4 space-y-4">
        <div className="rounded-suave border border-vino-100 bg-vino-50/40 p-4">
          <p className="text-sm font-bold text-vino-800">Tratamiento de datos personales</p>
          <p className="mt-1 text-xs leading-relaxed text-texto-gris">
            {tratamiento?.otorgado
              ? `Autorizado el ${fecha(tratamiento.registradoEn)} (aviso ${tratamiento.versionAviso}).`
              : 'Sin autorización vigente.'}
          </p>
        </div>
        <div className={unir('rounded-suave border p-4', activo ? 'border-vino-300 bg-vino-50' : 'border-vino-100 bg-white')}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-vino-800">Avisos de jornadas en tu municipio</p>
              <p className="mt-1 text-xs leading-relaxed text-texto-gris">
                {activo
                  ? `Activos desde el ${fecha(avisos!.registradoEn)}.`
                  : avisos
                    ? `Desactivados desde el ${fecha(avisos.registradoEn)}.`
                    : 'No los has autorizado.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={activo}
              aria-label="Avisos de jornadas"
              disabled={cambiar.enCurso}
              onClick={alternar}
              className={unir(
                'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-[var(--dur-rapida)] disabled:opacity-50',
                activo ? 'bg-vino-600' : 'bg-vino-200',
              )}
            >
              <span
                aria-hidden="true"
                className={unir(
                  'absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-nivel-1 transition-transform duration-[var(--dur-rapida)]',
                  activo ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>
        </div>
        {cambiar.error && <MensajeError>No pudimos registrar el cambio. Inténtalo de nuevo.</MensajeError>}
      </div>
    </Tarjeta>
  )
}

function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-vino-50 pb-2.5 last:border-b-0">
      <dt className="text-texto-gris">{etiqueta}</dt>
      <dd className="break-all text-right font-semibold text-vino-800">{valor}</dd>
    </div>
  )
}

/**
 * Anillo de elegibilidad. El valor va también en texto: el anillo por sí
 * solo no comunica nada a quien usa lector de pantalla.
 */
function AnilloElegibilidad({ elegibilidad, grupo }: { elegibilidad: Elegibilidad; grupo: string | null }) {
  const restantes = elegibilidad.diasRestantes ?? 0
  const porcentaje = elegibilidad.elegible
    ? 100
    : elegibilidad.elegibleDesde
      ? Math.round((Math.max(DIAS_INTERVALO - restantes, 0) / DIAS_INTERVALO) * 100)
      : 0
  const radio = 52
  const circunferencia = 2 * Math.PI * radio

  return (
    <div className="relative shrink-0">
      <svg
        viewBox="0 0 128 128"
        className="h-36 w-36 -rotate-90"
        role="img"
        aria-label={elegibilidad.elegible ? 'Periodo de espera completo. Puedes donar.' : `Faltan ${restantes} días para poder donar.`}
      >
        <circle cx="64" cy="64" r={radio} fill="none" stroke="var(--color-vino-100)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radio}
          fill="none"
          stroke={elegibilidad.elegible ? 'var(--color-exito-500)' : 'var(--color-vino-500)'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia - (porcentaje / 100) * circunferencia}
          className="transition-[stroke-dashoffset,stroke] duration-[900ms] ease-salida"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={unir('text-4xl font-bold tracking-tight', elegibilidad.elegible ? 'text-exito-600' : 'text-vino-700')}>
          {grupo ?? '—'}
        </span>
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-texto-tenue">
          {elegibilidad.elegible ? 'Habilitado' : elegibilidad.elegibleDesde ? `${restantes} días` : 'Consulta al banco'}
        </span>
      </div>
    </div>
  )
}
