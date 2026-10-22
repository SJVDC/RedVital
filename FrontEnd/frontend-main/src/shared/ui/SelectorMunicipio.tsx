import { useId, useState } from 'react'
import { departamentos, departamentoDeMunicipio, municipiosDe, rutaDeCodigo } from '@/shared/datos/divipola'
import { Selector } from './Primitivos'

/**
 * Elección de municipio sobre el listado DIVIPOLA estático (DD, sección 15):
 * no llama a ningún servicio. Devuelve la ruta territorial del municipio, o
 * nula si la persona prefiere no indicarlo.
 */
export function SelectorMunicipio({
  ruta,
  onCambio,
  etiquetaMunicipio = 'Municipio',
  permitirVacio = true,
}: {
  ruta: string | null
  onCambio: (ruta: string | null) => void
  etiquetaMunicipio?: string
  permitirVacio?: boolean
}) {
  const id = useId()
  const codigoInicial = ruta?.split('/').pop() ?? ''
  const [departamento, setDepartamento] = useState(
    codigoInicial ? (departamentoDeMunicipio(codigoInicial)?.codigo ?? '') : '',
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Selector
        id={`${id}-departamento`}
        etiqueta="Departamento"
        valor={departamento}
        vacio={permitirVacio ? 'Prefiero no indicarlo' : 'Elige un departamento'}
        opciones={departamentos().map((d) => ({ valor: d.codigo, texto: d.nombre }))}
        onCambio={(codigo) => {
          setDepartamento(codigo)
          const municipios = codigo ? municipiosDe(codigo) : []
          onCambio(municipios.length === 1 ? municipios[0].ruta : null)
        }}
      />
      <Selector
        id={`${id}-municipio`}
        etiqueta={etiquetaMunicipio}
        valor={codigoInicial}
        deshabilitado={!departamento}
        vacio={departamento ? 'Elige un municipio' : 'Primero el departamento'}
        opciones={departamento ? municipiosDe(departamento).map((m) => ({ valor: m.codigo, texto: m.nombre })) : []}
        onCambio={(codigo) => onCambio(codigo ? rutaDeCodigo(codigo) : null)}
      />
    </div>
  )
}
