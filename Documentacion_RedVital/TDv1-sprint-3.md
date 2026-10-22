# Documento de Pruebas TD V1 - Sprint 3

## Control del documento

| Campo | Información |
|---|---|
| Código del documento | `TST-PLAN-03` (propuesto) |
| Versión | `0.2` |
| Estado | `Borrador` |
| Sprint o entrega | `Sprint 3` (Review y Planning del Sprint 4, Semana 10, alrededor del 13-14 de octubre de 2026) |
| Responsable de pruebas | `Tomás (QA / Tester)` |
| Revisado por | `[Arquitecto / Equipo de desarrollo]` |
| Aprobado por | `[Product Owner]` |
| Fecha de creación | `2026-10-03` |
| Última actualización | `2026-10-03` |
| Ítems relacionados de GitHub | `HU-325 (T-325.1 a T-325.6)`, `HU-315`, `HU-316`, `HU-302` |
| Informe de pruebas asociado | `testing/test-reports/test-report-sprint-3.md` |

## Historial de cambios

| Versión | Fecha | Descripción del cambio | Autor |
|---|---|---|---|
| 0.1 | 2026-10-03 | Creación inicial del documento | Tomás |
| 0.2 | 2026-10-03 | Se incorporó la lista completa de tareas del Sprint 3 (Backlog v1.2): contenido de T-303, T-327 y T-330, alcance real de cada caso y escenarios fuera de lo comprometido | Tomás |

## Leyenda de marcadores

Este borrador se escribió sin algunos insumos. Lo que depende de ellos está marcado así para que nadie lo tome por definitivo:

- **FALTANTE T-xxx:** la parte depende de una tarea que todavía no se ha realizado. Se conoce su definición en el backlog, pero no hay un resultado que probar.
- **PENDIENTE DOC (nombre):** la parte espera un documento que aún no se ha entregado a QA (SRS, DD, Documento de Herramientas o la sección 7 del backlog).
- **FUERA DE LO COMPROMETIDO (COULD C-xx):** el escenario necesita una historia opcional («Could») que no está comprometida en el Sprint 3.
- **SIN TAREA NI HISTORIA:** el escenario está en el catálogo para el Sprint 3, pero ninguna tarea ni historia (comprometida u opcional) lo implementa o lo prueba.

---

## 1. Propósito, alcance y referencias

### 1.1 Propósito

Definir cómo se verifica que el Sprint 3 de RedVital cumple los escenarios de calidad (EC) que el SAD le asigna, qué pruebas se hacen, con qué herramientas y bajo qué protocolo, y dejar establecido cómo se reportan los resultados y por qué una prueba pasa o no pasa. Este documento es el TD V1 (HU-325).

### 1.2 Alcance incluido

El alcance se define por la historia HU-315 del backlog, que lista 13 escenarios como comprometidos para QA, y por las tareas de HU-302 y HU-316.

| Grupo | Escenarios |
|---|---|
| Comprometidos (HU-315) | EC-01, EC-02, EC-03, EC-04, EC-05, EC-08, EC-10, EC-12, EC-13, EC-33, EC-36, EC-39, y EC-19 en su parte de API |
| Matriz de cobertura (T-325.5) | Los 17 escenarios del Sprint 3 del catálogo más EC-08, EC-22, EC-23 y EC-36 |
| Datos y flujo | HU-302 (datos sintéticos) y flujo punta a punta por el gateway (T-315.4) |

### 1.3 Alcance excluido o no comprometido

- **Escenarios del catálogo para el Sprint 3 sin implementación comprometida:**
  - **EC-17:** FUERA DE LO COMPROMETIDO (COULD C-08).
  - **EC-28:** FUERA DE LO COMPROMETIDO (COULD C-01).
  - **EC-41 y EC-19 en pantalla:** FUERA DE LO COMPROMETIDO (COULD C-01).
  - **EC-21, EC-31 y EC-32:** SIN TAREA NI HISTORIA.
  Sus casos están diseñados (3.3) para que no queden sin plan, pero no se ejecutan mientras su implementación no exista.
- **Escenarios de los Sprints 4 y 5**, entre ellos los de carga y rendimiento (EC-15, EC-16, EC-26, EC-37, EC-07, EC-06). Su ejecución queda para el Sprint 4; su diseño sí está en 3.5.
- **Perfiles de usuario distintos de U3, U4 y el token de servicio** en las pruebas de seguridad. El Servicio Institucional (jerarquía y vista territorial del coordinador U5) es FUERA DE LO COMPROMETIDO (COULD C-02).
- **Transferencias y reservas de unidades:** el contrato del incremento (T-301.3) no las lista (búsqueda de donante, donación, tamizaje, existencias, despacho, disposición y eventos). Los pasos de EC-12, EC-39 y EC-41 que dependen de ellas quedan «No aplicables en el Sprint 3» hasta que existan. A confirmar con el desarrollador de Donación.

### 1.4 Referencias

| Documento | Estado |
|---|---|
| Catálogo de escenarios de calidad RedVital (42 EC, 18-sep-2026) | Disponible |
| Plantillas de plan, caso e informe de pruebas | Disponibles |
| Tareas del Sprint 3: lista de QA y lista completa del equipo (Backlog v1.2) | Disponibles |
| SAD V1.0 (ISO/IEC 25010:2023) | Referenciado desde el catálogo |
| Sección 7 del backlog (base de la matriz T-325.5) | **PENDIENTE DOC (backlog, sección 7)** |
| SRS (RF y RNF) | **PENDIENTE DOC (SRS)** |
| DD (§11.3, catálogo de transiciones, matriz de autorización) | **PENDIENTE DOC (DD)** |
| Documento de Herramientas V3.0 | **PENDIENTE DOC (Herramientas)** |

### 1.5 Nomenclatura

El catálogo habla de «Servicio Institucional». El backlog v1.2 organiza el incremento en un **Servicio de Identidad** (`db_identidad`), un **Servicio de Donación** (`db_donacion`), un **Servicio de Campañas** (`db_campana`), un API Gateway (YARP) y la aplicación web. Este documento usa los nombres del backlog. Donde el catálogo dice «servicio par», el par real del Sprint 3 es Campañas (T-306.4).

---

## 2. Metodología de pruebas

### 2.1 Qué pruebas se van a hacer

