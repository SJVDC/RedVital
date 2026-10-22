# RedVital — Especificación de Requerimientos (SRS) V4.0

**Plataforma Nacional para la Gestión Integral del Ciclo de Vida de la Donación de Sangre**
Arkhé Software S.A.S. — *De la raíz a la red*

- **Curso:** Arquitectura de Software Empresarial
- **Cliente:** Profesor de la asignatura, en el rol simulado de Ministerio de Salud y Protección Social
- **Sustituye a:** SRS V3.0 (22 de septiembre de 2026)
- **Versión:** 4.0
- **Estado:** Propuesta para revisión y aprobación
- **Fecha:** 18 de octubre de 2026
- Pontificia Universidad Javeriana — Bogotá, Colombia

---

# Control de versiones

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| 1.0 | 16/08/2026 | Equipo Arkhé | Versión inicial. Identificación de usuarios y preocupaciones, catálogo de módulos funcionales, matriz de usuarios contra módulos, requerimientos funcionales y no funcionales, restricciones y matriz de trazabilidad hacia el Backlog V1. |
| 2.0 | 30/08/2026 | Equipo Arkhé | Depuración del catálogo de módulos conforme al criterio de contexto acotado y propiedad de datos: la gamificación y la extensibilidad del dominio dejan de tratarse como módulos, y la administración territorial se separa del control de acceso. Asignación explícita de cada módulo al servicio propietario, exigida por la arquitectura distribuida. Requerimientos funcionales redactados en sintaxis controlada EARS y descompuestos hasta cumplir el criterio de singularidad. Requerimientos no funcionales reclasificados conforme a ISO/IEC 25010:2023 y expresados como escenarios de seis partes con medida de respuesta. Incorporación de las restricciones de diseño del cliente y actualización del marco normativo aplicable. |
| 3.0 | 22/09/2026 | Equipo Arkhé | Incorporación de RF-22, administración de la jurisdicción de un usuario, que hace administrable el alcance territorial de datos especificado en RNF-02 y surte efecto en el siguiente token de acceso emitido, conforme a ADR-008. Incorporación de RF-23 y RF-24, inicio y término de la sesión, que dan requerimiento de origen a las pantallas de sesión. Asignación de los módulos y de los servicios transversales a los cinco servicios que fija ADR-014: M2 pasa al Servicio de Campañas, ST1 al trabajador de Notificaciones alimentado por la bandeja de salida del Servicio de Donación, y la emisión de identidad al Servicio de Identidad. ST2 se describe con almacenamiento en cuatro contextos y consulta compuesta, conforme a ADR-016. Reclasificación de RNF-05 a Flexibilidad—Adaptabilidad conforme a ISO/IEC 25010:2023 y a ADR-012, con declaración de su prioridad MoSCoW en la Sección 10, y de RNF-11 a Flexibilidad—Instalabilidad. RNF-06 se reformula sobre la bandeja de salida. La reserva de cupo, RF-15, pasa de M1 a M2, porque el cupo y sus reservas pertenecen al Servicio de Campañas; los donantes escriben en M2 al reservar. La matriz de usuarios contra módulos se declara vista derivada de la matriz de autorización por grupo de operaciones del Documento de Diseño, que ADR-011 establece como especificación normativa única del control de acceso, y se ajustan en consecuencia los alcances de lectura de U6 y de U7. |
| 4.0 | 18/10/2026 | Equipo Arkhé | Conciliación con la arquitectura vigente (SAD V3.1, SDD V2.1, DD V3.1, Infraestructura V2.1 y TD V1.1). Las dependencias entre módulos (Cuadro 10) y los avisos de campaña de ST1 se redactan como referencia lógica y proyección local alimentada por eventos, sin consulta HTTP directa. RNF-06 contempla también la indisponibilidad de la plataforma de eventos (Kafka). La operación y los datos de la asignación de jurisdicción (RF-22) se asignan al Servicio de Identidad (ST3); su interfaz de administración permanece en M6. La matriz de autorización se atribuye a ADR-011 y no al «Documento de Diseño» (esta corrección sustituye a la referencia del historial de la versión 3.0). U1 incorpora la consulta de campañas publicadas. Se precisa el estado de RF-15 en el incremento del Sprint 3. Se añade la Sección 11 con las decisiones que quedan pendientes. Ningún requerimiento cambia de prioridad ni se incorpora o retira. |

# Aprobaciones

| Rol | Responsable | Firma / Fecha |
|---|---|---|
| Product Owner | Alexander Aponte |  |
| Scrum Master / Project Manager | Carlos Santiago Pinzón |  |
| Arquitecta de Software | Sara |  |
| QA / Tester | Tomás |  |

La aprobación del Product Owner acredita que el alcance funcional aquí especificado corresponde a lo acordado con el cliente. La de la Arquitecta de Software acredita la coherencia entre los módulos y la arquitectura registrada en los ADR. La de QA acredita que todo requerimiento es verificable.

## 1. Introducción

### 1.1 Propósito

Este documento especifica los requerimientos del sistema RedVital: quiénes lo usan y qué les preocupa, en qué módulos se organiza la solución, qué debe hacer el sistema y con qué nivel de calidad debe hacerlo.

Constituye la fuente única de verdad sobre el alcance funcional del sistema. El backlog se deriva de este documento, y toda historia de usuario debe poder rastrearse hasta un requerimiento aquí especificado o hasta una restricción de la Sección 7, conforme a la matriz de la Sección 9.

### 1.2 Alcance

RedVital cubre de extremo a extremo el ciclo de vida operativo de la donación de sangre en Colombia: desde la captación y motivación del donante, pasando por la trazabilidad de cada unidad y la gestión del inventario, hasta la disposición final de las unidades no aptas. Incorpora además la coordinación entre bancos de sangre y la supervisión diferenciada por nivel territorial.

El sistema opera bajo un principio de escalamiento en dos niveles: ante una necesidad de un componente sanguíneo, privilegia primero la redistribución entre bancos de la red con excedente disponible, y solo escala a la movilización de donantes cuando la red interna no cubre el requerimiento.

Quedan fuera del alcance la gestión clínica del receptor, la práctica transfusional en el punto de atención y el resultado individualizado de las pruebas de tamizaje, que el sistema conoce únicamente como veredicto de aptitud.

### 1.3 Definiciones

**Cuadro 3:** Definiciones de los términos empleados en este documento.

