import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CONFIG } from '@/api/config'
import type { ErrorApi } from '@/api/errores'
import { useAccion } from '@/shared/consulta/useConsulta'
import { nombreCompletoMunicipio } from '@/shared/datos/divipola'
import { fecha, hoy } from '@/shared/formato'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { Aviso, Boton, CampoTexto, Etiqueta, MensajeError, Tarjeta, unir } from '@/shared/ui/Primitivos'
import { IndicadorPasos } from '@/shared/ui/Pasos'
import { SelectorMunicipio } from '@/shared/ui/SelectorMunicipio'
import { IconoCalendario, IconoMedalla, IconoRegistro } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'

/**
 * M1-U2-01 — Crear cuenta de donante (RF-01, POST /v1/donantes).
 * M1-U2-02 — Consentimiento de tratamiento de datos (Ley 1581).
 *
 * Es el camino largo y voluntario: el límite de tres pasos de RNF-03 aplica
 * al registro anónimo. Aquí la persona entrega sus datos, y el consentimiento
 * informado exige espacio para leer. Al terminar, la cuenta queda creada en
 * Identidad y el perfil en Donación, y la persona entra con su sesión.
 *
 * El registro anónimo nunca se presenta como una versión inferior.
 */

const TOTAL_PASOS = 4