| Tipo de prueba | Qué verifica | Escenarios | Casos |
|---|---|---|---|
| Funcional | Que la funcionalidad cumple el comportamiento y la métrica del escenario | EC-13, EC-36 | TC-004, TC-007 |
| De contrato (API) | Que las respuestas cumplen los contratos OpenAPI y que no hay llamadas fuera del contrato | EC-22 | TC-012 |
| Integración y punta a punta | Que el flujo completo funciona por el gateway | Flujo del Sprint 3 | TC-020 |
| De seguridad | Control de acceso, autenticidad de la sesión y confidencialidad | EC-01, EC-02, EC-03 | TC-001, TC-002, TC-003 |
| De seguridad física (fail-safe) | Que el sistema bloquea operaciones peligrosas y se inclina por lo restrictivo | EC-12, EC-39, EC-41 | TC-005, TC-006, TC-014 |
| De integridad e idempotencia | Máquina de estados, historial de solo anexado y ausencia de duplicados | EC-04, EC-10 | TC-004, TC-010 |
| De auditoría | Registro de acciones sensibles y atribución al sistema | EC-05, EC-33 | TC-008, TC-009 |
| De resiliencia | Aislamiento cuando el servicio de Campañas cae | EC-08 | TC-011 |
| De interfaz y usabilidad | Confirmación de acciones irreversibles, registro en tres pasos, legibilidad | EC-17, EC-19, EC-28, EC-31, EC-32, EC-41 | TC-014 a TC-018 |
| De mantenibilidad | Que un cambio de regla se aplica en un solo punto | EC-21 | TC-019 |
| De instalabilidad | Que un comando levanta el sistema completo | EC-23 | TC-013 |
| De datos | Coherencia de los datos sintéticos entre las tres bases | HU-302 | TC-021 |
| De rendimiento y volumen (parcial en el Sprint 3) | Tiempos y repeticiones declarados en los EC del Sprint 3 | EC-36, EC-13, EC-10, EC-08, EC-05 | Ver 3.4 |
| De carga (diseño ahora, ejecución en el Sprint 4) | Comportamiento bajo carga nominal, de pico y sobrecarga | EC-15, EC-16, EC-26, EC-37, EC-07, EC-06 | Ver 3.5 |

### 2.2 Niveles de prueba

1. **Unitario / dominio:** la matriz de estados de la unidad se recorre sin interfaz ni base de datos (EC-36, T-307.3).
2. **De servicio:** cada servicio (Identidad, Donación y Campañas) se prueba con su API y con tokens de la llave de prueba.
3. **De contrato:** las respuestas se validan contra los contratos OpenAPI publicados en `redvital-docs` (T-301.5).
4. **Punta a punta:** por el API Gateway, con el incremento desplegado en QA (T-314.6).
5. **De interfaz:** sobre la aplicación web. En el Sprint 3 solo están comprometidas las pantallas de sesión e inventario (HU-317, prioridad Should).

### 2.3 Herramientas

| Categoría | Herramienta | Fuente |
|---|---|---|
| Integración continua | GitHub Actions, un flujo por repositorio (construcción y pruebas) | T-313.1 |
| Verificación de contratos | Verificación del contrato OpenAPI en cada Pull Request | T-313.3 (Veli) |
| Análisis de seguridad en la CI | Gitleaks y Grype | T-313.2 (apoyo, no son pruebas de QA) |
| Contenedores | Docker Compose de QA | T-314.2 |
| Migraciones y datos | Flyway (Donación), EF Core (Identidad y Campañas) | T-304.1, T-306.1, T-312.1 |
| Gateway | YARP | T-305.1 |
| Gestión de defectos y tareas | GitHub Projects, Issues con clase «Defecto» | T-328.5, T-316.2 |
| Métricas y tableros | Prometheus y Grafana en QA | C-05 (COULD, depende de T-314.2) |
| Generación de carga | Gatling, primera campaña sobre el inventario | C-07 (COULD, depende de C-05 y T-314.6) |
| Ejecutor de pruebas por servicio (Java y .NET), cliente de API y validador OpenAPI | **PENDIENTE DOC (Herramientas)** | |

Las herramientas de métricas y de carga son opcionales en el Sprint 3. Si C-05 y C-07 no se hacen, las pruebas de carga se ejecutan en el Sprint 4 con el mismo diseño.

### 2.4 Ambientes y datos de prueba

- **Ambiente de pruebas:** QA, desplegado con un solo comando (T-314.2). El compose incluye borde, web, gateway, tres servicios, tres bases y tres trabajos de migración. Cada ejecución registra el commit probado.
- **Datos:** sintéticos, con un generador versionado de una sola semilla para `db_identidad`, `db_donacion` y `db_campana` (T-302.2), cargados en los trabajos de migración (T-302.3). Incluyen bancos, usuarios U3 y U4, donantes, campañas por estado y unidades por estado, con vencidas y próximas a vencer.
- **Reglas de los datos:** identificadores coherentes entre bases y ninguna causa clínica (T-302.4, TC-021).
- **Llave de prueba:** T-303.1 genera el par de llaves y una utilidad que emite tokens U3, U4 y de servicio con las reivindicaciones de ADR-008. T-303.2 la carga solo en el perfil de desarrollo y en la suite y documenta su uso. T-303.3 confirma que la configuración de QA rechaza tokens firmados con ella. **FALTANTE T-303.1, T-303.2 y T-303.3:** ninguna está hecha.
- **Reloj:** para EC-13 se adelanta el reloj sobre los datos sintéticos. El proceso de vencimiento corre en un contenedor en UTC (T-311.1).

### 2.5 Protocolo de pruebas

1. **Verificar criterios de entrada** (2.6). Si falta alguno, se registra como bloqueo.
2. **Preparar el ambiente:** desplegar el incremento en QA, cargar los datos sintéticos con la semilla versionada y anotar el commit.
3. **Ejecutar la suite** en la CI sobre QA (T-316.1). Los casos manuales los ejecuta QA siguiendo los pasos de cada ficha.
4. **Registrar cada resultado** en el informe de pruebas, con estado, valor observado frente al esperado, evidencia y commit.
5. **Decidir si pasa o no pasa** con la regla de la sección 4.1. Un resultado parcial es «Fallido».
6. **Registrar los defectos** como Issues con clase «Defecto» (T-316.2) y enlazarlos al caso y al EC.
7. **Reejecutar** los casos corregidos y actualizar el informe.
8. **Redactar el informe** (T-316.3) y la sección de resultados de este documento (T-325.6).

### 2.6 Criterios de entrada y salida

**Entrada.** Las pruebas pueden iniciar cuando:

- [ ] Los contratos OpenAPI están publicados (T-301.5).
- [ ] El incremento está desplegado en QA (T-314.6, hito del que depende el informe).
- [ ] Los datos sintéticos están cargados (T-302.3).
- [ ] La llave de prueba está disponible (T-303.1 a T-303.3). **FALTANTE T-303.**
- [ ] Identidad terminó la renovación, el término de sesión, el token de servicio y la auditoría, con sus pruebas (T-330.5). **FALTANTE T-330.**
- [ ] El ciclo de vencimiento está definido entre DD e Infraestructura (T-322.3, contradicción RDS-13). **FALTANTE T-322.3.**
- [ ] El Documento de Herramientas está entregado. **PENDIENTE DOC (Herramientas).**