| Término | Definición |
|---|---|
| Bandeja de salida | Registro de eventos notificables que el servicio emisor escribe en la misma transacción que el hecho que los origina, y que el trabajador de notificaciones consume por contrato. |
| Característica | Capacidad que enriquece un módulo pero que no posee datos propios ni usuarios que trabajen exclusivamente en ella. No constituye módulo. |
| Componente sanguíneo | Fracción obtenida del fraccionamiento de una donación: glóbulos rojos, plasma o plaquetas. |
| Contexto acotado | Frontera dentro de la cual un modelo de dominio es coherente y cada término tiene un único significado. Determina dónde se corta un servicio. |
| EARS | Easy Approach to Requirements Syntax. Sintaxis controlada para redactar requerimientos en lenguaje natural. |
| Elegibilidad | Condición de un donante para donar en un momento dado, determinada por el intervalo transcurrido desde su última donación. |
| Jurisdicción | Ámbito territorial (nacional, departamental, municipal o institucional) sobre el cual un usuario tiene visibilidad. |
| Módulo funcional | Agrupación cohesiva de funcionalidad que posee datos propios y cuenta con usuarios que trabajan dentro de ella. |
| Servicio propietario | Servicio desplegable que es dueño exclusivo de los datos de un módulo y única vía de acceso a ellos. |
| Servicio transversal | Capacidad técnica consumida por varios módulos, que no constituye un módulo funcional por sí misma. |
| Sesión | Periodo, de ocho horas como máximo, durante el cual un usuario autenticado obtiene tokens de acceso de quince minutos de vigencia sin volver a presentar sus credenciales. |
| Tamizaje | Conjunto de pruebas aplicadas a la sangre donada para determinar su aptitud transfusional. |
| Unidad | Ejemplar individual de un componente sanguíneo, identificable y trazable de forma única. |
| Unidad no apta | Unidad que, tras el tamizaje, no puede destinarse a transfusión y debe seguir el protocolo de disposición final. |

Definiciones de los términos empleados en este documento.

### 1.4 Referencias

**Cuadro 4:** Documentos y normas que este documento aplica o de los que depende.

| Ref. | Fuente |
|---|---|
| \[1\] | Documento de Proyecto V2. Formulación, objetivos, alcance y limitaciones del proyecto. |
| \[2\] | Documento de Herramientas, Políticas y Lineamientos V3.0. Tech Radar, restricciones de diseño y políticas de construcción. |
| \[3\] | ADR-003. Arquitectura distribuida de servicios de grano grueso por contexto acotado. |
| \[4\] | ADR-014. Descomposición del sistema en cinco servicios de grano grueso y topología por zonas de confianza. Reemplaza a ADR-004. (Numeración pendiente de conciliar con el registro de ADR; ver Sección 11.) |
| \[5\] | ADR-005. Base de datos relacional con esquema independiente por servicio. |
| \[6\] | ISO/IEC/IEEE 29148:2018. Systems and software engineering — Life cycle processes — Requirements engineering. |
| \[7\] | ISO/IEC 25010:2023. Systems and software engineering — SQuaRE — Product quality model. |
| \[8\] | Mavin, A., Wilkinson, P., Harwood, A. y Novak, M. Easy Approach to Requirements Syntax (EARS), IEEE RE’09, 2009. |
| \[9\] | Bass, L., Clements, P. y Kazman, R. Software Architecture in Practice. Técnica de escenarios de atributos de calidad. |
| \[10\] | Congreso de la República de Colombia. Ley 1581 de 2012, protección de datos personales. |
| \[11\] | Presidencia de la República de Colombia. Decreto 1377 de 2013, reglamentario de la Ley 1581 de 2012. |
| \[12\] | Presidencia de la República de Colombia. Decreto 1571 de 1993, funcionamiento de bancos de sangre. |
| \[13\] | Ministerio de Salud. Resolución 901 de 1996, Manual de Normas Técnicas, Administrativas y de Procedimientos para Bancos de Sangre. |
| \[14\] | Ministerio de Salud y Protección Social. Resolución 1676 de 2023, que modifica la Resolución 901 de 1996 y deroga la Resolución 3212 de 2018. |
| \[15\] | Instituto Nacional de Salud. Circular Externa 026 de 2017, sobre ingreso, administración y tratamiento de datos en SIHEVI-INS. |
| \[16\] | Instituto Nacional de Salud. Informe Nacional de Bancos de Sangre 2024. |
| \[17\] | W3C. Web Content Accessibility Guidelines (WCAG) 2.2, nivel AA. |
| \[18\] | ADR-008. Emisión y validación del token de sesión con firma asimétrica. |
| \[19\] | ADR-011. Matriz de autorización por grupo de operaciones como especificación normativa del control de acceso. |
| \[20\] | ADR-012. Clasificación de la extensibilidad del dominio en ISO/IEC 25010:2023. |
| \[21\] | ADR-016. Bitácora de auditoría distribuida en cuatro contextos con consulta compuesta. |

Documentos y normas que este documento aplica o de los que depende.

## 2. Usuarios y preocupaciones

### 2.1 Identificación de usuarios

Se identifican siete tipos de usuario. La distinción entre ellos no es cosmética: cada uno tiene un alcance de datos distinto, lo que condiciona directamente el diseño del control de acceso especificado en RNF-02.

**Cuadro 5:** Tipos de usuario del sistema y su alcance de datos.

| ID | Usuario | Descripción | Alcance de datos |
|---|---|---|---|
| U1 | Donante anónimo | Persona que se registra sin entregar datos de identificación personal. | Solo el registro de su propia donación y la consulta de campañas publicadas, sin sesión y sin perfil persistente asociado a su identidad. |
| U2 | Donante registrado | Persona con perfil completo y autorización explícita de tratamiento de datos sensibles. | Su propio perfil, historial de donación, elegibilidad y reconocimientos. |
| U3 | Operador de banco de sangre | Personal que opera el día a día: registra donaciones, aplica el resultado de tamizaje y gestiona unidades. | Unidades, donaciones e inventario de su propia institución. |
| U4 | Administrador de banco de sangre | Responsable de la institución: configura umbrales, publica campañas y aprueba transferencias. | Todo lo de su institución, más su configuración y sus indicadores. |
| U5 | Coordinador territorial | Dirección territorial o distrital de salud que supervisa los bancos de su departamento o municipio. | Datos agregados y por institución, restringidos a su jurisdicción territorial. |
| U6 | Administrador nacional | Instituto Nacional de Salud y Ministerio de Salud, en su rol de rectoría de la Red Nacional. | Todo el territorio nacional, en vista agregada. |
| U7 | Auditor | Rol de verificación de cumplimiento sobre la bitácora del sistema. | Bitácora de auditoría. Solo lectura, sin capacidad de modificación. |

Tipos de usuario del sistema y su alcance de datos.

### 2.2 Preocupaciones por usuario

Las preocupaciones expresan qué le importa a cada usuario y qué teme que salga mal. Son el insumo directo de los requerimientos no funcionales de la Sección 6.

**Cuadro 6:** Preocupaciones de los usuarios y requerimientos que las atienden.