const VENTAJAS = [
  { icono: <IconoRegistro />, titulo: 'Historial propio', texto: 'La lista de tus donaciones, con su fecha.' },
  { icono: <IconoMedalla />, titulo: 'Reconocimientos', texto: 'Insignias por donar con regularidad. Sin valor económico.' },
  { icono: <IconoCalendario />, titulo: 'Cuándo vuelves a donar', texto: 'La fecha desde la que puedes volver a donar.' },
]

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CrearCuenta() {
  useTituloPagina('Crear cuenta')
  const { estado, usuario, iniciarSesion } = useSesion()
  const navegar = useNavigate()
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [documento, setDocumento] = useState('')
  const [nacimiento, setNacimiento] = useState('')
  const [correo, setCorreo] = useState('')
  const [credencial, setCredencial] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [municipio, setMunicipio] = useState<string | null>(null)
  const [aceptaDatos, setAceptaDatos] = useState(false)
  const [aceptaAvisos, setAceptaAvisos] = useState(false)
  // registrarDonante no devuelve cuerpo: la accion devuelve true para que el
  // exito se distinga del fallo (useAccion devuelve undefined si falla).
  const registro = useAccion(async (api) => {
    await api.donantes.registrarDonante({
      documento: documento.trim(),
      nombre: nombre.trim(),
      fechaNacimiento: nacimiento,
      correoAcceso: correo.trim().toLowerCase(),
      credencial,
      // El correo de contacto recibe la confirmación de la cuenta; los avisos de
      // jornadas además exigen su autorización, que Donación revisa al enviar.
      correoContacto: correo.trim().toLowerCase(),
      telefono: telefono.trim() || null,
      municipioRuta: municipio,
      autorizaTratamiento: aceptaDatos,
      autorizaAvisos: aceptaAvisos,
      versionAviso: CONFIG.versionAvisoPrivacidad,
    })
    return true
  })
  const [errorEntrada, setErrorEntrada] = useState(false)

  // Solo quien llega con sesión se redirige; tras crear la cuenta, navega crear().
  const llegoConSesion = useRef(estado === 'activa')
  if (llegoConSesion.current && usuario) {
    return <Navigate to="/donantes/perfil" replace />
  }

  const errDocumento = documento && !/^[A-Za-z0-9]{5,20}$/.test(documento.trim()) ? 'Entre 5 y 20 letras o números, sin puntos ni espacios.' : null
  const errNacimiento = nacimiento && nacimiento >= hoy() ? 'Debe ser una fecha pasada.' : null
  const identidadCompleta = nombre.trim() !== '' && documento && !errDocumento && nacimiento && !errNacimiento

  const errCorreo = correo && !CORREO.test(correo.trim()) ? 'Escribe un correo válido.' : null
  const errCredencial =
    credencial && (credencial.length < 10 || !/[A-Za-z]/.test(credencial) || !/\d/.test(credencial))
      ? 'Al menos 10 caracteres, con letras y números.'
      : null
  const errConfirmacion = confirmacion && confirmacion !== credencial ? 'Las contraseñas no coinciden.' : null
  const errTelefono = telefono && !/^[0-9+ ]{7,20}$/.test(telefono.trim()) ? 'Solo números, espacios y el signo +.' : null
  const cuentaCompleta =
    correo && !errCorreo && credencial && !errCredencial && confirmacion === credencial && !errTelefono

  async function crear() {
    setErrorEntrada(false)
    const creada = await registro.ejecutar()
    if (!creada) return
    try {
      await iniciarSesion(correo.trim().toLowerCase(), credencial)
      navegar('/donantes/perfil', { replace: true, state: { bienvenida: true } })
    } catch {
      // La cuenta quedó creada; solo falló la entrada automática.
      setErrorEntrada(true)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <IndicadorPasos actual={paso} total={TOTAL_PASOS} />

      <Tarjeta enmarcada>
        <div key={paso} className="animate-entrar-panel min-h-[26rem]">
          {paso === 1 && (
            <section aria-labelledby="cuenta1" className="space-y-5">
              <div>
                <Etiqueta>Paso 1 de 4</Etiqueta>
                <h1 id="cuenta1" className="mt-4 text-2xl font-bold tracking-tight text-vino-800">
                  Tus datos
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-texto-gris">
                  Son los que permiten que el banco te reconozca y que calculemos cuándo vuelves a poder donar.
                </p>
              </div>
              <CampoTexto id="nombre" etiqueta="Nombre completo" valor={nombre} onCambio={setNombre} autoComplete="name" maxLength={120} />
              <CampoTexto
                id="documento"
                etiqueta="Número de documento"
                valor={documento}
                onCambio={setDocumento}
                ayuda="Lo guardamos cifrado: sirve para que el banco te encuentre, nunca se muestra."
                inputMode="numeric"
                autoComplete="off"
                maxLength={20}
                error={errDocumento}
              />
              <CampoTexto
                id="nacimiento"
                etiqueta="Fecha de nacimiento"
                tipo="date"
                valor={nacimiento}
                onCambio={setNacimiento}
                autoComplete="bday"
                error={errNacimiento}
              />
              <Boton conFlecha deshabilitado={!identidadCompleta} onClick={() => setPaso(2)}>
                Continuar
              </Boton>
              <Aviso tono="informacion" titulo="Crear una cuenta es opcional, siempre">
                Puedes seguir donando sin cuenta cuantas veces quieras. Una donación anónima vale exactamente lo mismo.
              </Aviso>
            </section>
          )}

          {paso === 2 && (
            <section aria-labelledby="cuenta2" className="space-y-5">
              <div>
                <Etiqueta>Paso 2 de 4</Etiqueta>
                <h1 id="cuenta2" className="mt-4 text-2xl font-bold tracking-tight text-vino-800">
                  Tu cuenta
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-texto-gris">
                  Con este correo y esta contraseña entrarás a RedVital. Ahí te enviaremos la confirmación de tu cuenta.
                </p>
              </div>
              <CampoTexto id="correo" etiqueta="Correo electrónico" tipo="email" valor={correo} onCambio={setCorreo} autoComplete="email" inputMode="email" maxLength={160} error={errCorreo} />
              <CampoTexto
                id="credencial"
                etiqueta="Contraseña"
                tipo="password"
                valor={credencial}
                onCambio={setCredencial}
                autoComplete="new-password"
                ayuda="Al menos 10 caracteres, con letras y números."
                maxLength={128}
                error={errCredencial}
              />
              <CampoTexto id="confirmacion" etiqueta="Repite la contraseña" tipo="password" valor={confirmacion} onCambio={setConfirmacion} autoComplete="new-password" maxLength={128} error={errConfirmacion} />
              <CampoTexto id="telefono" etiqueta="Teléfono" tipo="tel" valor={telefono} onCambio={setTelefono} autoComplete="tel" opcional inputMode="tel" error={errTelefono} />
              <div>
                <p className="text-sm font-bold text-vino-800">
                  Municipio donde vives <span className="font-normal text-texto-tenue">(opcional)</span>
                </p>
                <p className="mt-1 text-xs text-texto-gris">Sirve para avisarte de jornadas cerca de ti, si lo autorizas.</p>
                <div className="mt-3">
                  <SelectorMunicipio ruta={municipio} onCambio={setMunicipio} />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Boton variante="secundario" onClick={() => setPaso(1)}>
                  Atrás
                </Boton>
                <Boton conFlecha deshabilitado={!cuentaCompleta} onClick={() => setPaso(3)}>
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 3 && (
            /*
              M1-U2-02. El consentimiento es un paso propio: quien acepta tiene
              que haber podido leer qué acepta. Las dos casillas empiezan SIN
              marcar y son independientes (DD: finalidades distintas que no se
              otorgan en una sola casilla).
            */
            <section aria-labelledby="cuenta3" className="space-y-5">
              <div>
                <Etiqueta>Paso 3 de 4</Etiqueta>
                <h1 id="cuenta3" className="mt-4 text-2xl font-bold tracking-tight text-vino-800">
                  Tratamiento de tus datos
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-texto-gris">Ley 1581 de 2012. Lee antes de aceptar.</p>
              </div>
              <div className="space-y-3 rounded-tarjeta border border-vino-100 bg-fondo-suave p-5 text-sm leading-relaxed text-texto-gris">
                <p>
                  <strong className="text-vino-800">Para qué se usan.</strong> Tu nombre, documento y contacto sirven
                  para identificarte en el banco, calcular cuándo vuelves a poder donar y guardar tu historial.
                </p>
                <p>
                  <strong className="text-vino-800">Qué no se hace.</strong> Tus datos no se venden, no se ceden con
                  fines comerciales y no se usan para decidir sobre ti fuera del proceso de donación. RedVital no guarda
                  información sobre tu salud.
                </p>
                <p>
                  <strong className="text-vino-800">Tus derechos.</strong> Puedes consultar y corregir tus datos y
                  retirar la autorización de avisos cuando quieras desde tu perfil.
                </p>
              </div>
              <Casilla
                id="acepta-datos"
                marcada={aceptaDatos}
                onCambio={setAceptaDatos}
                titulo="Autorizo el tratamiento de mis datos personales"
                texto="Obligatorio para crear la cuenta. Sin esta autorización puedes seguir donando de forma anónima."
              />
              <Casilla
                id="acepta-avisos"
                marcada={aceptaAvisos}
                onCambio={setAceptaAvisos}
                titulo="Quiero recibir avisos de jornadas en mi municipio"
                texto="Opcional e independiente de lo anterior. Puedes desactivarlo después sin perder la cuenta."
              />
              <div className="flex flex-wrap gap-3">
                <Boton variante="secundario" onClick={() => setPaso(2)}>
                  Atrás
                </Boton>
                <Boton conFlecha deshabilitado={!aceptaDatos} onClick={() => setPaso(4)}>
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 4 && (
            <section aria-labelledby="cuenta4" className="space-y-5">
              <div>
                <Etiqueta>Paso 4 de 4</Etiqueta>
                <h1 id="cuenta4" className="mt-4 text-2xl font-bold tracking-tight text-vino-800">
                  Revisa antes de crear la cuenta
                </h1>
              </div>
              <dl className="divide-y divide-vino-100 rounded-tarjeta border border-vino-100 bg-white">
                <FilaResumen etiqueta="Nombre" valor={nombre} />
                <FilaResumen etiqueta="Documento" valor={'•'.repeat(Math.max(documento.length - 3, 0)) + documento.slice(-3)} />
                <FilaResumen etiqueta="Fecha de nacimiento" valor={fecha(nacimiento)} />
                <FilaResumen etiqueta="Correo" valor={correo} />
                <FilaResumen etiqueta="Teléfono" valor={telefono || 'Sin indicar'} />
                <FilaResumen etiqueta="Municipio" valor={municipio ? nombreCompletoMunicipio(municipio.split('/').pop()!) : 'Sin indicar'} />
                <FilaResumen etiqueta="Tratamiento de datos" valor="Autorizado" />
                <FilaResumen etiqueta="Avisos de jornadas" valor={aceptaAvisos ? 'Autorizados' : 'No autorizados'} />
              </dl>
              {registro.error && <MensajeError>{mensajeRegistro(registro.error)}</MensajeError>}
              {errorEntrada && (
                <Aviso tono="exito" titulo="Tu cuenta quedó creada">
                  No pudimos iniciar tu sesión automáticamente.{' '}
                  <Link to="/ingresar" className="font-bold underline underline-offset-4">
                    Inicia sesión
                  </Link>{' '}
                  con tu correo y tu contraseña.
                </Aviso>
              )}
              <div className="flex flex-wrap gap-3">
                <Boton variante="secundario" onClick={() => setPaso(3)} deshabilitado={registro.enCurso}>
                  Atrás
                </Boton>
                <Boton conFlecha onClick={crear} cargando={registro.enCurso} deshabilitado={errorEntrada}>
                  Crear mi cuenta
                </Boton>
              </div>
            </section>
          )}
        </div>
      </Tarjeta>

      {paso === 1 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {VENTAJAS.map((v) => (
            <div key={v.titulo} className="rounded-tarjeta border border-vino-100/80 bg-white p-4 shadow-nivel-1">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-vino-50 text-vino-600 [&>svg]:h-4 [&>svg]:w-4">
                {v.icono}
              </span>
              <p className="mt-3 text-sm font-bold text-vino-800">{v.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed text-texto-gris">{v.texto}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-texto-gris">
        ¿Ya tienes cuenta?{' '}
        <Link to="/ingresar" className="font-bold text-vino-700 underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}

function mensajeRegistro(error: ErrorApi): string {
  if (error.estado === 409) return 'No es posible crear la cuenta con estos datos. Si ya tienes una cuenta, inicia sesión.'
  if (error.estado === 400) return 'Revisa los datos: alguno no tiene el formato esperado.'
  if (error.estado === 429) return 'Hiciste demasiados intentos seguidos. Espera un minuto antes de volver a intentarlo.'
  if (error.estado === 503) return 'No fue posible crear la cuenta en este momento. Inténtalo de nuevo en unos minutos.'
  return 'No pudimos crear la cuenta. Inténtalo de nuevo en unos momentos.'
}

function Casilla({
  id,
  marcada,
  onCambio,
  titulo,
  texto,
}: {
  id: string
  marcada: boolean
  onCambio: (v: boolean) => void
  titulo: string
  texto: string
}) {
  return (
    <label
      htmlFor={id}
      className={unir(
        'flex cursor-pointer gap-3 rounded-tarjeta border p-4 transition-colors duration-[var(--dur-rapida)]',
        marcada ? 'border-vino-400 bg-vino-50' : 'border-vino-200 bg-white',
      )}
    >
      <input id={id} type="checkbox" checked={marcada} onChange={(e) => onCambio(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-vino-600" />
      <span>
        <span className="block text-sm font-bold text-vino-800">{titulo}</span>
        <span className="mt-1 block text-xs leading-relaxed text-texto-gris">{texto}</span>
      </span>
    </label>
  )
}

function FilaResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-texto-tenue">{etiqueta}</dt>
      <dd className="break-all text-right text-sm font-semibold text-vino-800">{valor || '—'}</dd>
    </div>
  )
}