**Salida.** Las pruebas se consideran finalizadas cuando:

- [ ] Se ejecutaron todos los casos de prioridad Crítica y Alta que están dentro de lo comprometido.
- [ ] Los defectos críticos están resueltos o aceptados formalmente.
- [ ] Las evidencias están enlazadas en el informe.
- [ ] Se emitió el informe de pruebas.

### 2.7 Gestión de defectos

| Severidad | Criterio |
|---|---|
| Crítica | Incumple un escenario de banda Crítica (EC-02, EC-12), expone causa clínica o permite despachar una unidad no apta o vencida |
| Alta | Incumple una métrica de un escenario de banda Alta (por ejemplo, un acceso fuera de jurisdicción aceptado) |
| Media | Incumple una métrica de un escenario de banda Media o Baja, con alternativa |
| Baja | Defecto cosmético o de texto que no cambia el cumplimiento de la métrica |

Cada defecto es un Issue con clase «Defecto» que enlaza el caso, el EC y la evidencia. Estados: Abierto, En proceso, Cerrado.

### 2.8 Convenciones

- **Prioridad del caso:** la banda del escenario (Crítica, Alta, Media, Baja).
- **Estado del caso:** `No ejecutado`, `Aprobado`, `Fallido`, `Bloqueado`, `No evaluable`, `No aplicable en el Sprint 3`.
- **Tipo de ficha:** los casos simples tienen su ficha en la sección 3.3. Los casos grandes o específicos tienen un archivo propio en `testing/test-cases/` con el formato de la plantilla de caso.

---

## 3. Diseño de pruebas

### 3.1 Criterio de diseño

Cada caso se traza a un escenario de calidad y toma su criterio de aprobación de la **medida de respuesta del catálogo, sin reinterpretarla**. Si una medida contiene varias condiciones, el caso solo aprueba si se cumplen todas. Los orígenes (RF, RNF) se toman del catálogo; su verificación contra el SRS es **PENDIENTE DOC (SRS)**.

### 3.2 Índice de casos

| Caso | EC | Prioridad | Tipo | Tarea de ejecución | Ubicación | Dependencias abiertas |
|---|---|---|---|---|---|---|
| TC-001 | EC-01 | Alta | Seguridad | T-315.5 | Archivo propio | FALTANTE T-330.4 (registro de denegaciones), matriz normativa del DD |
| TC-002 | EC-03 | Alta | Seguridad | T-315.5 | Archivo propio | FALTANTE T-303.1 a T-303.3, FALTANTE T-330.5 |
| TC-003 | EC-02 | Crítica | Seguridad | T-315.5 | Ficha 3.3.1 | PENDIENTE DOC (DD, anexo de campos prohibidos) |
| TC-004 | EC-04, EC-36 | Alta | Integridad / funcional | T-315.2 | Archivo propio | Depende de T-307.3 (invocación aislada del motor) |
| TC-005 | EC-12 | Crítica | Seguridad física | T-315.7 | Archivo propio | Transferencia y reserva no aplicables en el Sprint 3 |
| TC-006 | EC-39 | Alta | Seguridad física | T-315.7 | Ficha 3.3.2 | Transferencia a institución no habilitada no aplicable |
| TC-007 | EC-13 | Alta | Funcional | T-315.8 | Ficha 3.3.3 | FALTANTE T-322.3 (ciclo de vencimiento, RDS-13), T-311.1 |
| TC-008 | EC-33 | Alta | Auditoría | T-315.8 | Ficha 3.3.3 | T-311.2 |
| TC-009 | EC-05 | Alta | Auditoría | T-315.8 | Archivo propio | FALTANTE T-330.4, T-310.3, alcance de las bitácoras |
| TC-010 | EC-10 | Alta | Integridad / idempotencia | T-315.6 | Ficha 3.3.4 | T-306.5 |
| TC-011 | EC-08 | Alta | Resiliencia | T-315.6 | Ficha 3.3.5 | T-314.4 (detener y levantar un contenedor) |
| TC-012 | EC-22 | Media | Contrato | T-315.3 | Ficha 3.3.6 | T-313.3 (verificación en cada PR, Veli) |
| TC-013 | EC-23 | Media | Instalabilidad | T-314.3 (Veli mide el arranque). Verificación independiente de QA: SIN TAREA NI HISTORIA | Ficha 3.3.7 | |
| TC-014 | EC-19, EC-41 | Alta | Interfaz / seguridad física | T-315.7 (EC-19 por API). Pantalla y EC-41: FUERA DE LO COMPROMETIDO (COULD C-01) | Ficha 3.3.8 | |
| TC-015 | EC-17 | Media | Interfaz | FUERA DE LO COMPROMETIDO (COULD C-08) | Ficha 3.3.9 | |
| TC-016 | EC-28 | Media | Interfaz | FUERA DE LO COMPROMETIDO (COULD C-01) | Ficha 3.3.9 | |
| TC-017 | EC-32 | Baja | Interfaz | SIN TAREA NI HISTORIA | Ficha 3.3.9 | Vista de trazabilidad del auditor (P-08 del SAD) |
| TC-018 | EC-31 | Baja | Interfaz | SIN TAREA NI HISTORIA | Ficha 3.3.9 | |
| TC-019 | EC-21 | Baja | Mantenibilidad | SIN TAREA NI HISTORIA | Ficha 3.3.10 | |
| TC-020 | Flujo | Alta | Integración / punta a punta | T-315.4 | Ficha 3.3.11 | T-305.6, T-306.7, T-308.3, T-309.4, T-310.4, T-312.6 |
| TC-021 | HU-302 | Alta | Datos | T-302.4 | Ficha 3.3.12 | |

### 3.3 Fichas de casos por tipo

Los resultados consolidados no se escriben en las fichas de este documento: van en el informe de pruebas (sección 4). Los casos con archivo propio (TC-001, TC-002, TC-004, TC-005 y TC-009) conservan además la sección de resultado de la plantilla de caso; lo que se anote ahí se copia al informe.

#### Pruebas de seguridad

##### 3.3.1 TC-003 · EC-02 · Confidencialidad de la causa clínica

