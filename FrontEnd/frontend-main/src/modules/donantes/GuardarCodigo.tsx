import { useState } from 'react'
import { Boton, unir } from '@/shared/ui/Primitivos'
import { IconoCopiar, IconoDescargar } from '@/shared/ui/Iconos'
import { codigoLegible } from '@/shared/formato'
import { descargarArchivo, imagenCodigo } from './comprobanteCodigo'

type Resultado = 'descargado' | 'copiado' | 'error-descarga' | 'error-copia' | null

const MENSAJES: Record<Exclude<Resultado, null>, string> = {
  descargado: 'Imagen descargada. La encuentras en las descargas de tu dispositivo.',
  copiado: 'Código copiado.',
  'error-descarga': 'No pudimos crear la imagen. Copia el código o tómale una foto.',
  'error-copia': 'No pudimos copiarlo. Escríbelo o descarga la imagen.',
}

/**
 * Formas de guardar el código del registro anónimo: descargarlo como imagen o
 * copiarlo. Todo ocurre en el navegador; no se envía nada a ningún servicio.
 */
export function GuardarCodigo({ codigo, expiraEn }: { codigo: string; expiraEn: string }) {
  const [resultado, setResultado] = useState<Resultado>(null)
  const [generando, setGenerando] = useState(false)

  async function descargar() {
    setGenerando(true)
    setResultado(null)
    try {
      const imagen = await imagenCodigo(codigo, expiraEn, `${window.location.origin}/donar/consulta`)
      descargarArchivo(imagen, `redvital-codigo-${codigoLegible(codigo)}.png`)
      setResultado('descargado')
    } catch {
      setResultado('error-descarga')
    } finally {
      setGenerando(false)
    }
  }

  async function copiar() {
    setResultado(null)
    try {
      await copiarAlPortapapeles(codigoLegible(codigo))
      setResultado('copiado')
    } catch {
      setResultado('error-copia')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3">
        <Boton variante="secundario" icono={<IconoDescargar />} onClick={descargar} cargando={generando}>
          Descargar imagen
        </Boton>
        <Boton variante="secundario" icono={<IconoCopiar />} onClick={copiar}>
          Copiar código
        </Boton>
      </div>
      <p
        role="status"
        className={unir(
          'mt-3 min-h-5 text-center text-sm',
          resultado?.startsWith('error') ? 'text-vino-700' : 'text-texto-gris',
        )}
      >
        {resultado && MENSAJES[resultado]}
      </p>
    </div>
  )
}

/**
 * La API del portapapeles exige permiso y algunos navegadores o vistas
 * embebidas lo niegan; en ese caso se copia con el método anterior.
 */
async function copiarAlPortapapeles(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    return
  } catch {
    // sigue con el método anterior
  }
  const campo = document.createElement('textarea')
  campo.value = texto
  campo.setAttribute('readonly', '')
  campo.style.position = 'fixed'
  campo.style.opacity = '0'
  document.body.append(campo)
  campo.select()
  const copiado = document.execCommand('copy')
  campo.remove()
  if (!copiado) throw new Error('El navegador no permitió copiar.')
}