| ID | Usuario | Preocupación | Atiende |
|---|---|---|---|
| P1 | U1 Donante anónimo | Que registrarse sea rápido y no le exijan entregar datos personales como condición para donar. | RNF-03, RF-01 |
| P2 | U2 Donante registrado | Que sus datos de salud no se divulguen ni se usen para fines distintos de los autorizados. | RNF-01, RF-02, RF-23, RF-24 |
| P3 | U2 Donante registrado | Saber cuándo vuelve a ser elegible, sin tener que calcularlo por su cuenta. | RF-02, RF-12, RF-17 |
| P4 | U2 Donante registrado | Que su contribución sea reconocida de alguna forma, sin que eso se convierta en un pago. | RF-11 |
| P5 | U3 Operador de banco | Poder marcar una unidad como no apta sin quedar expuesto a divulgar un diagnóstico. | RNF-01, RF-05 |
| P6 | U3 Operador de banco | Que ninguna unidad vencida siga apareciendo como disponible para transfusión. | RNF-08, RF-18, RF-20 |
| P7 | U3 Operador de banco | Que registrar una donación no falle porque un servicio externo no responde. | RNF-06, RF-03 |
| P8 | U4 Administrador de banco | Enterarse a tiempo de una escasez, antes de que se vuelva crítica. | RF-19, RF-12 |
| P9 | U4 Administrador de banco | Cubrir un déficit sin tener que montar una campaña nueva cada vez. | RF-10, RF-14 |
| P10 | U4 Administrador de banco | Consultar el inventario de su institución sin esperas que interrumpan la operación. | RNF-04, RF-07 |
| P11 | U5 Coordinador territorial | Ver el estado de los bancos de su jurisdicción sin acceder a información que no le corresponde. | RNF-02, RF-09, RF-22, RF-23 |
| P12 | U5 Coordinador territorial | Contar con indicadores comparables entre los bancos que supervisa. | RF-13 |
| P13 | U6 Administrador nacional | Tener una vista nacional consolidada, hoy inexistente, del estado de la red. | RF-09, RF-13 |
| P14 | U6 Administrador nacional | Que la plataforma admita en el futuro otros tipos de donación sin rehacerse. | RNF-05 |
| P15 | U7 Auditor | Que toda operación sobre una unidad quede registrada con autor y marca temporal. | RNF-09, RF-04, RF-06 |
| P16 | U7 Auditor | Que los intentos de acceso indebido queden registrados, no solo bloqueados. | RNF-02, RNF-09 |
| P17 | U7 Auditor | Poder examinar la bitácora sin que su propia consulta pueda alterarla. | RF-21, RNF-09 |
| P18 | U1, U2 Donantes | Que la interfaz sea utilizable por personas con limitaciones visuales o motrices. | RNF-10, RF-01 |

Preocupaciones de los usuarios y requerimientos que las atienden.

## 3. Módulos funcionales

### 3.1 Criterio de modularización

Un módulo funcional del sistema debe satisfacer de forma simultánea tres condiciones:

1.  **Propiedad de datos.** Es dueño exclusivo de al menos una entidad del dominio. Si su información pertenece a otro módulo, no es un módulo.

2.  **Usuario que trabaja en él.** Existe al menos un tipo de usuario que escribe o consulta dentro de su frontera como parte de su labor.

3.  **Coherencia de modelo.** Sus términos y reglas conforman un contexto acotado: dentro de su frontera cada término tiene un único significado.

Lo que no satisface las tres condiciones es una característica de un módulo, un servicio transversal o un atributo de calidad, y se especifica como tal. Este criterio determina tres clasificaciones del catálogo que conviene declarar de forma explícita, porque se apartan de la organización de la versión anterior:

- El **reconocimiento no monetario** al donante no posee entidad propia, pues las insignias son un atributo derivado del historial de donación, y ningún usuario las administra. Es una característica de M1 y se especifica en RF-11.

- La **extensibilidad del modelo de dominio** no tiene usuarios ni funcionalidad de cara al usuario: describe una propiedad del modelo. Se especifica como atributo de calidad en RNF-05 y como restricción de diseño interna en RI-01.

- La **restricción de visibilidad por jurisdicción** no es funcionalidad sino la aplicación de un atributo de calidad. Se especifica en RNF-02 y se implementa en el servicio transversal ST3. El módulo M6 conserva únicamente lo que sí es funcionalidad: mantener la jerarquía territorial y el registro de instituciones.

### 3.2 Catálogo de módulos

**Cuadro 7:** Catálogo de módulos funcionales del sistema.

| ID | Módulo | Responsabilidad | Prioridad |
|---|---|---|---|
| M1 | Gestión de Donantes | Registro voluntario y anónimo, perfil, cálculo de elegibilidad, historial de donación y reconocimiento no monetario. | Must |
| M2 | Gestión de Campañas | Planificación, publicación, cupos y reservas de cupo, y seguimiento de resultados de campañas de donación. | Must |
| M3 | Trazabilidad y Ciclo de Vida de la Unidad | Origen, estados de la unidad, veredicto de tamizaje y disposición final. | Must |
| M4 | Inventario y Alertas | Existencias por componente y tipo de sangre, umbrales configurables, alertas de escasez y de vencimiento próximo, y exclusión de unidades vencidas. | Must |
| M5 | Red de Transferencias entre Bancos | Sugerencia y gestión de la redistribución de unidades entre bancos, con flujo de aprobación, y movilización de donantes cuando la red no cubre el déficit. | Should |
| M6 | Administración Institucional y Territorial | Mantenimiento de la jerarquía nacional, departamental y municipal, y del registro de las instituciones adscritas a cada nivel. | Must |
| M7 | Analítica e Indicadores | Tableros de captación, vencimiento, unidades no aptas y cobertura territorial, agregados al nivel de jurisdicción del usuario. | Should |

Catálogo de módulos funcionales del sistema.

M7 no posee datos propios: agrega información de M3, M4 y M6. Se conserva como módulo porque cuenta con usuarios que trabajan exclusivamente en él, U5 y U6, y con un entregable identificable. Su condición de módulo de solo lectura es una restricción de diseño: ninguna operación de M7 modifica el estado de las entidades que agrega.

### 3.3 Correspondencia de identificadores

El backlog y los ADR emitidos antes de esta versión referencian los identificadores del catálogo anterior. La correspondencia es la siguiente.

**Cuadro 8:** Correspondencia entre los identificadores de módulo de la versión anterior y los vigentes.

| Anterior | Denominación anterior | Vigente |
|---|---|---|
| M1 | Gestión de Donantes | M1, con el reconocimiento no monetario incorporado como característica. |
| M2 | Motivación y Gamificación | Suprimido como módulo. Su funcionalidad se especifica en RF-11, dentro de M1. |
| M3 | Gestión de Campañas | M2. |
| M4 | Trazabilidad y Ciclo de Vida | M3. |
| M5 | Inventario y Alertas | M4, con la exclusión automática de unidades vencidas incorporada. |
| M6 | Red de Transferencias | M5, con la movilización de donantes incorporada. |
| M7 | Administración Territorial | M6, acotado a la administración de la jerarquía y del registro institucional. La restricción de visibilidad se traslada a RNF-02 y a ST3. |
| M8 | Analítica e Indicadores | M7. |
| M9 | Extensibilidad de Dominio | Suprimido como módulo. Se especifica en RNF-05 y en RI-01. |

Correspondencia entre los identificadores de módulo de la versión anterior y los vigentes.

### 3.4 Servicios transversales