- **Prioridad:** Crítica. **Tarea:** T-315.5. **Historia que lo implementa:** HU-308. **Origen en el catálogo:** RNF-01, RI-02, Ley 1581/2012.
- **Objetivo:** comprobar que no existe ningún dato de causa clínica en el modelo, el contrato, las respuestas, los mensajes de error ni los registros.
- **Precondiciones:** datos sintéticos con unidades no aptas, contratos OpenAPI publicados y tokens U3 y U4 de la llave de prueba (**FALTANTE T-303.1**).
- **Pasos:**
  1. Revisar el esquema de `db_donacion` y buscar columnas de causa clínica, diagnóstico o resultado de tamizaje. *Esperado: ninguna.*
  2. Revisar el contrato OpenAPI y buscar esos campos en el 100 % de los endpoints de los módulos M3 y M4. *Esperado: ninguno.*
  3. Registrar un veredicto «no apto» (T-308.2) y consultar la unidad y su historial por API. *Esperado: aparecen el estado de aptitud y la trazabilidad, sin causa.*
  4. Provocar errores (por ejemplo, un despacho rechazado) y revisar el mensaje. *Esperado: sin motivo clínico.*
  5. Revisar registros, trazas y las series de auditoría de las operaciones anteriores. *Esperado: sin información diagnóstica.*
  6. Intentar enviar texto libre de aspecto clínico en el campo de observación del veredicto. *Esperado: solo se admiten los valores del catálogo `observacion_operativa`.*
- **Aprueba si:** cero campos de causa clínica, diagnóstico o resultado de tamizaje en esquema, contrato y respuestas, el 100 % de los endpoints de M3 y M4 revisado, y ningún registro, mensaje de error o traza con información diagnóstica.
- **Nota:** el catálogo advertía que `observacion` de `evento_unidad` era texto libre (D-02). El backlog usa un catálogo `observacion_operativa` en el veredicto (T-308.2), lo que mitiga el riesgo si el campo libre ya no existe. El paso 6 lo comprueba.

##### 3.3.2 TC-006 · EC-39 · Límite operativo del despacho por jurisdicción

- **Prioridad:** Alta. **Tarea:** T-315.7. **Historia:** HU-310 (T-310.1, regla IN-21). **Origen:** RF-10, RF-14, Resolución 901/1996.
- **Objetivo:** comprobar que el sistema rechaza el despacho de una unidad custodiada por otra institución, aunque el usuario tenga derecho a ver el recurso.
- **Precondiciones:** dos instituciones con unidades en custodia y tokens U3 o U4 con institución y ruta territorial.
- **Pasos:**
  1. Intentar despachar una unidad custodiada por otra institución. *Esperado: rechazo que nombra la condición operativa incumplida.*
  2. Revisar que el mensaje no revela datos de la institución ajena. *Esperado: sin datos ajenos.*
  3. Revisar que el intento quedó registrado. *Esperado: registro presente.*
  4. Intentar una transferencia hacia una institución no habilitada. *Esperado: NO APLICABLE EN EL SPRINT 3; el contrato no incluye transferencias.*
- **Aprueba si:** cero despachos ejecutados por una institución distinta de la custodia y el 100 % de los rechazos identifica la condición incumplida sin revelar datos ajenos. La condición sobre transferencias no se evalúa en este sprint.
- **Nota:** el catálogo de tipos de institución que pueden custodiar unidades solo hace falta para la parte de transferencias. **PENDIENTE DOC (DD).**

#### Pruebas funcionales y de auditoría

##### 3.3.3 TC-007 y TC-008 · EC-13 y EC-33 · Acciones automáticas y su atribución

- **Prioridad:** Alta. **Tarea:** T-315.8. **Historia:** HU-311 (T-311.1 y T-311.2). **Origen:** RNF-08, RNF-09, RF-18.
- **Dependencia abierta:** el proceso de vencimiento está bloqueado por la contradicción del ciclo de vencimiento entre DD e Infraestructura (RDS-13, T-322.3). **FALTANTE T-322.3.** Mientras no se resuelva, no se sabe con qué frecuencia corre el proceso.
- **Objetivo:** comprobar que una unidad vencida sale sola del inventario disponible (TC-007) y que esa acción queda atribuida al sistema, no a una persona (TC-008).
- **Precondiciones:** unidades sintéticas próximas a vencer y vencidas, reloj adelantable y pruebas con y sin sesiones activas.
- **Pasos:**
  1. Anotar las unidades disponibles que vencen pronto. *Esperado: figuran como disponibles.*
  2. Adelantar el reloj hasta pasar la fecha de vencimiento, sin ningún usuario ejecutando acciones. *Esperado: ninguna acción manual.*
  3. Consultar las existencias y los listados dentro de los 15 minutos siguientes. *Esperado: las unidades vencidas no figuran como disponibles en ninguno.*
  4. Repetir con un vencimiento cercano al cambio de día, porque el contenedor corre en UTC y el equipo está en UTC-5. *Esperado: el vencimiento se aplica según la fecha prevista, sin desfase.*
  5. Revisar que la unidad entró al flujo de disposición final. *Esperado: sí.*
  6. Revisar la serie de auditoría de Donación con el sistema como actor y el nombre del proceso. *Esperado: actor tipo sistema.*
  7. Repetir con un usuario conectado y revisar que la acción no se atribuye al último usuario de la sesión. *Esperado: sigue siendo «sistema».*
- **Aprueba si:**
  - **TC-007:** el 100 % de las unidades deja de figurar como disponibles dentro de los 15 minutos siguientes al vencimiento y no hay ninguna unidad vencida visible como disponible en consulta o listado.
  - **TC-008:** el 100 % de las acciones automáticas queda con actor «sistema» y cero se atribuyen a un usuario.
- **Nota:** el «15 minutos» fija implícitamente la frecuencia del proceso en 15 minutos o menos, y ningún documento lo declara. Depende de la resolución de RDS-13.

#### Pruebas de integridad e idempotencia

##### 3.3.4 TC-010 · EC-10 · Registro de donación idempotente

- **Prioridad:** Alta. **Tarea:** T-315.6. **Historia:** HU-306 (T-306.5, regla DS-10). **Origen:** RF-03 a RF-06.
- **Objetivo:** comprobar que enviar varias veces el mismo registro de donación crea una sola unidad.
- **Precondiciones:** token U3, donante sintético y un identificador de operación generado por el cliente.
- **Pasos:**
  1. Anotar el conteo del inventario. *Esperado: valor inicial N.*
  2. Enviar el registro de donación con el identificador de operación. *Esperado: se crea una unidad.*
  3. Reenviar el mismo registro 100 veces con el mismo identificador. *Esperado: ninguna crea otra unidad.*
  4. Comparar la segunda respuesta con la primera. *Esperado: idénticas.*
  5. Volver a contar el inventario. *Esperado: N + 1, sin variación por el reintento.*
  6. Simular un corte de red con el reenvío del cliente. *Esperado: mismo resultado.*
