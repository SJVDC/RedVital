import type { Territorio } from '@/shared/tipos'

/**
 * Division politico-administrativa de Colombia (DIVIPOLA, DANE).
 *
 * El DD V3.0 (seccion 15) fija que la aplicacion web incorpora este listado
 * como recurso estatico versionado: el registro anonimo, el perfil del donante
 * y la busqueda publica de campanas eligen municipio sobre el, sin llamar a
 * ningun servicio y sin abrir una ruta publica adicional.
 *
 * VERSION 2026.10-parcial. Contiene los 33 departamentos y un subconjunto de
 * municipios: todas las capitales y los municipios de mayor poblacion. Antes
 * de produccion debe reemplazarse por el listado oficial completo del DANE,
 * conservando esta misma forma — las pantallas solo dependen de las funciones
 * exportadas al final del archivo.
 *
 * La ruta territorial se deriva del codigo por la regla fija del DD (IN-13):
 * /00 para la nacion, /00/05 para el departamento, /00/05/05001 para el
 * municipio.
 */

export const VERSION_DIVIPOLA = '2026.10-parcial'

const DEPARTAMENTOS: [string, string][] = [
  ['05', 'Antioquia'],
  ['08', 'Atlántico'],
  ['11', 'Bogotá, D.C.'],
  ['13', 'Bolívar'],
  ['15', 'Boyacá'],
  ['17', 'Caldas'],
  ['18', 'Caquetá'],
  ['19', 'Cauca'],
  ['20', 'Cesar'],
  ['23', 'Córdoba'],
  ['25', 'Cundinamarca'],
  ['27', 'Chocó'],
  ['41', 'Huila'],
  ['44', 'La Guajira'],
  ['47', 'Magdalena'],
  ['50', 'Meta'],
  ['52', 'Nariño'],
  ['54', 'Norte de Santander'],
  ['63', 'Quindío'],
  ['66', 'Risaralda'],
  ['68', 'Santander'],
  ['70', 'Sucre'],
  ['73', 'Tolima'],
  ['76', 'Valle del Cauca'],
  ['81', 'Arauca'],
  ['85', 'Casanare'],
  ['86', 'Putumayo'],
  ['88', 'Archipiélago de San Andrés, Providencia y Santa Catalina'],
  ['91', 'Amazonas'],
  ['94', 'Guainía'],
  ['95', 'Guaviare'],
  ['97', 'Vaupés'],
  ['99', 'Vichada'],
]

