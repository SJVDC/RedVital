import { useNavigate } from 'react-router-dom'
import { Isotipo } from '@/shared/layout/Isotipo'
import { Revelar } from '@/shared/ui/Revelar'
import { Boton, Etiqueta, Tarjeta, unir } from '@/shared/ui/Primitivos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import {
  IconoCalendario,
  IconoCorazon,
  IconoEscudo,
  IconoGota,
  IconoReloj,
  IconoUbicacion,
} from '@/shared/ui/Iconos'

/**
 * Portada del visitante (U1).
 *
 * Es la unica pantalla del sistema cuyo trabajo es persuadir. El resto de la
 * plataforma informa u opera; esta convierte a alguien que llego por
 * curiosidad en alguien que empieza el registro.
 *
 * El movimiento se concentra aqui a proposito. Las pantallas clinicas y
 * operativas se mantienen quietas: quien marca una unidad no apta necesita
 * velocidad y calma, no coreografia.
 */
export function Bienvenida() {
  useTituloPagina('Dona sangre')
  const navegar = useNavigate()

  return (
    <div className="space-y-16 pb-8">
      {/* ------------------------------------------------------------ Portada */}
      <section className="relative overflow-hidden rounded-panel border border-vino-100 bg-white px-6 py-14 shadow-nivel-3 sm:px-12 sm:py-20">
        {/* Halo suave detras del isotipo. Decorativo y fuera del flujo. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-vino-50 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-fondo-suave blur-3xl"
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Revelar>
              <Etiqueta>Donación voluntaria y anónima</Etiqueta>
            </Revelar>

            <Revelar retraso={90}>
              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-vino-800 sm:text-5xl lg:text-6xl">
                Media hora tuya.
                <br />
                <span className="text-vino-600">Hasta tres vidas.</span>
              </h1>
            </Revelar>

            <Revelar retraso={170}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-texto-gris">
                Una sola donación se separa en glóbulos rojos, plasma y
                plaquetas. Cada componente puede ir a una persona distinta.
              </p>
            </Revelar>

            <Revelar retraso={240}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Boton
                  tamano="grande"
                  conFlecha
                  onClick={() => navegar('/donar')}
                >
                  Quiero donar
                </Boton>
                <Boton tamano="grande" variante="secundario" icono={<IconoCalendario />} onClick={() => navegar('/jornadas')}>
                  Ver jornadas
                </Boton>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-texto-tenue">
                <IconoReloj className="h-4 w-4 text-vino-400" />
                Tres pasos, menos de un minuto
              </p>
            </Revelar>

            <Revelar retraso={310}>
              <p className="mt-7 flex items-center gap-2 text-sm text-texto-gris">
                <IconoEscudo className="h-4 w-4 shrink-0 text-vino-500" />
                Sin cédula, sin nombre, sin correo.
              </p>
            </Revelar>
          </div>

          {/*
            El isotipo como pieza grafica, no como logotipo repetido. En una
            sola columna cae debajo del texto, para que el titular y el boton
            sigan ocupando la primera pantalla en telefono.

            La serpiente se enrosca con la cadencia de ambiente: aqui no
            acompana ninguna espera, esta siempre a la vista. Los anillos van
            a 6 s en lugar de los 2.6 s del tema para que acompanen ese pulso
            largo en vez de competir con el.
          */}
          <Revelar retraso={200} className="flex justify-center">
            <div className="relative">
              <span
                aria-hidden="true"
                className="animate-anillo absolute inset-0 rounded-full border border-vino-200 [animation-duration:6s]"
              />
              <span
                aria-hidden="true"
                className="animate-anillo absolute inset-0 rounded-full border border-vino-200 [animation-delay:3s] [animation-duration:6s]"
              />
              <Isotipo
                className="relative h-40 w-40 text-vino-600 drop-shadow-[0_18px_40px_rgba(87,16,23,0.18)] sm:h-52 sm:w-52 lg:h-64 lg:w-64"
                animado
                ritmo="ambiente"
                latiendo
                colorFondo="#ffffff"
              />
            </div>
          </Revelar>
        </div>
      </section>

      {/* ------------------------------------------------- Contexto nacional */}
      <section>
        <Revelar>
          <div className="mb-7 text-center">
            <Etiqueta tono="neutro">Por qué hace falta</Etiqueta>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-vino-800 sm:text-3xl">
              Colombia recibe la mitad de la sangre que necesita
            </h2>
          </div>
        </Revelar>

        <div className="grid gap-4 sm:grid-cols-3">
          {CIFRAS.map((cifra, i) => (
            <Revelar key={cifra.etiqueta} retraso={i * 110}>
              <Tarjeta className="h-full text-center" interactiva>
                <p className="text-4xl font-bold tabular-nums tracking-tight text-vino-600">
                  {cifra.valor}
                </p>
                <p className="mt-2 text-sm font-bold text-vino-800">
                  {cifra.etiqueta}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-texto-tenue">
                  {cifra.nota}
                </p>
              </Tarjeta>
            </Revelar>
          ))}
        </div>

        <Revelar retraso={340}>
          <p className="mt-4 text-center text-xs text-texto-tenue">
            Fuente: Instituto Nacional de Salud.
          </p>
        </Revelar>
      </section>

      {/* ------------------------------------------------------- Como es ir */}
      <section>
        <Revelar>
          <div className="mb-7 text-center">
            <Etiqueta tono="neutro">Cómo es</Etiqueta>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-vino-800 sm:text-3xl">
              Más corto de lo que crees
            </h2>
          </div>
        </Revelar>

        <ol className="grid gap-4 sm:grid-cols-3">
          {PASOS.map((paso, i) => (
            <Revelar as="li" key={paso.titulo} retraso={i * 110}>
              <Tarjeta className="h-full" interactiva>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vino-50 text-vino-600"
                  >
                    <paso.Icono className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-texto-tenue">
                    Paso {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-vino-800">
                  {paso.titulo}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-texto-gris">
                  {paso.detalle}
                </p>
              </Tarjeta>
            </Revelar>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ Cierre / CTA */}
      <section>
        <Revelar>
          <div
            className={unir(
              'relative overflow-hidden rounded-panel bg-vino-600 px-6 py-14 text-center text-white shadow-elevada sm:px-12',
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl"
            />
            <Isotipo
              className="relative mx-auto h-14 w-14 text-white"
              colorFondo="var(--color-vino-600)"
              latiendo
            />
            <h2 className="relative mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
              No te pedimos dinero. Te pedimos media hora.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-vino-100">
              En Colombia la donación no se paga ni se compensa: es un acto
              voluntario. Lo único que recibes de vuelta es el agradecimiento,
              y saber que alcanzó.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navegar('/donar')}
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-vino-700 shadow-nivel-2 transition-[transform,box-shadow] duration-[var(--dur-rapida)] ease-salida hover:shadow-nivel-3 active:scale-[0.975] motion-reduce:active:scale-100"
              >
                Empezar ahora
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-vino-50 transition-transform duration-[var(--dur-media)] ease-resorte group-hover:translate-x-0.5"
                >
                  <IconoCorazon className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </Revelar>
      </section>

      <p className="text-center text-sm text-texto-gris">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={() => navegar('/ingresar')} className="font-bold text-vino-700 underline-offset-4 hover:underline">
          Inicia sesión
        </button>{' '}
        · ¿Quieres llevar tu historial?{' '}
        <button type="button" onClick={() => navegar('/registro')} className="font-bold text-vino-700 underline-offset-4 hover:underline">
          Crea tu cuenta
        </button>
      </p>
    </div>
  )
}

const CIFRAS = [
  {
    valor: '48%',
    etiqueta: 'de déficit estructural',
    nota: '830.000 unidades recibidas en 2023 frente a 1,6 millones necesarias al año.',
  },
  {
    valor: '27%',
    etiqueta: 'de donantes habituales',
    nota: 'La mayoría dona una vez y no vuelve. Volver es lo que sostiene la reserva.',
  },
  {
    valor: '2 días',
    etiqueta: 'de reserva en enero',
    nota: 'En enero de 2026 Bogotá reportó reservas de O negativo para apenas dos días.',
  },
]

const PASOS = [
  {
    Icono: IconoUbicacion,
    titulo: 'Nos dices dónde',
    detalle:
      'Tu tipo de sangre, si lo sabes, y tu municipio. Nada más: ni dirección ni teléfono.',
  },
  {
    Icono: IconoCalendario,
    titulo: 'Eliges cuándo',
    detalle:
      'Te mostramos las jornadas más cercanas y los cupos que quedan en cada una.',
  },
  {
    Icono: IconoGota,
    titulo: 'Vas y donas',
    detalle:
      'La extracción toma unos diez minutos. El resto es papeleo, refrigerio y descanso.',
  },
]