- **Aprueba si:** cero unidades duplicadas ante 100 reenvíos del mismo identificador de operación, el conteo del inventario no varía por el reintento y la segunda respuesta es idéntica a la primera.
- **Nota:** el DD declara seis operaciones idempotentes, aunque su texto habla de cuatro. Se prueba al menos con la creación de donación.

#### Pruebas de resiliencia

##### 3.3.5 TC-011 · EC-08 · Aislamiento del fallo del servicio par

- **Prioridad:** Alta. **Tarea:** T-315.6. **Historia:** HU-306 (T-306.4, adaptador hacia Campañas con plazo de 3 s). **Origen:** RNF-06. **Sprint del catálogo:** 4; se adelanta porque la medida se comprueba apagando un contenedor, sin Prometheus.
- **Objetivo:** comprobar que si el servicio de Campañas deja de responder, Donación no se bloquea y las funciones independientes siguen operando. La demo en vivo de la presentación incluye esta caída (T-329.1).
- **Precondiciones:** incremento desplegado en QA y la capacidad de detener y levantar un contenedor sin reiniciar el resto (T-314.4).
- **Pasos:**
  1. Detener el contenedor de Campañas. *Esperado: servicio caído.*
  2. Registrar una donación asociada a una campaña y medir el tiempo de espera. *Esperado: la llamada expira en 3 segundos o menos.*
  3. Revisar el resultado de la donación. *Esperado: se registra con `campania_id` nulo, que es la degradación declarada, sin inventar datos de campaña.*
  4. Revisar conexiones e hilos bloqueados. *Esperado: ninguno pasado ese plazo.*
  5. Ejecutar operaciones de M3 y M4 que no requieren Campañas (tamizaje, existencias, despacho). *Esperado: funcionan al 100 %.*
  6. Revisar la interfaz en las pantallas disponibles durante la caída. *Esperado: indica qué no está disponible, sin detalle técnico ni pantalla en blanco.*
  7. Levantar de nuevo el contenedor. *Esperado: el sistema se recupera sin reiniciar el resto.*
- **Aprueba si:** tiempo máximo de 3 segundos por llamada entre servicios, cero hilos o conexiones bloqueados más allá del plazo, el 100 % de las operaciones de M3 y M4 independientes sigue funcionando y cero errores no controlados en la interfaz.
- **Nota:** el desarrollador prueba el adaptador con un Campañas simulado hasta que exista T-312.3. QA lo prueba con el servicio real.

#### Pruebas de contrato

##### 3.3.6 TC-012 · EC-22 · Evolución del contrato entre servicios

- **Prioridad:** Media. **Tarea:** T-315.3. Veli verifica el contrato en cada Pull Request (T-313.3). **Origen en el catálogo:** RD-01 (la Tabla 31 lo cuelga de RNF-07, que el propio catálogo señala como errónea).
- **Objetivo:** comprobar que las respuestas reales cumplen los contratos OpenAPI y que un cambio compatible no rompe al consumidor.
- **Precondiciones:** contratos publicados en `redvital-docs` (T-301.5) y servicios desplegados.
- **Pasos:**
  1. Validar las respuestas de los endpoints contra su contrato OpenAPI. *Esperado: todas válidas.*
  2. Publicar una versión que añade un campo a una respuesta existente. *Esperado: el consumidor sigue operando sin cambios.*
  3. Simular un cambio incompatible. *Esperado: exige incremento de versión mayor, con las dos versiones conviviendo.*
  4. Revisar que no hay llamadas entre servicios fuera del contrato. *Esperado: ninguna.*
  5. Confirmar que la verificación de la CI comprueba el contrato en cada Pull Request. *Esperado: sí.*
- **Aprueba si:** cero fallos del consumidor ante un cambio compatible, el 100 % de los cambios incompatibles se publica con versión mayor y cero llamadas fuera del contrato.

#### Pruebas de instalabilidad

##### 3.3.7 TC-013 · EC-23 · Puesta en marcha del sistema completo

- **Prioridad:** Media. **Tarea:** Veli mide el arranque en 10 minutos o menos (T-314.3). La verificación independiente de QA con una persona ajena a la configuración: SIN TAREA NI HISTORIA. **Origen:** RNF-11.
- **Objetivo:** comprobar que una persona ajena a la configuración levanta el sistema siguiendo solo el README.
- **Precondiciones:** máquina limpia con solo Docker, sin Java, .NET, Node ni PostgreSQL.
- **Pasos:**
  1. Clonar los repositorios. *Esperado: sin dependencias adicionales.*
  2. Ejecutar un único comando de arranque. *Esperado: se levanta el compose completo.*
  3. Medir el tiempo hasta que todos los sondeos de salud responden. *Esperado: 10 minutos o menos.*
  4. Verificar el esquema migrado y los datos sintéticos cargados. *Esperado: sin pasos manuales.*
  5. Repetir en Windows, macOS y Linux. *Esperado: mismo resultado.*
- **Aprueba si:** un comando, 10 minutos o menos hasta que los sondeos de salud responden, cero pasos manuales fuera de los documentados y comportamiento igual en las tres plataformas.
- **Nota:** el catálogo habla de ocho contenedores. El compose de QA (T-314.2) lista borde, web, gateway, tres servicios, tres bases y tres trabajos de migración: 12 elementos, 9 de ellos permanentes. El número de sondeos que debe responder hay que tomarlo del compose real y corregir el catálogo.

#### Pruebas de interfaz y usabilidad

##### 3.3.8 TC-014 · EC-19 y EC-41 · Protección y advertencia ante acciones irreversibles

- **Prioridad:** Alta. **Origen:** RNF-08, Resolución 901/1996.
- **Parte comprometida (API, T-310.2 y T-315.7):** la disposición final exige el campo `confirmacion`; si no coincide, responde 422 sin cambiar el estado.
- **Parte en pantalla (EC-19 completo, EC-41):** FUERA DE LO COMPROMETIDO (COULD C-01).
- **Objetivo:** comprobar que toda acción irreversible exige una confirmación que identifica la unidad y, cuando exista la pantalla, que advierte antes de ejecutarse.
- **Pasos (API):**
  1. Ejecutar la disposición final de una unidad sin el campo `confirmacion`. *Esperado: 422 y estado sin cambio.*
  2. Ejecutarla con un identificador que no coincide. *Esperado: 422 y estado sin cambio.*
  3. Ejecutarla con el identificador correcto. *Esperado: se ejecuta.*
  4. Revisar la serie de auditoría. *Esperado: la acción queda con su responsable.*