Además de los módulos funcionales, el sistema define capacidades técnicas consumidas por varios módulos. No constituyen módulos de negocio: ningún usuario las utiliza de forma directa, sino los módulos que las invocan.

**Cuadro 9:** Servicios transversales y sus consumidores.

| ID | Servicio | Responsabilidad y consumidores |
|---|---|---|
| ST1 | Notificaciones | Entrega asíncrona de mensajes al donante y a los bancos. Consumido por M1 (elegibilidad recuperada y reconocimientos), M2 (campañas en la jurisdicción del donante), M4 (alertas de escasez y de vencimiento) y M5 (solicitudes y sugerencias de transferencia). Reside en el trabajador de Notificaciones, que no tiene base de datos propia y consume por contrato la bandeja de salida del Servicio de Donación: los eventos de la bandeja de salida se publican en Kafka y Notificaciones los consume de allí. Los avisos de campaña los genera el Servicio de Donación a partir de su proyección local de campañas publicadas, alimentada por los eventos que publica el Servicio de Campañas. |
| ST2 | Auditoría | Registro inmutable de toda operación que cambie el estado de una unidad, de toda acción administrativa y de todo acceso denegado. Consumido por M1 a M6 y por ST3. Cada servicio con base escribe los registros de las entidades que posee; el API Gateway entrega los accesos que deniega al Servicio de Identidad. La consulta del auditor la sirve el Servicio Institucional, que compone las cuatro series (el mecanismo con que obtiene los datos de los otros contextos está pendiente de decisión; ver Sección 11). |
| ST3 | Autenticación y autorización | Verificación de identidad y aplicación del alcance territorial de datos. Consumido por todos los módulos. La emisión de sesiones y de tokens, y la asignación y modificación de la jurisdicción de un usuario (RF-22), residen en el Servicio de Identidad; la compuerta de autorización, en el API Gateway; el filtrado por jurisdicción a nivel de registro, en cada servicio propietario. |

Servicios transversales y sus consumidores.

### 3.5 Asignación de módulos a servicios

La arquitectura del sistema es distribuida y ningún servicio accede a la base de datos de otro. En consecuencia, cada módulo tiene un servicio propietario declarado, que es el dueño exclusivo de sus datos y la única vía de acceso a ellos.

El sistema se compone de cinco servicios, conforme a ADR-014: Identidad, Institucional y Campañas sobre .NET, y Donación y Notificaciones sobre Java. Identidad y Notificaciones alojan servicios transversales, ST3 en su parte de emisión y ST1 respectivamente, y no son propietarios de ningún módulo funcional.

Las dependencias entre contextos no se resuelven mediante consulta HTTP directa entre servicios ni mediante acceso a bases ajenas. Cuando un módulo requiere un dato de otro contexto, mantiene una referencia lógica y, si necesita el dato, una proyección local alimentada por los eventos que publica, mediante Kafka, el contexto propietario.

**Cuadro 10:** Servicio propietario de cada módulo y dependencias entre contextos.

| ID | Módulo | Servicio propietario | Dependencia por contrato |
|---|---|---|---|
| M1 | Gestión de Donantes | Servicio de Donación (Java) | Referencia lógica a M2 y, cuando requiere el dato de las campañas disponibles, proyección local alimentada por eventos (Kafka) del Servicio de Campañas; sin consulta HTTP directa. |
| M2 | Gestión de Campañas | Servicio de Campañas (.NET) | Referencia lógica a M6 y, cuando requiere el dato de la sede y la jurisdicción de la campaña, proyección local alimentada por eventos (Kafka) del Servicio Institucional; sin consulta HTTP directa. |
| M3 | Trazabilidad y Ciclo de Vida | Servicio de Donación (Java) | Referencia lógica a M6 y, cuando requiere el dato de la institución custodia de la unidad, proyección local alimentada por eventos (Kafka) del Servicio Institucional; sin consulta HTTP directa. |
| M4 | Inventario y Alertas | Servicio de Donación (Java) | Referencia lógica a M6 y, cuando requiere el dato de la institución propietaria de las existencias, proyección local alimentada por eventos (Kafka) del Servicio Institucional; sin consulta HTTP directa. |
| M5 | Red de Transferencias | Servicio de Donación (Java) | Referencia lógica a M6 y, cuando requiere el dato de las instituciones cedente y receptora, proyección local alimentada por eventos (Kafka) del Servicio Institucional; sin consulta HTTP directa. |
| M6 | Administración Institucional y Territorial | Servicio Institucional (.NET) | Ninguna. Es el contexto de referencia territorial del sistema. |
| M7 | Analítica e Indicadores | Servicio Institucional (.NET) | Obtiene las series de M3 y M4, en el Servicio de Donación, mediante proyecciones locales o contratos de lectura (mecanismo pendiente de decisión; ver Sección 11). No escribe en ellos. |

Servicio propietario de cada módulo y dependencias entre contextos.

**Jurisdicción de usuario (RF-22).** La interfaz de administración de la jurisdicción de un usuario pertenece a M6; la operación y los datos de jurisdicción pertenecen al Servicio de Identidad (ST3), y la jurisdicción asignada se aplica a partir del siguiente token de acceso emitido, conforme a ADR-008.

## 4. Usuarios contra módulos

La matriz siguiente es una **vista de lectura**, derivada de la matriz de autorización por grupo de operaciones definida en ADR-011, que es la especificación normativa única del control de acceso del sistema. Se ofrece porque la agrupación por módulo facilita la lectura funcional; ante cualquier discrepancia, gana la matriz de ADR-011, y es contra ella que se prueba el escenario de RNF-02. Se usa **E** cuando el usuario escribe o modifica información, **L** cuando solo la consulta, y celda vacía cuando no tiene acceso.

**Cuadro 11:** Matriz de usuarios contra módulos funcionales.

| Usuario | M1 | M2 | M3 | M4 | M5 | M6 | M7 |
|---|---|---|---|---|---|---|---|
| U1 — Donante anónimo | E | E |  |  |  |  |  |
| U2 — Donante registrado | E | E |  |  |  |  |  |
| U3 — Operador de banco | L | L | E | E | L |  |  |
| U4 — Administrador de banco | L | E | L | E | E | L | L |
| U5 — Coordinador territorial |  | L | L | L | L | E | L |
| U6 — Administrador nacional |  | L | L | L | L | E | L |
| U7 — Auditor |  |  | L |  |  | L |  |

Lecturas relevantes de la matriz:

- M3, Trazabilidad, es el módulo más consultado, con acceso de cinco de los siete usuarios. Solo U3 escribe en él: el registro del ciclo de vida de una unidad es responsabilidad exclusiva del operador del banco que la custodia.

- Ningún donante accede a M3, M4, M5, M6 ni M7. La separación es deliberada: el donante nunca ve información de inventario ni de otras instituciones. Su acceso a M2 se limita a consultar las campañas publicadas en su jurisdicción y a reservar cupo en ellas.

