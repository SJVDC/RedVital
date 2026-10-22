import { dibujarIsotipo } from '@/shared/layout/Isotipo'
import { codigoLegible, fecha } from '@/shared/formato'

/**
 * Imagen descargable del código de donación (M1-U1-04, RF-01).
 *
 * Se dibuja en el navegador: el código no viaja a ningún servicio para
 * generarla. Lleva solo el código, su vigencia y dónde consultarlo; nunca el
 * grupo ni el municipio, porque una imagen se reenvía y se comparte (EC-17).
 *
 * Formato vertical de 1080 x 1350, el que una galería de teléfono muestra
 * entero sin recortar.
 */

const ANCHO = 1080
const ALTO = 1350
const FUENTE = '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'

/** Los colores del tema, leídos de las variables CSS para no duplicarlos. */
function colores() {
  const tema = getComputedStyle(document.documentElement)
  const leer = (nombre: string, respaldo: string) => tema.getPropertyValue(nombre).trim() || respaldo
  return {
    crema: leer('--color-crema', '#fdfaf8'),
    vino50: leer('--color-vino-50', '#fbf3f3'),
    vino100: leer('--color-vino-100', '#f5e8e8'),
    vino400: leer('--color-vino-400', '#b04242'),
    vino600: leer('--color-vino-600', '#8b1a24'),
    vino700: leer('--color-vino-700', '#74151e'),
    vino800: leer('--color-vino-800', '#571017'),
    gris: leer('--color-texto-gris', '#5a5a5a'),
    tenue: leer('--color-texto-tenue', '#857c7c'),
  }
}

export async function imagenCodigo(codigo: string, expiraEn: string, urlConsulta: string): Promise<Blob> {
  // La fuente de la marca viene en el paquete de la aplicación; si no carga, el
  // lienzo usa la siguiente de la lista y la imagen sale igual.
  await Promise.allSettled([document.fonts.load(`400 32px ${FUENTE}`), document.fonts.load(`700 32px ${FUENTE}`)])

  const lienzo = document.createElement('canvas')
  lienzo.width = ANCHO
  lienzo.height = ALTO
  const ctx = lienzo.getContext('2d')
  if (!ctx) throw new Error('El navegador no permite dibujar la imagen.')
  const c = colores()

  ctx.fillStyle = c.crema
  ctx.fillRect(0, 0, ANCHO, ALTO)
  rectangulo(ctx, 60, 60, ANCHO - 120, ALTO - 120, 48)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = c.vino100
  ctx.stroke()

  // Marca
  ctx.save()
  ctx.translate(ANCHO / 2 - 47, 130)
  ctx.scale(1.1, 1.1)
  dibujarIsotipo(ctx, c.vino600, '#ffffff')
  ctx.restore()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  texto(ctx, 'RedVital', 345, `700 60px ${FUENTE}`, c.vino800)
  texto(ctx, 'Plataforma nacional de donación de sangre', 395, `400 30px ${FUENTE}`, c.gris)

  // Código
  texto(ctx, 'Tu código de donación', 500, `700 46px ${FUENTE}`, c.vino800)
  rectangulo(ctx, 120, 545, ANCHO - 240, 190, 32)
  ctx.fillStyle = c.vino50
  ctx.fill()
  ctx.setLineDash([18, 12])
  ctx.lineWidth = 5
  ctx.strokeStyle = c.vino400
  ctx.stroke()
  ctx.setLineDash([])
  const legible = codigoLegible(codigo)
  let tamano = 104
  ctx.font = `700 ${tamano}px ${MONO}`
  while (ctx.measureText(legible).width > ANCHO - 320 && tamano > 40) {
    tamano -= 4
    ctx.font = `700 ${tamano}px ${MONO}`
  }
  ctx.fillStyle = c.vino700
  ctx.textBaseline = 'middle'
  ctx.fillText(legible, ANCHO / 2, 640)
  ctx.textBaseline = 'alphabetic'
  texto(ctx, `Válido hasta el ${fecha(expiraEn)}`, 800, `400 36px ${FUENTE}`, c.gris)

  // Qué hacer con él
  texto(ctx, 'Preséntalo en el punto de donación.', 905, `700 38px ${FUENTE}`, c.vino800)
  texto(ctx, 'Consulta tu registro en', 975, `400 32px ${FUENTE}`, c.gris)
  texto(ctx, urlConsulta, 1022, `700 32px ${FUENTE}`, c.vino700, ANCHO - 200)

  ctx.font = `400 28px ${FUENTE}`
  ctx.fillStyle = c.tenue
  const nota =
    'Guárdalo: como no registramos tus datos personales, este código es la única forma de consultar tu registro.'
  partirEnLineas(ctx, nota, ANCHO - 280).forEach((linea, i) => ctx.fillText(linea, ANCHO / 2, 1135 + i * 40))

  return new Promise((resolver, rechazar) =>
    lienzo.toBlob((imagen) => (imagen ? resolver(imagen) : rechazar(new Error('No se pudo crear la imagen.'))), 'image/png'),
  )
}

/** Entrega el archivo al navegador como descarga, sin abrir otra pestaña. */
export function descargarArchivo(archivo: Blob, nombre: string) {
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.append(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

function texto(ctx: CanvasRenderingContext2D, valor: string, y: number, fuente: string, color: string, anchoMaximo?: number) {
  ctx.font = fuente
  ctx.fillStyle = color
  ctx.fillText(valor, ANCHO / 2, y, anchoMaximo)
}

function rectangulo(ctx: CanvasRenderingContext2D, x: number, y: number, ancho: number, alto: number, radio: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, ancho, alto, radio)
}

function partirEnLineas(ctx: CanvasRenderingContext2D, valor: string, anchoMaximo: number): string[] {
  const lineas: string[] = []
  let actual = ''
  for (const palabra of valor.split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (ctx.measureText(prueba).width > anchoMaximo && actual) {
      lineas.push(actual)
      actual = palabra
    } else {
      actual = prueba
    }
  }
  if (actual) lineas.push(actual)
  return lineas
}