- **Pasos (pantalla, cuando exista C-01):**
  1. Iniciar la disposición final y el despacho. *Esperado: advertencia previa que declara la irreversibilidad, nombra la unidad y pide confirmación.*
  2. Intentar ejecutar con un solo clic. *Esperado: imposible.*
  3. Revisar la posición del botón. *Esperado: no contiguo a una acción frecuente e inofensiva.*
  4. Revisar con lector de pantalla y sin depender del color. *Esperado: la advertencia es perceptible.*
- **Aprueba si:** el 100 % de las acciones irreversibles exige confirmación con el identificador de la unidad, cero se ejecutan con un solo clic o sin advertencia, la advertencia no depende solo del color y el 100 % queda registrado con su responsable. En el Sprint 3 solo se evalúa la parte de API.
- **Nota:** el conjunto de «acciones irreversibles» no está cerrado en ningún documento. El DD marca la disposición final y la decisión de transferencia; EC-41 añade el despacho de una unidad reservada, que la máquina de estados admite revertir. Se registra la ambigüedad.

##### 3.3.9 TC-015 a TC-018 · EC-17, EC-28, EC-32 y EC-31

Ninguno de los cuatro se ejecuta en el Sprint 3 salvo que se decida. Se diseñan para que no queden fuera del plan.

| Caso | Escenario | Situación | Procedimiento | Aprueba si |
|---|---|---|---|---|
| TC-015 | EC-17, registro anónimo en tres pasos (Media) | FUERA DE LO COMPROMETIDO (COULD C-08) | Completar el registro de intención sin sesión previa, en escritorio y móvil, y contar los pasos en el indicador de progreso | Tres pasos como máximo, cero campos de identificación obligatorios, y en prueba con cinco personas ajenas al equipo, al menos cuatro completan el registro sin ayuda en dos minutos o menos |
| TC-016 | EC-28, identificación del propósito (Media) | FUERA DE LO COMPROMETIDO (COULD C-01) | Mostrar la página inicial a cinco personas ajenas al equipo y pedirles que expliquen el propósito y encuentren la acción de donar | Al menos cuatro describen correctamente el propósito y localizan la acción de donar en menos de 30 segundos, y cero terminología técnica del dominio sin explicación adyacente |
| TC-017 | EC-32, legibilidad del estado de una unidad (Baja) | SIN TAREA NI HISTORIA | Abrir el historial de trazabilidad de una unidad y pedir a tres personas ajenas al equipo que reconstruyan su historia | Cero códigos internos de estado visibles, el 100 % de los estados con denominación en lenguaje natural, y las tres personas reconstruyen la historia sin explicación previa |
| TC-018 | EC-31, recuperación ante un rechazo (Baja) | SIN TAREA NI HISTORIA | Provocar rechazos por regla de negocio, por conflicto de estado y por falta de alcance | El 100 % de los rechazos nombra la causa en lenguaje de dominio y ofrece al menos una acción siguiente, con cero trazas, nombres de componente o códigos internos, y sin revelar recursos fuera de la jurisdicción |

- **Nota práctica:** EC-17, EC-28 y EC-32 exigen cada uno una prueba con personas ajenas al equipo (5, 5 y 3). Conviene hacerlas en una sola sesión de usuarios.
- **Nota sobre TC-017:** la vista de trazabilidad del auditor aún no existe (P-08 del SAD). Si no existe al probar, el caso queda Bloqueado.
- **Nota sobre TC-018:** para el rechazo 404 por falta de alcance el DD exige que sea indistinguible del recurso inexistente, lo que contradice «nombrar la causa». Se registra el conflicto; la excepción debe decidirse.

#### Pruebas de mantenibilidad

##### 3.3.10 TC-019 · EC-21 · Cambio de la regla de elegibilidad

- **Prioridad:** Baja. **Tarea:** SIN TAREA NI HISTORIA. **Origen:** RF-02.
- **Objetivo:** comprobar que un cambio del periodo mínimo entre donaciones se aplica en un solo punto del dominio.
- **Precondiciones:** donantes con historial y acceso al repositorio del Servicio de Donación.
- **Pasos:**
  1. Cambiar el periodo mínimo entre donaciones en el dominio. *Esperado: se modifica un único punto.*
  2. Contar los archivos modificados. *Esperado: dos o menos del Servicio de Donación.*
  3. Verificar que no cambió ningún otro servicio ni el contrato. *Esperado: cero cambios.*
  4. Ejecutar la suite existente y la prueba de la regla nueva. *Esperado: todas pasan y la regla nueva tiene prueba propia.*
- **Aprueba si:** dos archivos o menos del Servicio de Donación, cero cambios en otros servicios y en el contrato, las pruebas existentes siguen pasando y la regla nueva tiene prueba propia.
- **Nota:** la parte de «un punto de historia o menos» no es verificable mientras ningún documento defina su equivalencia en horas. El backlog usa 2 horas por punto como referencia de encaje, no como definición. Esa parte se reporta como no evaluable.

#### Pruebas de integración y de datos

##### 3.3.11 TC-020 · Flujo punta a punta por el gateway

- **Prioridad:** Alta. **Tarea:** T-315.4. El caso se escribe contra el contrato desde T-301.5.
- **Objetivo:** comprobar el flujo completo: sesión, donación con campaña, tamizaje, inventario y despacho.
- **Precondiciones:** incremento desplegado en QA, datos sintéticos, un usuario por rol necesario y una campaña activa.
- **Pasos:**
  1. Iniciar sesión por el gateway. *Esperado: token válido.*
  2. Registrar una donación asociada a una campaña. *Esperado: unidad creada.*
  3. Registrar el tamizaje de la unidad. *Esperado: estado actualizado, sin causa clínica.*
  4. Consultar las existencias. *Esperado: la unidad apta figura como disponible.*
  5. Despachar la unidad. *Esperado: despacho exitoso y registro en la auditoría.*
- **Aprueba si:** el flujo termina sin errores, cada paso deja el estado esperado y el historial de la unidad refleja los cinco eventos.

##### 3.3.12 TC-021 · Datos sintéticos coherentes entre las tres bases

- **Prioridad:** Alta. **Tarea:** T-302.4 (En curso).
- **Objetivo:** comprobar que los identificadores son coherentes entre `db_identidad`, `db_donacion` y `db_campana` y que no hay causa clínica en los datos.
- **Pasos:**
  1. Cargar los datos con la semilla versionada. *Esperado: carga sin errores.*
  2. Cruzar los identificadores entre las tres bases. *Esperado: sin huérfanos ni incoherencias.*
  3. Buscar campos o valores de causa clínica en los datos. *Esperado: ninguno.*
  4. Repetir la carga con la misma semilla. *Esperado: mismos datos.*
- **Aprueba si:** cero identificadores incoherentes, cero datos de causa clínica y la misma semilla produce el mismo conjunto.

### 3.4 Pruebas de rendimiento y volumen del Sprint 3