- U7 es el único usuario sin ninguna capacidad de escritura en el sistema, y su alcance de lectura se limita a lo que necesita para reconstruir la historia de una unidad: trazabilidad, jerarquía institucional y la bitácora de auditoría. No accede a inventario ni a transferencias, porque su alcance de datos declarado en la Tabla 5 es la bitácora y no la operación. La ausencia de escritura es una restricción de diseño, no una omisión: un auditor que pueda modificar aquello que audita invalida la auditoría.

- U6 no escribe en M7. La analítica es de solo lectura sobre los datos que agrega, conforme a RI-03; su vista nacional consolidada es una lectura agregada y no una capacidad de edición. Escribe únicamente en M6, donde mantiene la jerarquía territorial y el registro de instituciones.

- U5 y U6 escriben únicamente en M6, porque la administración de la jerarquía territorial y del registro institucional es su labor propia. Sobre los módulos operativos su acceso es de solo consulta.

## 5. Requerimientos funcionales

### 5.1 Convención de redacción

Los requerimientos funcionales se redactan en sintaxis controlada EARS, que restringe la estructura de la frase para eliminar ambigüedad y hacer verificable cada enunciado. El orden de las cláusulas es fijo: primero la precondición de estado, después el disparador, después el sistema y por último la respuesta. Cada requerimiento enuncia una sola capacidad, conforme al criterio de singularidad de ISO/IEC/IEEE 29148:2018.

**Cuadro 12:** Patrones EARS empleados y su forma en español.

| Patrón | Plantilla | Cuándo se emplea |
|---|---|---|
| Ubicuo | El sistema deberá ‹respuesta›. | Capacidad permanente, sin condición que la active. |
| Dirigido por evento | Cuando ‹disparador›, el sistema deberá ‹respuesta›. | La capacidad se activa ante un suceso discreto. |
| Dirigido por estado | Mientras ‹estado›, el sistema deberá ‹respuesta›. | La capacidad rige durante todo el tiempo que dure una condición. |
| Comportamiento no deseado | Si ‹condición›, entonces el sistema deberá ‹respuesta›. | La capacidad responde a una condición indeseada o excepcional. |
| Complejo | Combinación de las anteriores en el orden canónico. | La capacidad requiere estado y disparador simultáneos. |

Patrones EARS empleados y su forma en español.

El verbo modal de obligación es siempre “deberá”. El texto que no constituye requerimiento no lo emplea.

### 5.2 Catálogo de requerimientos funcionales

**Cuadro 13:** Catálogo de requerimientos funcionales.

| ID | Requerimiento | Enunciado | Mód. | MoSCoW |
|---|---|---|---|---|
| RF-01 | Registro voluntario de donante | Cuando una persona solicite registrarse como donante, el sistema deberá ofrecer una modalidad anónima sin campos obligatorios de identificación personal y una modalidad con perfil completo. | M1 | Must |
| RF-02 | Cálculo de elegibilidad | El sistema deberá calcular el estado de elegibilidad de cada donante registrado a partir de su tipo de sangre y de la fecha de su última donación aceptada. | M1 | Must |
| RF-03 | Registro de donación | Cuando un operador de banco registre una donación efectuada, el sistema deberá asociarla al donante, al banco y a la campaña correspondientes, y generar la unidad resultante. | M3 | Must |
| RF-04 | Trazabilidad de origen | El sistema deberá conservar, para cada unidad, su origen, su fecha de captación y la secuencia completa de estados por los que ha pasado, con autor y marca temporal de cada cambio. | M3 | Must |
| RF-05 | Marcado de unidad no apta | Cuando el veredicto de tamizaje de una unidad sea no apto, el sistema deberá marcarla como no apta sin registrar la causa clínica en ningún campo del modelo de datos. | M3 | Must |
| RF-06 | Protocolo de disposición final | Mientras una unidad esté marcada como no apta o vencida, el sistema deberá mantenerla en el flujo de disposición final y bloquear su despacho hasta que se registre su desecho. | M3 | Must |
| RF-07 | Consulta de existencias | El sistema deberá presentar al usuario las existencias de unidades disponibles por componente sanguíneo y tipo de sangre, dentro de su alcance de datos. | M4 | Must |
| RF-08 | Publicación de campañas | Cuando un administrador de banco publique una campaña, el sistema deberá hacerla visible con su fecha, sede y cupo disponible a los donantes cuya jurisdicción coincida con la de la sede. | M2 | Must |
| RF-09 | Administración de la jerarquía territorial | El sistema deberá mantener la jerarquía territorial nacional, departamental y municipal, y el registro de las instituciones adscritas a cada nivel. | M6 | Must |
| RF-10 | Transferencia entre bancos | Cuando un banco registre un déficit de un componente sanguíneo y otro banco de la red disponga de excedente compatible, el sistema deberá sugerir una transferencia y someterla a la aprobación del administrador del banco cedente. | M5 | Should |
| RF-11 | Reconocimiento no monetario | Cuando un donante registrado complete una donación aceptada, el sistema deberá actualizar sus insignias y su nivel de progresión sin otorgar contraprestación económica de ninguna clase. | M1 | Should |
| RF-12 | Notificación al donante | Cuando un donante recupere su elegibilidad, se publique una campaña en su jurisdicción o alcance un nuevo reconocimiento, el sistema deberá enviarle una notificación. | ST1 | Should |
| RF-13 | Tablero de indicadores | El sistema deberá presentar indicadores de captación, vencimiento, unidades no aptas y cobertura territorial, agregados al nivel de jurisdicción del usuario. | M7 | Should |
| RF-14 | Movilización de donantes | Si la red de bancos no dispone de excedente compatible para cubrir un déficit registrado, entonces el sistema deberá convocar a los donantes compatibles y elegibles de la jurisdicción afectada. | M5 | Could |
| RF-15 | Reserva de cupo con expiración | Mientras una reserva de cupo esté vigente, cuando transcurra el plazo de expiración sin confirmación del donante, el sistema deberá liberar el cupo y ponerlo nuevamente a disposición. | M2 | Could |
| RF-17 | Consulta de historial propio | El sistema deberá presentar a cada donante registrado su propio historial de donaciones y su estado de elegibilidad vigente. | M1 | Must |
| RF-18 | Exclusión de unidades vencidas | Cuando una unidad supere su fecha de vencimiento, el sistema deberá retirarla del inventario disponible y derivarla al flujo de disposición final sin intervención manual. | M4 | Must |
| RF-19 | Alerta de escasez | Cuando las existencias de un componente sanguíneo y tipo de sangre desciendan por debajo del umbral configurado por la institución, el sistema deberá generar una alerta de escasez dirigida al administrador del banco. | M4 | Must |
| RF-20 | Alerta de vencimiento próximo | Cuando una unidad alcance el umbral de días previos a su vencimiento configurado por la institución, el sistema deberá generar una alerta de vencimiento próximo. | M4 | Must |
| RF-21 | Consulta de bitácora | El sistema deberá presentar al auditor la bitácora de auditoría en modo de solo lectura, sin ofrecer ninguna operación que la modifique. | ST2 | Must |
| RF-22 | Asignación de jurisdicción de usuario | Cuando un administrador nacional asigne o modifique la jurisdicción de un usuario territorial, el sistema deberá registrar el ámbito asignado, aplicarlo a partir del siguiente token de acceso emitido para ese usuario y dejar constancia del cambio en la bitácora de auditoría. | M6 | Must |
| RF-23 | Inicio de sesión | Cuando un usuario registrado presente credenciales válidas, el sistema deberá iniciar una sesión con vigencia máxima de ocho horas y emitirle un token de acceso que transporte su rol y su jurisdicción. | ST3 | Must |
| RF-24 | Término de sesión | Cuando un usuario cierre su sesión o esta alcance su vigencia máxima, el sistema deberá revocarla y exigir de nuevo las credenciales para toda operación que requiera sesión. | ST3 | Must |