const MUNICIPIOS: [string, string][] = [
  ['05001', 'Medellín'],
  ['05045', 'Apartadó'],
  ['05088', 'Bello'],
  ['05266', 'Envigado'],
  ['05360', 'Itagüí'],
  ['05615', 'Rionegro'],
  ['05631', 'Sabaneta'],
  ['08001', 'Barranquilla'],
  ['08433', 'Malambo'],
  ['08573', 'Puerto Colombia'],
  ['08758', 'Soledad'],
  ['11001', 'Bogotá, D.C.'],
  ['13001', 'Cartagena de Indias'],
  ['13430', 'Magangué'],
  ['13836', 'Turbaco'],
  ['15001', 'Tunja'],
  ['15176', 'Chiquinquirá'],
  ['15238', 'Duitama'],
  ['15759', 'Sogamoso'],
  ['17001', 'Manizales'],
  ['17380', 'La Dorada'],
  ['18001', 'Florencia'],
  ['19001', 'Popayán'],
  ['19698', 'Santander de Quilichao'],
  ['20001', 'Valledupar'],
  ['20011', 'Aguachica'],
  ['23001', 'Montería'],
  ['23162', 'Cereté'],
  ['23417', 'Santa Cruz de Lorica'],
  ['25175', 'Chía'],
  ['25269', 'Facatativá'],
  ['25290', 'Fusagasugá'],
  ['25307', 'Girardot'],
  ['25754', 'Soacha'],
  ['25899', 'Zipaquirá'],
  ['27001', 'Quibdó'],
  ['41001', 'Neiva'],
  ['41298', 'Garzón'],
  ['41551', 'Pitalito'],
  ['44001', 'Riohacha'],
  ['44430', 'Maicao'],
  ['47001', 'Santa Marta'],
  ['47189', 'Ciénaga'],
  ['50001', 'Villavicencio'],
  ['50006', 'Acacías'],
  ['50313', 'Granada'],
  ['52001', 'Pasto'],
  ['52356', 'Ipiales'],
  ['52835', 'San Andrés de Tumaco'],
  ['54001', 'Cúcuta'],
  ['54498', 'Ocaña'],
  ['54518', 'Pamplona'],
  ['54874', 'Villa del Rosario'],
  ['63001', 'Armenia'],
  ['63130', 'Calarcá'],
  ['66001', 'Pereira'],
  ['66170', 'Dosquebradas'],
  ['66682', 'Santa Rosa de Cabal'],
  ['68001', 'Bucaramanga'],
  ['68081', 'Barrancabermeja'],
  ['68276', 'Floridablanca'],
  ['68307', 'Girón'],
  ['68547', 'Piedecuesta'],
  ['70001', 'Sincelejo'],
  ['70215', 'Corozal'],
  ['73001', 'Ibagué'],
  ['73268', 'Espinal'],
  ['76001', 'Cali'],
  ['76109', 'Buenaventura'],
  ['76111', 'Guadalajara de Buga'],
  ['76147', 'Cartago'],
  ['76364', 'Jamundí'],
  ['76520', 'Palmira'],
  ['76834', 'Tuluá'],
  ['76892', 'Yumbo'],
  ['81001', 'Arauca'],
  ['81736', 'Saravena'],
  ['85001', 'Yopal'],
  ['85010', 'Aguazul'],
  ['86001', 'Mocoa'],
  ['86568', 'Puerto Asís'],
  ['88001', 'San Andrés'],
  ['88564', 'Providencia'],
  ['91001', 'Leticia'],
  ['94001', 'Inírida'],
  ['95001', 'San José del Guaviare'],
  ['97001', 'Mitú'],
  ['99001', 'Puerto Carreño'],
]

/** Regla IN-13: la ruta se calcula, nunca se almacena aparte del codigo. */
export function rutaDeCodigo(codigo: string): string {
  if (codigo === '00') return '/00'
  if (codigo.length === 2) return `/00/${codigo}`
  return `/00/${codigo.slice(0, 2)}/${codigo}`
}

function aTerritorio([codigo, nombre]: [string, string]): Territorio {
  return { codigo, nombre, ruta: rutaDeCodigo(codigo) }
}

const LISTA_DEPARTAMENTOS = DEPARTAMENTOS.map(aTerritorio).sort((a, b) =>
  a.nombre.localeCompare(b.nombre, 'es'),
)
const LISTA_MUNICIPIOS = MUNICIPIOS.map(aTerritorio)

export const NACION: Territorio = { codigo: '00', nombre: 'Colombia', ruta: '/00' }

export function departamentos(): Territorio[] {
  return LISTA_DEPARTAMENTOS
}

export function municipiosDe(codigoDepartamento: string): Territorio[] {
  return LISTA_MUNICIPIOS.filter((m) =>
    m.codigo.startsWith(codigoDepartamento),
  ).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export function municipio(codigo: string): Territorio | null {
  return LISTA_MUNICIPIOS.find((m) => m.codigo === codigo) ?? null
}

export function departamento(codigo: string): Territorio | null {
  return LISTA_DEPARTAMENTOS.find((d) => d.codigo === codigo) ?? null
}

export function departamentoDeMunicipio(codigoMunicipio: string): Territorio | null {
  return departamento(codigoMunicipio.slice(0, 2))
}

/** Territorio (nacion, departamento o municipio) a partir de su ruta. */
export function territorioDeRuta(ruta: string): Territorio | null {
  const codigo = ruta.split('/').filter(Boolean).pop()
  if (!codigo) return null
  if (codigo === '00') return NACION
  return codigo.length === 2 ? departamento(codigo) : municipio(codigo)
}

/** «Medellín, Antioquia». */
export function nombreCompletoMunicipio(codigo: string): string {
  const m = municipio(codigo)
  const d = departamentoDeMunicipio(codigo)
  if (!m) return codigo
  return d && d.codigo !== '11' ? `${m.nombre}, ${d.nombre}` : m.nombre
}