El Sprint 3 no tiene escenarios de carga propiamente dichos. Sus métricas de tiempo y volumen son estas, y se miden dentro de los casos indicados:

| Métrica | Escenario | Caso | Umbral |
|---|---|---|---|
| Duración de la suite de transiciones | EC-36 | TC-004 | Menos de 2 minutos y sin base de datos |
| Tiempo en que la unidad vencida deja de figurar como disponible | EC-13 | TC-007 | 15 minutos o menos |
| Reenvíos del mismo registro | EC-10 | TC-010 | 100 reenvíos con cero duplicados |
| Tiempo de espera entre servicios | EC-08 | TC-011 | 3 segundos o menos |
| Tiempo de reconstrucción de la cadena de una unidad | EC-05 | TC-009 | Menos de 5 minutos |
| Arranque del sistema completo | EC-23 | TC-013 | 10 minutos o menos |

### 3.5 Pruebas de carga (diseño ahora, ejecución en el Sprint 4)

Se dejan diseñadas con las medidas del catálogo para que el Sprint 4 las ejecute sin rediseñar. La herramienta de carga prevista es Gatling (C-07) y las métricas se toman de Prometheus y Grafana (C-05), ambas opcionales en el Sprint 3. La rampa es **PENDIENTE DOC (Herramientas)**.

| Prueba | Escenario | Carga | Aprueba si |
|---|---|---|---|
| LT-01 · Carga nominal de inventario | EC-15 | 20 usuarios concurrentes sobre el volumen sintético de referencia | Percentil 95 de 3 segundos o menos y percentil 99 de 5 segundos o menos, medidos en el gateway |
| LT-02 · Pico de campaña | EC-16 | 50 usuarios concurrentes durante 10 minutos | Tasa de error menor al 1 %, percentil 95 de 3 segundos o menos, CPU y memoria por debajo del 80 % del límite y cero peticiones perdidas |
| LT-03 · Carga sostenida | EC-26 | 50 usuarios concurrentes durante 30 minutos | CPU por debajo del 80 % y memoria por debajo del 75 %, memoria final no mayor en más de 10 % a la de los primeros 5 minutos, cero reinicios y bases de datos por debajo del 80 % de sus conexiones |
| LT-04 · Sobrecarga | EC-37 | 200 usuarios concurrentes durante 5 minutos | Cero peticiones perdidas (toda petición se atiende o se rechaza con 429 o 503), cero contenedores caídos, regreso al percentil 95 nominal en 2 minutos y, con una segunda instancia, error menor al 1 % |
| LT-05 · Disponibilidad con fallo inducido | EC-07 | 20 usuarios concurrentes con un contenedor caído | Disponibilidad de 99 % o más, recuperación en 60 segundos o menos y cero reinicios manuales |
| LT-06 · Abuso automatizado | EC-06 | 600 peticiones por minuto desde un origen, con 20 usuarios legítimos | El 100 % de las peticiones sobre 60 por minuto se rechaza con 429, identificadores no secuenciales y degradación del tráfico legítimo menor al 20 % |

LT-02 y LT-03 comparten ambiente y parte de la medida; el catálogo sugiere ejecutarlas como una sola campaña de medición.

### 3.6 Matriz de cobertura

| Escenario | Característica ISO 25010 | Sprint del catálogo | Historia | Caso(s) | Tarea de ejecución | Cobertura |
|---|---|---|---|---|---|---|
| EC-01 | Seguridad / Confidencialidad | 3 | HU-305, HU-309 | TC-001 | T-315.5 | Cubierto con U3 y U4. **FALTANTE T-330.4**. U5: COULD C-02 |
| EC-02 | Seguridad / Confidencialidad | 3 | HU-308 | TC-003 | T-315.5 | Cubierto |
| EC-03 | Seguridad / Autenticidad | 3 | HU-304, HU-330 | TC-002 | T-315.5 | Cubierto. **FALTANTE T-303, T-330.5** |
| EC-04 | Seguridad / Integridad | 3 | HU-307 | TC-004 | T-315.2 | Cubierto |
| EC-05 | Seguridad / No repudio | 3 | HU-310, HU-330 | TC-009 | T-315.8 | Cubierto. **FALTANTE T-330.4** |
| EC-10 | Fiabilidad / Ausencia de fallos | 3 | HU-306 | TC-010 | T-315.6 | Cubierto |
| EC-12 | Seguridad física / A prueba de fallos | 3 | HU-310 | TC-005 | T-315.7 | Cubierto en despacho. Transferencia y reserva no aplicables |
| EC-13 | Adecuación funcional | 3 | HU-311 | TC-007 | T-315.8 | Cubierto. **FALTANTE T-322.3** |
| EC-17 | Interacción / Operabilidad | 3 | | TC-015 | | FUERA DE LO COMPROMETIDO (COULD C-08) |
| EC-19 | Interacción / Protección contra errores | 3 | HU-310 | TC-014 | T-315.7 (API) | Parcial. Pantalla: COULD C-01 |
| EC-21 | Mantenibilidad / Modificabilidad | 3 | | TC-019 | | SIN TAREA NI HISTORIA |
| EC-28 | Interacción / Reconocibilidad | 3 | | TC-016 | | FUERA DE LO COMPROMETIDO (COULD C-01) |
| EC-31 | Interacción / Asistencia al usuario | 3 | | TC-018 | | SIN TAREA NI HISTORIA |
| EC-32 | Interacción / Autodescripción | 3 | | TC-017 | | SIN TAREA NI HISTORIA |
| EC-33 | Seguridad / Responsabilidad | 3 | HU-311 | TC-008 | T-315.8 | Cubierto |
| EC-39 | Seguridad física / Restricción operativa | 3 | HU-310 | TC-006 | T-315.7 | Cubierto en despacho. Transferencia no aplicable |
| EC-41 | Seguridad física / Advertencia de peligros | 3 | | TC-014 | | FUERA DE LO COMPROMETIDO (COULD C-01) |
| EC-08 | Fiabilidad / Tolerancia a fallos | 4 | HU-306 | TC-011 | T-315.6 | Cubierto |
| EC-22 | Compatibilidad / Interoperabilidad | 2 | HU-301, HU-313 | TC-012 | T-315.3 | Cubierto |
| EC-23 | Flexibilidad / Instalabilidad | 2 | HU-314 | TC-013 | T-314.3 (Veli) | Medición de Veli. Verificación independiente sin tarea |
| EC-36 | Mantenibilidad / Capacidad de ser probado | 1 | HU-307 | TC-004 | T-315.2 | Cubierto |

La base de esta matriz según el backlog (sección 7) es **PENDIENTE DOC (backlog, sección 7)** y puede cambiar la columna de cobertura.

---