Catálogo de requerimientos funcionales.

Los umbrales de RF-19 y RF-20 son configurables por institución, conforme a la responsabilidad de U4 declarada en la Tabla 5. RF-23 y RF-24 alcanzan a los perfiles U2 a U7; el donante anónimo, U1, no inicia sesión. La respuesta ante credenciales incorrectas no indica cuál de los datos presentados falló, y las vigencias de ocho horas para la sesión y de quince minutos para el token de acceso son las que fija ADR-008. El identificador RF-16, que en la versión anterior especificaba la extensión a otros tipos de donación, no figura en este catálogo: por no describir una capacidad ejecutable, su contenido se especifica en RNF-05 y en RI-01.

En RF-22, el módulo M6 aporta la interfaz de administración; la operación y los datos de jurisdicción pertenecen al Servicio de Identidad (ST3), como se indica en la Sección 3.5.

## 6. Requerimientos no funcionales

Los atributos de calidad se clasifican conforme a ISO/IEC 25010:2023, en su revisión de nueve características, y se especifican mediante la técnica de escenario de atributo de calidad. Cada escenario declara la fuente del estímulo, el estímulo, el artefacto afectado, el entorno, la respuesta esperada y una medida de respuesta que hace verificable el requerimiento.

**Cuadro 14:** Catálogo de requerimientos no funcionales, con su escenario y su medida de respuesta.

| ID | Característica | Escenario | Medida de respuesta | Origen |
|---|---|---|---|---|
| RNF-01 | Seguridad — Confidencialidad | Un operador o administrador de banco consulta una unidad marcada como no apta en el Servicio de Donación, durante operación normal; el sistema presenta el veredicto de aptitud sin revelar la causa clínica ni información diagnóstica del donante. | Ningún campo del modelo de datos, de la interfaz, del registro de aplicación ni de las métricas admite la causa clínica. Verificable por inspección del modelo y por prueba de todas las respuestas de la API. | P2, P5 |
| RNF-02 | Seguridad — Control de acceso | Un usuario adscrito a una entidad territorial departamental solicita información de un banco fuera de su jurisdicción al API Gateway, durante operación normal; el sistema deniega el acceso y registra el intento en la bitácora de auditoría. | 100 % de las solicitudes fuera de jurisdicción denegadas y registradas. La respuesta no confirma la existencia del recurso ni nombra la jurisdicción ajena. | P11, P16 |
| RNF-03 | Capacidad de interacción — Operabilidad | Un donante sin experiencia previa inicia el registro anónimo en la Aplicación Web, desde un dispositivo móvil y sin asistencia; el sistema le permite completar el proceso. | El registro se completa en tres pasos o menos, sin ningún campo obligatorio de identificación personal. | P1 |
| RNF-04 | Eficiencia de desempeño — Comportamiento temporal | Un administrador de banco consulta el inventario consolidado de su institución al Servicio de Donación, en condiciones normales de operación; el sistema devuelve el resultado. | Tiempo de respuesta inferior a 3 segundos en el percentil 95 de las consultas. | P10 |
| RNF-05 | Flexibilidad — Adaptabilidad | Un desarrollador incorpora un tipo de donación distinto de la sangre al modelo de dominio del Servicio de Donación, en tiempo de desarrollo; el sistema admite la extensión. | La incorporación no exige modificar las entidades ni la lógica de trazabilidad e inventario existentes. Verificable por revisión del cambio. | P14 |
| RNF-06 | Fiabilidad — Tolerancia a fallos | El trabajador de notificaciones o la plataforma de eventos (Kafka) no está disponible mientras un operador de banco registra una donación en el Servicio de Donación; el sistema completa la operación principal y conserva el evento notificable en la bandeja de salida del Servicio de Donación. | La donación queda registrada en el 100 % de los casos. El evento se registra en la misma transacción que la donación y se entrega de forma asíncrona al restablecerse el trabajador o la plataforma de eventos, sin pérdida ni duplicado. | P7 |
| RNF-07 | Compatibilidad — Interoperabilidad | El Instituto Nacional de Salud requiere el reporte de donaciones y eventos adversos a SIHEVI-INS; el sistema expone los datos exigidos a través de un punto de integración documentado. | El reporte se produce sin modificar el modelo de dominio ni la lógica de los módulos que originan los datos. | P13 |
| RNF-08 | Adecuación funcional — Corrección funcional | El reloj del sistema alcanza la fecha de vencimiento de una unidad disponible en el Servicio de Donación, sin intervención de ningún usuario; el sistema la excluye del inventario disponible. | Ninguna unidad vencida figura como disponible en una consulta posterior a su fecha de vencimiento. | P6 |
| RNF-09 | Seguridad — Responsabilidad | Un usuario ejecuta una operación que cambia el estado de una unidad, o intenta un acceso fuera de su jurisdicción, en cualquier módulo; el sistema deja constancia del hecho en la bitácora de auditoría. | El registro contiene autor, operación, jurisdicción solicitada y marca temporal, es inmutable y no incluye el dato al que se intentó acceder. | P15, P16, P17 |
| RNF-10 | Capacidad de interacción — Inclusividad | Una persona con limitación visual o motriz opera la Aplicación Web mediante lector de pantalla o únicamente con teclado, durante operación normal; el sistema le permite completar las tareas de su perfil. | Conformidad con WCAG 2.2 nivel AA en contraste, foco visible, navegación por teclado y tamaño de objetivo táctil. Ninguna información se transmite solo por color. | P18 |
| RNF-11 | Flexibilidad — Instalabilidad | Un integrante del equipo despliega el sistema completo en un entorno distinto de aquel donde se construyó, a partir de las imágenes publicadas; el sistema arranca y opera. | El despliegue no exige modificar las imágenes: toda diferencia entre entornos se expresa como variable de entorno. | RD-03 |

Catálogo de requerimientos no funcionales, con su escenario y su medida de respuesta.

Los enunciados de RNF-08 y RNF-11 se mantienen sin cambio en esta versión; las lecturas alternativas que la arquitectura vigente admite para ambos se registran como decisiones pendientes en la Sección 11.

## 7. Restricciones

### 7.1 Restricciones de diseño del cliente

El cliente formuló ocho restricciones de diseño, de obligatorio cumplimiento y sin negociación técnica. Se transcriben literalmente, en los mismos términos en que figuran en el contexto maestro del proyecto y en el Documento de Herramientas, Políticas y Lineamientos.

**Cuadro 15:** Restricciones de diseño impuestas por el cliente.

| ID | Restricción | Consecuencia sobre la especificación |
|---|---|---|
| RD-01 | La solución debe ser distribuida. Queda explícitamente prohibido el monolito modular. Distribuido no equivale a microservicios. | Cada módulo declara un servicio propietario único y ninguna dependencia entre módulos se resuelve por acceso directo a datos ajenos. |
| RD-02 | El stack incluye como mínimo un componente en Java y como mínimo uno en .NET. | El reparto de módulos entre los servicios sigue la frontera de contexto acotado, no la conveniencia de implementación. ADR-014 lo realiza con tres servicios sobre .NET y dos sobre Java. |
| RD-03 | Todo contenerizado. | Sustenta RNF-11 y condiciona la especificación de los entornos de operación. |
| RD-04 | Documentación técnica en Markdown con Mermaid. | Los modelos que acompañan a esta especificación se versionan como texto en el repositorio de documentación. |
| RD-05 | Control de versiones con GitFlow. | Toda historia derivada de un requerimiento de este documento se implementa en su propia rama y se integra por revisión. |
| RD-06 | Múltiples repositorios bajo una organización de GitHub. | La trazabilidad de la Sección 9 debe conservarse cuando un requerimiento se implementa en más de un repositorio. |
| RD-07 | Todo el trabajo, técnico y funcional, va al backlog. | Las historias técnicas se rastrean hasta una restricción de esta sección cuando no derivan de un requerimiento funcional. |
| RD-08 | La seguridad es atributo de calidad de primer orden: el sistema maneja datos personales y sensibles. | Sustenta RNF-01, RNF-02 y RNF-09, que son de cumplimiento obligatorio en toda entrega. |

Restricciones de diseño impuestas por el cliente.

### 7.2 Restricciones de diseño internas

**Cuadro 16:** Restricciones de diseño adoptadas por el equipo.

| ID | Restricción | Fundamento |
|---|---|---|
| RI-01 | El modelo de dominio representa la donación de forma genérica, sin acoplar la trazabilidad ni el inventario al tipo de material donado. | Habilita la incorporación futura de otros tipos de donación sin rehacer los módulos existentes. Sustenta RNF-05 y atiende P14. |
| RI-02 | Ningún campo del modelo de datos admite la causa clínica por la cual una unidad fue marcada como no apta. | La confidencialidad se implementa en el modelo y no en la interfaz: lo que no se modela no puede exponerse por descuido. Sustenta RNF-01. |
| RI-03 | El módulo M7 es de solo lectura sobre los datos que agrega. | Preserva la propiedad exclusiva de datos de los módulos de origen y evita que la analítica introduzca escritura fuera de su contexto. |
| RI-04 | El perfil de auditor no dispone de ninguna operación de escritura en el sistema. | Un auditor que pueda modificar aquello que audita invalida la auditoría. Sustenta RF-21 y RNF-09. |

Restricciones de diseño adoptadas por el equipo.

### 7.3 Restricciones normativas

**Cuadro 17:** Marco normativo aplicable y restricción que impone.

| Norma | Restricción que impone |
|---|---|
| Ley 1581 de 2012 y Decreto 1377 de 2013 | Los datos de salud son datos sensibles. Su tratamiento está prohibido salvo autorización explícita, previa e informada del titular, quien puede revocarla. Su divulgación está restringida. Sustenta RNF-01 y condiciona el registro del donante en RF-01. |
| Decreto 1571 de 1993 | La donación de sangre es un deber de solidaridad social y no puede ser remunerada bajo ninguna modalidad. Restringe RF-11 a reconocimiento sin contraprestación económica, directa ni indirecta, y excluye del sistema toda integración con pasarelas de pago o programas de puntos canjeables. |
| Resolución 901 de 1996, modificada por la Resolución 1676 de 2023 | Define los procedimientos de captación, tamizaje, almacenamiento y disposición final que el modelo de trazabilidad debe reflejar sin pérdida de información. Los criterios de selección y diferimiento de donantes se aplican conforme al Manual vigente y a los lineamientos técnicos del Instituto Nacional de Salud. |
| Circular Externa 026 de 2017 del Instituto Nacional de Salud | El reporte a SIHEVI-INS es obligatorio para los integrantes de la Red Nacional de Bancos de Sangre y Servicios de Transfusión. Sustenta RNF-07 y determina el contenido mínimo que el sistema debe poder entregar. |

Marco normativo aplicable y restricción que impone.

### 7.4 Restricciones de proyecto

- Horizonte de cinco sprints de dos semanas, con cierre del proyecto en la semana 16 del curso.

- Equipo de siete integrantes de perfil junior, con una dedicación estimada de nueve horas semanales por persona, equivalente a 126 horas de capacidad por sprint.

- El sistema opera exclusivamente sobre datos sintéticos. No se tratan datos reales de salud de personas, y el origen sintético de la información es evidente en la propia interfaz.

- La interlocución con el cliente se canaliza únicamente a través del Product Owner.

- El alcance del sistema se circunscribe al territorio colombiano y a su división político-administrativa.

- El presupuesto de desembolso es cero: toda herramienta empleada opera en nivel gratuito, licencia de código abierto o licencia educativa.

## 8. Verificación

Todo requerimiento de este documento declara su método de verificación. Ningún requerimiento se considera satisfecho sin evidencia producida por el método que le corresponde.

**Cuadro 18:** Métodos de verificación y requerimientos a los que se aplican.

| Método | En qué consiste | Se aplica a |
|---|---|---|
| Prueba funcional | Ejecución del sistema contra los criterios de aceptación de las historias que implementan el requerimiento, sobre datos sintéticos. | RF-01 a RF-24. |
| Prueba de seguridad | Ejecución de escenarios de acceso denegado y de exposición de datos, con verificación de la bitácora resultante. | RNF-01, RNF-02, RNF-09, RF-23, RF-24. |
| Medición | Instrumentación del sistema y recolección de métricas bajo la carga descrita en el escenario. | RNF-04, RNF-06. |
| Inspección | Revisión del modelo de datos, del código y de los artefactos de despliegue frente a lo especificado. | RNF-01, RNF-05, RNF-11, RI-01 a RI-04. |
| Auditoría de conformidad | Verificación con herramienta automática y revisión manual contra el criterio de accesibilidad declarado. | RNF-10. |
| Demostración | Ejecución guiada ante el cliente del escenario completo, de extremo a extremo. | RNF-03, RNF-07, RNF-08. |

Métodos de verificación y requerimientos a los que se aplican.

## 9. Matriz de trazabilidad

La trazabilidad es bidireccional. Hacia atrás, toda historia del backlog se rastrea hasta un requerimiento de este documento o hasta una restricción de la Sección 7. Hacia adelante, todo requerimiento cuenta con al menos una historia que lo implementa y con un método de verificación asignado.

**Cuadro 19:** Matriz de trazabilidad entre requerimientos, historias, módulos y preocupaciones.