## 4. Resultados de las pruebas

Los resultados detallados viven en `testing/test-reports/test-report-sprint-3.md`, que es el documento que QA diligencia al ejecutar. Esta sección fija las reglas y recibe el resumen.

### 4.1 Cómo se decide si una prueba pasa o no pasa

- **Aprobado:** se cumplieron todas las condiciones de la medida de respuesta del escenario. El informe anota el valor observado y la evidencia.
- **Fallido:** al menos una condición de la medida no se cumplió. El informe debe decir **cuál condición falló, qué se esperaba, qué se observó y por qué se considera una falla**, y enlazar el Issue «Defecto».
- **Bloqueado:** no se pudo ejecutar. El informe anota el bloqueo (por ejemplo, **FALTANTE T-330**) y quién lo resuelve.
- **No ejecutado:** el caso aún no se ha intentado.
- **No evaluable:** una parte de la medida no se puede verificar porque falta una definición (por ejemplo, la equivalencia de «punto de historia» en EC-21). Se anota aparte y no cuenta como aprobada.
- **No aplicable en el Sprint 3:** la condición depende de algo que el incremento no incluye (por ejemplo, las transferencias). No cuenta como aprobada ni como fallida y se explica.

Un caso nunca se oculta por estar fallido o bloqueado.

### 4.2 Resumen de resultados del Sprint 3

**Pendiente de ejecución.** Se completa al cerrar T-316.1 y T-316.3.

| Indicador | Resultado |
|---|---|
| Casos de prueba planeados | 21 (de los cuales 6 están FUERA DE LO COMPROMETIDO o SIN TAREA NI HISTORIA) |
| Casos ejecutados | `[Pendiente]` |
| Casos aprobados | `[Pendiente]` |
| Casos fallidos | `[Pendiente]` |
| Casos bloqueados | `[Pendiente]` |
| Defectos críticos abiertos | `[Pendiente]` |
| Recomendación | `[Listo para entregar / Listo con riesgos aceptados / No listo para entregar]` |

---

## 5. Plan de pruebas del Sprint 4 (borrador)

El plan definitivo depende del Backlog V4 que emite T-327.3 (Alex) con el Sprint Goal, las historias y los puntos del Sprint 4. **FALTANTE T-327.3.** Mientras no exista, esto es una propuesta:

- **Carga y rendimiento:** ejecutar LT-01 a LT-06 (sección 3.5), con Gatling y Prometheus/Grafana.
- **Fiabilidad y observabilidad:** EC-07 (con LT-05) y verificación de la correlación de EC-20, que ya se puede probar desde que exista el gateway (T-305.5 y T-306.6).
- **Alertas:** EC-40, con la condición de contorno que el catálogo señala: un umbral de 0 días o una unidad con vida útil menor al umbral hace imposible «cero unidades que venzan sin alerta».
- **Escenarios de interfaz** que se integren desde los Could (C-01, C-08): TC-014 completo, TC-015 y TC-016.
- **Arrastre:** reejecución de los casos fallidos o bloqueados del Sprint 3 y de lo que T-327.2 devuelva al Product Backlog.

---

## 6. Riesgos, dependencias y hallazgos abiertos

| Elemento | Impacto | Acción de mitigación | Responsable |
|---|---|---|---|
| **FALTANTE T-303.1 a T-303.3** (llave de prueba, su carga y su rechazo en QA) | Alto: bloquea la variante «emisor desconocido» de EC-03 y las pruebas con tokens | Priorizar T-303.1; el backlog la marca para agendar primero | Sebastián |
| **FALTANTE T-330.4 y T-330.5** (auditoría de Identidad y sus pruebas) | Alto: bloquea el registro de denegaciones de EC-01 y EC-05 | Terminar T-330 antes de T-315.5 y T-315.8 | Sebastián |
| **FALTANTE T-322.3** (contradicción RDS-13 del ciclo de vencimiento) | Alto: bloquea T-311.1 y, con él, EC-13 y EC-33 | Resolver con Veli al inicio del sprint | Alex |
| **FALTANTE T-327.3** (Backlog V4) | Medio: impide emitir el TD V1 (T-325.6 depende de él) | Alinear la sección 5 con el Backlog V4 | Alex |
| T-314.6 (despliegue completo en QA) es el hito del que depende el informe | Alto | Seguir su avance; sin él no hay informe de pruebas | Veli |
| Capacidad: el compromiso del equipo es de 172 horas equivalentes frente a 126 disponibles; QA tiene 36 horas frente a 18 | Alto | Priorizar los casos Críticos y Altos; mover los demás | Carlos |
| Cinco escenarios del Sprint 3 sin implementación comprometida (EC-17, 19-pantalla, 28, 41 en Could; EC-21, 31, 32 sin historia) | Alto: EC-41 es de banda Alta | Decidir si se agregan al Sprint o se difieren con justificación | Alex |
| Transferencias y reservas no están en el contrato del Sprint 3 | Medio: EC-12, EC-39 y EC-41 quedan parciales | Confirmar con Donación si habrá endpoint | Damián |
| EC-01: la matriz normativa es la del DD (T-305.3, T-324.1) | Medio | Confirmar el contenido en el DD (T-322.5) | Alex |
| EC-01 solo se prueba con U3 y U4; U5 depende de C-02 | Medio | Declarar el alcance en el informe | Tomás |
| EC-05: hay al menos tres series de auditoría (Identidad, Donación, Campañas). El catálogo supone una sola | Medio: la reconstrucción en 5 minutos puede no ser alcanzable | Decidir cómo el auditor ve la cadena de una unidad | Sara |
| EC-36: el catálogo dice 14/67 y el backlog y el DD dicen 13/68 más el alta | Bajo | Se usa 82 casos (T-307.1, T-307.3). Corregir el catálogo | Sara |
| EC-23: el catálogo dice ocho contenedores y el compose lista 12 elementos | Bajo | Corregir el catálogo o el compose | Veli |
| EC-12: falta un caso explícito de «estado indeterminado» | Medio | Incluido en TC-005 | Tomás |
| EC-19 y EC-41: el conjunto de «acciones irreversibles» no está cerrado | Medio | Fijar la lista en el DD | Alex |
| EC-31: el 404 contradice «nombrar la causa» | Medio | Exceptuar el 404 en la medida | Alex |
| EC-21: «punto de historia» sin equivalencia definida | Bajo | Definir la conversión | Carlos |

---

## 7. Revisión y aprobación

| Actividad | Persona | Fecha | Resultado |
|---|---|---|---|
| Revisión del plan | Carlos Santiago | AAAA-MM-DD | `Pendiente` |
| Aprobación final | Carlos Santiago | AAAA-MM-DD | `Pendiente` |