| ID | Requerimiento | Historias | Mód. | Preocupación |
|---|---|---|---|---|
| RF-01 | Registro voluntario de donante | HU-01 | M1 | P1, P18 |
| RF-02 | Cálculo de elegibilidad | HU-02, HU-03 | M1 | P2, P3 |
| RF-03 | Registro de donación | HU-05 | M3 | P7 |
| RF-04 | Trazabilidad de origen | HU-06 | M3 | P15 |
| RF-05 | Marcado de unidad no apta | HU-07 | M3 | P5 |
| RF-06 | Protocolo de disposición final | HU-08 | M3 | P15 |
| RF-07 | Consulta de existencias | HU-09 | M4 | P10 |
| RF-08 | Publicación de campañas | HU-15, HU-16 | M2 | P9 |
| RF-09 | Administración de la jerarquía territorial | HU-13, HU-14 | M6 | P11, P13 |
| RF-10 | Transferencia entre bancos | HU-17, HU-18 | M5 | P9 |
| RF-11 | Reconocimiento no monetario | HU-19, HU-20 | M1 | P4 |
| RF-12 | Notificación al donante | HU-21, HU-22 | ST1 | P3, P8 |
| RF-13 | Tablero de indicadores | HU-23 | M7 | P12, P13 |
| RF-14 | Movilización de donantes | HU-24 | M5 | P9 |
| RF-15 | Reserva de cupo con expiración | HU-25 | M2 | P1 |
| RF-17 | Consulta de historial propio | HU-04 | M1 | P3 |
| RF-18 | Exclusión de unidades vencidas | HU-12 | M4 | P6 |
| RF-19 | Alerta de escasez | HU-10 | M4 | P8 |
| RF-20 | Alerta de vencimiento próximo | HU-11 | M4 | P6 |
| RF-21 | Consulta de bitácora | HU-27 | ST2 | P17 |
| RNF-05 | Adaptabilidad del modelo de dominio | HU-26 | Transversal | P14 |
| RF-22 | Asignación de jurisdicción de usuario | HU-28 | M6 | P11, P16 |
| RF-23 | Inicio de sesión | HU-29 | ST3 | P2, P11 |
| RF-24 | Término de sesión | HU-30 | ST3 | P2 |

Matriz de trazabilidad entre requerimientos, historias, módulos y preocupaciones.

**Estado de la trazabilidad.** Los veintitrés requerimientos funcionales y el requerimiento no funcional que origina trabajo de modelado quedan cubiertos por al menos una historia, y toda historia del backlog queda respaldada por un requerimiento o por una restricción. HU-26 no deriva de un requerimiento funcional sino de RNF-05 y de RI-01, y se clasifica en el backlog como historia técnica, conforme a RD-07. No existen elementos huérfanos en ninguno de los dos sentidos.

## 10. Requerimientos fuera de la línea base

Los siguientes requerimientos están especificados pero no comprometidos para la primera versión del producto. Se documentan para dejar constancia de que fueron considerados y priorizados de forma deliberada, no omitidos.

**Cuadro 20:** Requerimientos especificados y no comprometidos para la versión 1 del producto.

| ID | Requerimiento | Razón de la exclusión |
|---|---|---|
| RF-14 | Movilización de donantes | Clasificado Could. Depende de que el escalamiento de dos niveles esté operativo, lo que a su vez requiere RF-10 completo. |
| RF-15 | Reserva de cupo con expiración | Clasificado Could. Introduce manejo de concurrencia, sin experiencia previa del equipo en la materia. El esquema `reserva_cupo` existe en `db_campana`; el incremento del Sprint 3 no expone operaciones de reserva. |
| RNF-07 | Interoperabilidad con SIHEVI-INS | El sistema construye y documenta el punto de integración, pero no ejecuta el reporte efectivo, que exige credenciales institucionales y especificación técnica del Instituto Nacional de Salud. El servicio o componente propietario del punto de integración está pendiente de designar (Sección 11). |
| RNF-05 | Administración de tipos de donación distintos de la sangre | Clasificado Won’t para la versión 1. El modelo de dominio se construye de forma que la incorporación futura no exija rehacer la trazabilidad ni el inventario, conforme a RI-01, y esa propiedad sí se verifica en esta versión; la funcionalidad de administrar un tipo nuevo no se construye. |

Requerimientos especificados y no comprometidos para la versión 1 del producto.

## 11. Decisiones pendientes

Esta versión concilia la redacción del SRS con las decisiones de arquitectura ya tomadas. Los puntos siguientes admiten más de una lectura válida y su elección corresponde al Product Owner y a la Arquitecta de Software; hasta que se decidan, el enunciado vigente de este documento se mantiene y no se ha elegido ninguna opción en silencio.

**Cuadro 21:** Decisiones pendientes y opciones registradas.

| ID | Tema | Situación | Opciones |
|---|---|---|---|
| DP-01 | RNF-08, vencimiento | RNF-08 exige que ninguna unidad vencida figure como disponible en una consulta posterior a su fecha de vencimiento. El diseño vigente ejecuta el proceso de vencimiento cada 5 minutos (UTC) y admite hasta 15 minutos. | A: mantener la lectura inmediata y exigir que la consulta de inventario filtre por fecha de vencimiento al consultar. B: alinear RNF-08 con una permanencia máxima de 15 minutos como disponible. |
| DP-02 | RNF-11, imágenes publicadas | RNF-11 exige desplegar a partir de las imágenes publicadas; el entorno vigente aún no cuenta con un registro de imágenes y construye localmente. | A: mantener RNF-11 e incorporar el registro de imágenes como entregable. B: reformular a «a partir de las imágenes construidas por el pipeline» (registro o archivo de imagen exportado). |
| DP-03 | RNF-07, SIHEVI-INS | Ningún servicio tiene asignado el punto de integración documentado. | Designar el servicio o componente propietario. |
| DP-04 | Institucional: M7 y ST2 | M7 y la consulta compuesta de auditoría (ST2) están asignadas al Servicio Institucional, sin mecanismo definido para obtener los datos de otros contextos. | Si se mantienen en Institucional, abrir un ADR del mecanismo (proyecciones por eventos o contratos de lectura) que respete «sin HTTP directo» y «sin acceso a bases ajenas». |
| DP-05 | Línea base de requerimientos funcionales | Este documento conserva 23 RF (RF-01 a RF-15 y RF-17 a RF-24). Los demás documentos de arquitectura y de pruebas cuentan 22 RF, incluyen RF-25 (seguimiento de donaciones por campaña) y no listan RF-14 ni RF-15. | Definir la línea base: incorporar o no RF-25 y confirmar si RF-14 y RF-15 forman parte de ella. |
| DP-06 | Numeración del ADR de descomposición | Este documento cita ADR-014 para la descomposición en cinco servicios; el SAD la registra como ADR-017. | Verificar el registro de ADR y actualizar la referencia \[4\] y sus menciones, o corregir el SAD. |

Decisiones pendientes y opciones registradas.

