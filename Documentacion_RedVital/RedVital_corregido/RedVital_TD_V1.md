# REDVITAL  
## Documento de Pruebas — TD V1

**Metodología, diseño, cobertura y reporte de pruebas — Sprint 3**

**Arkhé Software S.A.S.**  
*De la raíz a la red*

| Campo | Información |
|---|---|
| Curso | Arquitectura de Software Empresarial |
| Cliente | Profesor de la asignatura, en el rol simulado de Ministerio de Salud y Protección Social |
| Entrega | Review Sprint 3 y Planning Sprint 4 — Semana 10 |
| Código | TST-PLAN-03 |
| Versión | 1.1 |
| Estado | Para revisión final / ejecución |
| Fecha | 17 de octubre de 2026 |
| Clasificación | Uso interno del proyecto |

---

# Control del documento

| Campo | Información |
|---|---|
| Código del documento | TST-PLAN-03 |
| Historia que lo produce | HU-325 (T-325.1 a T-325.6) |
| Ítems relacionados | HU-315, HU-316, HU-302 |
| Responsable de pruebas | Tomás (QA / Tester) |
| Informe de pruebas asociado | `testing/test-reports/test-report-sprint-3.md` |
| Fichas con archivo propio | `testing/test-cases/` |
| Conjunto sintético | T-302.1, versión 2.1.0, semilla 302, manifiesto `conjunto-sintetico.yaml` |

# Control de versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| 0.1 | 03/10/2026 | Tomás | Creación inicial del documento en Markdown. |
| 0.2 | 03/10/2026 | Tomás | Incorporación del alcance real de Sprint 3, tareas T-303, T-327 y T-330 y escenarios fuera de lo comprometido. |
| 0.3 | 07/10/2026 | Equipo Arkhé | Contraste con SRS V4.0, DD V3.0, Herramientas V4.0 y T-302.1. Se incorporan clases de camino, métricas, cobertura funcional, TC-022, TC-023, LT-07 y hallazgos H-01 a H-13. |
| 1.0 | 08/10/2026 | Equipo Arkhé | Corrección de consistencia con la arquitectura vigente del Sprint 3: APISIX es el gateway actual; Kafka y Transactional Outbox forman parte de la integración vigente; se corrige TC-011 para evaluar indisponibilidad de la plataforma de eventos; se actualizan herramientas, alcance, dependencias, riesgos y hallazgos sin alterar la intención de las pruebas existentes. |
| 1.1 | 17/10/2026 | Equipo Arkhé | Corrección de consistencia documental con SAD V3.1, SDD V2.1, DD V3.1 e Infraestructura V2.1: se retira la atribución al DD de las dieciséis operaciones; el ciclo de vencimiento de cinco minutos queda documentado en Infraestructura y DD; se corrigen el estado del frontend, el listado de escenarios sin implementación (EC-21) y la referencia a la línea base de RF; se aclara la relación con el script E2E de Infraestructura, la instancia de demostración y la pila de medición; y se registran los hallazgos H-16 a H-25 por conflictos entre fuentes, sin alterar medidas de respuesta ni la intención de los casos. |

# Aprobaciones

| Rol | Responsable | Firma / Fecha |
|---|---|---|
| QA / Tester | Tomás | |
| Scrum Master / Project Manager | Carlos Santiago Pinzón | |
| Product Owner | Alexander Aponte | |
| Arquitecta de Software | Sara | |
| DevOps | Veli | |

La aprobación de QA acredita que cada caso toma su criterio de la medida de respuesta del catálogo sin reinterpretarla. La aprobación de Arquitectura acredita que los resultados esperados coinciden con los contratos y con la arquitectura vigente. La aprobación del Product Owner acredita que el alcance excluido y los hallazgos que afecten la demostración se declaran ante el cliente. DevOps acredita que los ambientes y la pila de medición descritos existen o tienen una fecha explícita.

---

# 1. Introducción

## 1.1 Propósito

Este documento define cómo se verifica que el Sprint 3 de RedVital cumple los escenarios de calidad que el SAD le asigna y los requerimientos funcionales que el incremento implementa:

- qué pruebas se hacen;
- cuántas se hacen;
- con qué herramientas;
- bajo qué protocolo;
- contra qué métricas y umbrales;
- qué parte del sistema queda probada;
- qué parte no queda probada;
- cómo se reporta el resultado.

Este TD V1 es producido por HU-325.

## 1.2 Alcance incluido

El alcance se define por HU-315, las tareas de HU-302 y HU-316 y las dieciséis operaciones del incremento del Sprint 3 (catálogo de la sección 4.1, trazado a los contratos OpenAPI de cada servicio; el DD define datos y propiedad, no operaciones).

| Grupo | Contenido |
|---|---|
| Escenarios comprometidos | EC-01, EC-02, EC-03, EC-04, EC-05, EC-08, EC-10, EC-12, EC-13, EC-33, EC-36, EC-39 y EC-19 en su parte de API |
| Matriz de cobertura | Escenarios del Sprint 3 del catálogo más EC-08, EC-22, EC-23 y EC-36 |
| Operaciones del incremento | 4 de Identidad, 8 de Donación y 4 de Campañas |
| Datos | Conjunto sintético T-302.1 |
| Flujo | Acceso por Caddy → APISIX → servicio correspondiente |
| Integración | Comunicación asíncrona mediante Kafka donde existe dependencia entre microservicios |
| Consistencia de eventos | Transactional Outbox en productores que requieren publicar después de una transacción local |

## 1.3 Alcance excluido o no comprometido

### Escenarios sin implementación comprometida

Los casos de EC-17, EC-21, EC-28, EC-41, EC-31 y EC-32 permanecen diseñados para no perder cobertura futura, pero no se ejecutan mientras no exista la funcionalidad necesaria.

### Carga y estrés

EC-15, EC-16, EC-26, EC-37, EC-07 y EC-06 tienen sus pruebas de carga, sobrecarga y estrés diseñadas en este documento. Su ejecución se mantiene planificada para Sprint 4 salvo que QA y DevOps habiliten formalmente la campaña de carga antes del cierre del Sprint 3.

### Servicio Institucional

El Servicio Institucional todavía no está implementado completamente. Por lo tanto:

- no se verifica la vista territorial completa de U5/U6;
- las pruebas que dependan de ese servicio se reportan como bloqueadas, no aplicables o fuera del incremento según el caso;
- no se inventa un comportamiento alternativo.

### Notificaciones

Notificaciones pertenece a la arquitectura objetivo pero su implementación completa permanece pendiente. La plataforma Kafka sí forma parte de la infraestructura vigente del Sprint 3 y puede verificarse independientemente de que el consumidor Notificaciones aún no esté completo.

### Fraccionamiento, reserva y transferencias

El contrato del incremento no completa todo ese recorrido. Las unidades que una prueba necesita en estados posteriores pueden provenir del conjunto sintético. El Review debe declarar cuando un flujo se demuestra por tramos.

## 1.4 Referencias

| Documento / artefacto | Estado | Uso |
|---|---|---|
| Catálogo de escenarios de calidad | Disponible | Medidas de respuesta y bandas |
| SAD V3 (rev. 3.1) | Disponible | Arquitectura vigente |
| SRS V4 | Disponible | RF, RNF y matriz usuario-módulo (sustituye al SRS V3 del 22/09/2026, que ya no es línea base) |
| DD V3 (rev. 3.1) | Disponible | Datos, reglas de integridad, propiedad y restricciones; no define operaciones ni la matriz de autorización |
| SDD V2 (rev. 2.1) | Disponible | C4 (fuente Mermaid) y diseño de componentes |
| Infraestructura V2 (rev. 2.1) | Disponible | Ambientes, VMs, Kafka, APISIX, Caddy y ciclo de vencimiento |
| ADR-011 | Disponible | Matriz normativa de autorización por grupo de operaciones (ver H-25) |
| Herramientas, Políticas y Lineamientos V4 | Disponible | Instrumental de pruebas |
| Conjunto sintético T-302.1 v2.1.0 | Disponible / sujeto a cierre de decisiones abiertas | Datos y resultados esperados |
| Backlog V4 | En evolución | Asignación y cierre de tareas |
| Contratos OpenAPI | Disponibles según servicio | Validación HTTP |
| Contratos AsyncAPI | Disponibles donde aplica | Validación de eventos Kafka |

## 1.5 Nomenclatura y servicios del incremento

RedVital tiene cinco microservicios arquitectónicos:

1. Identidad;
2. Institucional;
3. Campañas;
4. Donación;
5. Notificaciones.

El incremento actual tiene implementación funcional de:

- Identidad;
- Campañas;
- Donación;
- frontend (funcional parcial, según el flujo disponible);
- Caddy;
- Apache APISIX;
- Kafka;
- persistencias asociadas al incremento.

Institucional y Notificaciones continúan pendientes de implementación completa.

**Apache APISIX es el API Gateway vigente del Sprint 3.**  
**Kafka es la plataforma vigente para comunicación asíncrona entre microservicios.**

No se utiliza YARP como gateway vigente y no se modelan llamadas HTTP directas de negocio entre microservicios como estrategia arquitectónica actual.

## 1.6 Convenciones de estado

| Estado | Significado |
|---|---|
| Pendiente | Existe definición, pero falta ejecución o evidencia |
| Bloqueado | No puede ejecutarse por una dependencia |
| Fuera del incremento | Requiere funcionalidad no comprometida |
| No evaluable | Existe conflicto o definición incompleta |
| Resuelto | La dependencia documental o arquitectónica ya fue cerrada |

## 1.7 Cambios de consistencia introducidos en V1.0

Esta versión corrige exclusivamente inconsistencias frente a la arquitectura vigente:

1. YARP → Apache APISIX.
2. Kafka deja de tratarse como una adopción futura: ya forma parte de la integración vigente.
3. TC-011 deja de simular una llamada HTTP Donación → Campañas y pasa a verificar indisponibilidad de Kafka / publicación pendiente.
4. TC-012 incluye contratos HTTP y eventos en sus respectivas fronteras.
5. Infraestructura V2.1 y DD V3.1 documentan el ciclo de vencimiento de cinco minutos (en la V1.0 esta afirmación no se sustentaba: ni Infraestructura V2 ni el DD V3 lo incluían).
6. El plan de Sprint 4 mantiene regresión y carga, pero no presenta APISIX/Kafka como tecnologías futuras.
7. H-06 y la parte arquitectónica de H-07 se consideran corregidas por esta versión.

No se altera la intención funcional, las medidas de respuesta ni la cobertura de los demás casos salvo cuando dependían directamente de la arquitectura obsoleta.

## 1.8 Cambios de consistencia introducidos en V1.1

Esta versión corrige discrepancias detectadas al contrastar el TD V1.0 con SAD, SDD, DD, Infraestructura y SRS. No altera medidas de respuesta ni la intención de los casos:

1. Las dieciséis operaciones del incremento dejan de atribuirse al DD: su fuente es el catálogo de la sección 4.1 y los contratos OpenAPI.
2. El ciclo de vencimiento de cinco minutos queda documentado en Infraestructura V2.1 y en DD V3.1, de modo que el criterio de entrada de la sección 2.10 puede verificarse.
3. El estado del frontend se declara como funcional parcial, igual que en el SAD.
4. EC-21 se incluye entre los escenarios diseñados sin implementación comprometida (coherente con la sección 4.5).
5. La línea base de RF se precisa: 22 RF según el SRS V4; el SRS V3 del 22/09/2026 ya no es línea base (H-16).
6. Se explica la relación entre el script E2E de Infraestructura y los casos de este TD (sección 2.8) y se declara que la instancia de demostración y la pila de medición aún no tienen ambiente definido (H-18).
7. TC-003, TC-011 y TC-013 incorporan notas sobre el esquema físico vigente de Donación, el escenario literal de RNF-06 y la instalabilidad sin registro de imágenes (H-24, H-19 y H-20).
8. Se registran los hallazgos H-16 a H-25 por conflictos entre fuentes que requieren decisión de Arquitectura y Producto (sección 7.2). En cumplimiento de la Regla 1, ningún caso se modificó en silencio.

---

# 2. Metodología de pruebas

## 2.1 Enfoque

Las pruebas siguen tres reglas.

### Regla 1 — la medida de respuesta manda

La medida de respuesta del catálogo es el criterio de aprobación. Si tiene varias condiciones, el caso aprueba solo cuando se cumplen todas.

Si un contrato impide cumplir literalmente una medida, no se modifica el caso en silencio: se registra el conflicto como hallazgo y la parte afectada se reporta como **No evaluable** hasta que Arquitectura y Producto decidan.

### Regla 2 — orientación al riesgo

Se ejecuta primero lo que, si falla, causa más daño:

1. confidencialidad de la causa clínica;
2. bloqueo de unidades no aptas o vencidas;
3. control de acceso;
4. integridad/idempotencia;
5. trazabilidad;
6. funcionamiento general.

### Regla 3 — camino feliz insuficiente

Toda operación con estado o permisos debe tener al menos un camino negativo.

## 2.2 Clases de camino

| Código | Nombre | Qué prueba |
|---|---|---|
| F | Feliz | Entrada válida, permisos correctos y resultado esperado |
| N | Negativo | Entrada inválida, rol sin permiso, jurisdicción ajena o transición prohibida |
| B | Borde | Valor justo en el límite de tiempo, cantidad, vigencia o repetición |
| X | Fallo inducido / carga | Dependencia caída o carga controlada |

## 2.3 Tipos de prueba y cantidad

| Tipo | Casos / pruebas | Total | En Sprint 3 |
|---|---|---:|---:|
| Seguridad | TC-001 a TC-003 | 3 | 3 |
| Seguridad física | TC-005, TC-006, TC-014 | 3 | 3 |
| Funcional | TC-007, TC-022, TC-023 | 3 | 3 |
| Integridad e idempotencia | TC-004, TC-010 | 2 | 2 |
| Auditoría | TC-008, TC-009 | 2 | 2 |
| Resiliencia | TC-011 | 1 | 1 |
| Contrato | TC-012 | 1 | 1 |
| Instalabilidad | TC-013 | 1 | 1 |
| Interfaz y usabilidad | TC-015 a TC-018 | 4 | 0 |
| Mantenibilidad | TC-019 | 1 | 0 |
| Integración | TC-020 | 1 | 1 |
| Datos | TC-021 | 1 | 1 |
| **Casos de prueba** |  | **23** | **18** |
| Carga | LT-01 a LT-03, LT-05, LT-06 | 5 | 0 |
| Sobrecarga | LT-04 | 1 | 0 |
| Estrés | LT-07 | 1 | 0 |
| **Carga y estrés** |  | **7** | **0** |

## 2.4 Distribución por camino

| Clase | Casos |
|---|---:|
| Incluyen F | 16 de 23 |
| Incluyen N | 13 de 23 |
| Incluyen B | 6 de 23 |
| Incluyen X | 1 de 23, más las pruebas LT |
| Solo F | 7 de 23 |

De los 18 casos ejecutables en Sprint 3, 15 prueban algo adicional al camino feliz.

## 2.5 Niveles de prueba

1. **Unitario / dominio.** JUnit 5 + Mockito en Donación; xUnit en servicios .NET.
2. **Integración.** PostgreSQL real y Kafka mediante Testcontainers cuando la prueba depende de ellos.
3. **Servicio.** API del servicio con tokens controlados.
4. **Contrato HTTP.** OpenAPI.
5. **Contrato de eventos.** AsyncAPI / esquema de evento cuando aplique.
6. **Punta a punta.** Desde borde: Caddy → APISIX → servicio → persistencia / Kafka.
7. **Interfaz.** Aplicación web.
8. **Infraestructura.** Redes, firewall, health checks, TLS y despliegue.

## 2.6 Atributos de calidad, métricas y umbrales

| Característica | EC | Métrica | Umbral | Prueba |
|---|---|---|---|---|
| Seguridad | EC-02 | Campos de causa clínica | 0 | TC-003 |
| Seguridad | EC-05 | Reconstrucción de cadena | < 5 min | TC-009 |
| Seguridad | EC-33 | Acciones automáticas atribuidas a usuario | 0; 100 % actor sistema | TC-008 |
| Seguridad física | EC-39 | Despachos por institución distinta a custodia | 0 | TC-006 |
| Seguridad física | EC-19 / EC-41 | Acción irreversible sin confirmación | 0 | TC-014 |
| Adecuación funcional | EC-13 | Unidad vencida deja disponibilidad | <= 15 min | TC-007 |
| Fiabilidad | EC-10 | Duplicados ante reenvíos | 0 en 100 | TC-010 |
| Fiabilidad | EC-08 / RNF-06 | Operación local ante broker no disponible y posterior publicación | transacción local no se pierde; evento queda pendiente y se publica al recuperarse Kafka | TC-011 |
| Fiabilidad | EC-07 | Disponibilidad y recuperación ante caída | >=99 %, recuperación <=60 s | LT-05 |
| Compatibilidad | EC-22 | Cambios compatibles / llamadas fuera de contrato | 0 fallos / 0 llamadas fuera de contrato | TC-012 |
| Flexibilidad | EC-23 | Arranque completo | <=10 min, un comando | TC-013 |
| Mantenibilidad | EC-36 | Suite de transiciones | <2 min, sin BD | TC-004 |
| Mantenibilidad | EC-21 | Archivos para cambio de regla | <=2, en un solo servicio | TC-019 |
| Interacción | EC-17 | Registro anónimo | <=3 pasos; 4/5 en <=2 min | TC-015 |
| Interacción | EC-28 | Reconocimiento de propósito | 4/5 en <30 s | TC-016 |
| Interacción | EC-32 | Códigos internos visibles | 0 | TC-017 |
| Interacción | EC-31 | Rechazo con orientación | 100 % donde no exista ocultamiento por seguridad | TC-018 |
| Desempeño | EC-15 | Inventario 20 usuarios | p95 <=3 s; p99 <=5 s | LT-01 |
| Desempeño | EC-16 | Pico 50 usuarios / 10 min | error <1 %; p95 <=3 s | LT-02 |
| Desempeño | EC-26 | 50 usuarios / 30 min | límites de CPU, memoria y conexiones | LT-03 |
| Desempeño | EC-37 | 200 usuarios | 0 peticiones perdidas; recuperación <=2 min | LT-04 |
| Seguridad | EC-06 | Rate limit | 100 % por encima del límite → 429 | LT-06 |
| Estrés | — | Punto de quiebre | caracterización; propuesta >100 usuarios | LT-07 |

## 2.7 Herramientas

| Categoría | Herramienta |
|---|---|
| Marcos | JUnit 5 + Mockito, xUnit, Vitest |
| Integración | Testcontainers para PostgreSQL y Kafka |
| CI | GitHub Actions |
| Contratos HTTP | OpenAPI |
| Contratos asíncronos | AsyncAPI / validación de esquema de evento |
| Seguridad CI | Gitleaks, Grype |
| Accesibilidad | ESLint + auditoría de navegador |
| Contenedores | Docker Compose |
| Migraciones | Flyway / mecanismos versionados por servicio |
| Gateway | **Apache APISIX** |
| Borde | Caddy |
| Mensajería | **Apache Kafka 4.3.1** |
| Métricas | Prometheus y Grafana |
| Kafka UI | Kafbat |
| Carga | Gatling |
| Defectos | GitHub Projects / Issues |

## 2.8 Ambientes y datos de prueba

### Ambientes

- Desarrollo local.
- QA en infraestructura institucional.
- Producción no se usa para ejecución de QA del Sprint 3.

QA refleja la separación por:

- VM de datos;
- VM de servicios;
- VM de borde;
- VM Tools compartida.

### Separación de la instancia de demostración

La suite automatizada modifica registros, por lo que:

- corre en Desarrollo o una base recién cargada;
- no altera la instancia que se muestra en el Review;
- las pruebas de carga se ejecutan en una pila de medición separada.

La ubicación de la instancia de demostración y de la pila de medición todavía no está definida en Infraestructura V2.1, que solo describe los ambientes QA y Producción; queda como pendiente de DevOps (H-18).

### Relación con la verificación E2E de Infraestructura

Infraestructura V2.1 (sección 27) define el script `pruebas/extremo_a_extremo.py` (unas 45 comprobaciones desde el borde, incluida la presencia de rate limit) como verificación de humo posterior a cada despliegue a QA. Ese script no sustituye los casos de este TD: TC-020 define el flujo del incremento por tramos y LT-06 mide el rate limit bajo carga. Como el script modifica datos de QA, sigue la misma regla que la suite automatizada: no se ejecuta sobre la instancia que se presenta en el Review.

### Conjunto sintético

Semilla: **302**.

Núcleo:

- cinco bancos y un servicio transfusional;
- cuentas institucionales U3-U7;
- 18 donantes;
- 13 campañas;
- 38 donaciones;
- 89 unidades;
- 361 eventos.

Reglas:

- origen ficticio visible;
- cero causa clínica;
- coherencia de referencias;
- reproducibilidad con misma semilla y ancla.

### Reloj

El proceso de vencimiento:

- evalúa en UTC;
- se ejecuta cada **5 minutos**;
- debe retirar unidades vencidas del inventario dentro del umbral de 15 minutos.

## 2.9 Protocolo de pruebas

1. Verificar criterios de entrada.
2. Desplegar el incremento.
3. Cargar el conjunto sintético.
4. Registrar commit y versión.
5. Ejecutar suite automatizada sobre base recién cargada.
6. Ejecutar casos manuales según ficha.
7. Comparar valor observado contra umbral.
8. Registrar evidencia.
9. Crear Issue de defecto cuando falle.
10. Reejecutar correcciones.
11. Emitir informe.

## 2.10 Criterios de entrada

Las pruebas pueden iniciar cuando:

- contratos OpenAPI estén publicados;
- contratos AsyncAPI requeridos estén disponibles;
- incremento esté desplegado;
- conjunto sintético esté cargado;
- llaves y secretos de prueba estén disponibles;
- Identidad tenga las operaciones necesarias;
- ciclo de vencimiento de 5 min coincida entre DD e Infraestructura;
- APISIX esté disponible;
- Kafka esté disponible para pruebas que dependan de eventos;
- validador / cliente de API esté aprobado como herramienta cuando corresponda.

## 2.11 Criterios de salida

Las pruebas finalizan cuando:

- se ejecutan todos los casos Críticos y Altos comprometidos;
- defectos críticos están resueltos o aceptados formalmente;
- evidencias están enlazadas;
- se emite el informe.

## 2.12 Gestión de defectos

| Severidad | Criterio |
|---|---|
| Crítica | Incumple escenario crítico, expone causa clínica o permite operación físicamente peligrosa |
| Alta | Incumple escenario de banda Alta o control de acceso |
| Media | Incumple banda Media/Baja con alternativa |
| Baja | Defecto cosmético o textual sin cambio de cumplimiento |

Cada defecto se registra como Issue enlazado al caso, escenario/requisito y evidencia.

## 2.13 Estados de caso

- No ejecutado
- Aprobado
- Fallido
- Bloqueado
- No evaluable
- No aplicable en Sprint 3

---

# 3. Diseño de pruebas

## 3.1 Criterio de diseño

Cada caso se traza a un escenario de calidad o RF. El criterio de aprobación proviene de la medida de respuesta correspondiente.

Los códigos HTTP, estados, persistencia y eventos esperados se contrastan con:

- SRS V4;
- DD V3;
- OpenAPI;
- AsyncAPI;
- SAD V3;
- implementación vigente.

Cuando dos fuentes divergen, no se ajusta el caso en silencio: se abre hallazgo.

## 3.2 Índice de casos

| Caso | EC / RF | Prioridad | Tipo | Camino |
|---|---|---|---|---|
| TC-001 | EC-01 | Alta | Seguridad | F N |
| TC-002 | EC-03 | Alta | Seguridad | F N B |
| TC-003 | EC-02 | Crítica | Seguridad | N |
| TC-004 | EC-04, EC-36 | Alta | Integridad | F N B |
| TC-005 | EC-12 | Crítica | Seguridad física | N B |
| TC-006 | EC-39 | Alta | Seguridad física | N |
| TC-007 | EC-13 | Alta | Funcional | F B |
| TC-008 | EC-33 | Alta | Auditoría | F N |
| TC-009 | EC-05 | Alta | Auditoría | F |
| TC-010 | EC-10 | Alta | Integridad | B |
| TC-011 | EC-08 / RNF-06 | Alta | Resiliencia / eventos | X |
| TC-012 | EC-22 | Media | Contrato | F N |
| TC-013 | EC-23 | Media | Instalabilidad | F |
| TC-014 | EC-19, EC-41 | Alta | Seguridad física | F N |
| TC-015 | EC-17 | Media | Interfaz | F |
| TC-016 | EC-28 | Media | Interfaz | F |
| TC-017 | EC-32 | Baja | Interfaz | F |
| TC-018 | EC-31 | Baja | Interfaz | N |
| TC-019 | EC-21 | Baja | Mantenibilidad | F |
| TC-020 | Flujo | Alta | Integración | F |
| TC-021 | HU-302 | Alta | Datos | F N |
| TC-022 | RF-08 | Alta | Funcional | F N |
| TC-023 | RF-02, RF-03, RF-05 | Alta | Funcional | N B |

---

## 3.3 Fichas de casos

### TC-001 — EC-01 — Control de acceso y jurisdicción

**Prioridad:** Alta  
**Tipo:** Seguridad  
**Caminos:** F, N

Objetivo:

- verificar matriz de autorización;
- rechazar perfiles sin permiso;
- ocultar recursos fuera de jurisdicción;
- registrar denegaciones.

Debe cubrir las combinaciones de la matriz normativa aplicables al incremento.

Resultados esperados:

- 2xx cuando corresponde;
- 403 para operación no permitida;
- 404 indistinguible para recurso fuera de alcance cuando la política lo exige;
- auditoría de la denegación.

---

### TC-002 — EC-03 — Autenticidad de sesión

**Prioridad:** Alta  
**Tipo:** Seguridad  
**Caminos:** F, N, B

Debe verificar:

- inicio de sesión válido;
- cuenta inactiva;
- correo inexistente;
- token alterado;
- token vencido;
- issuer/audience incorrectos;
- `kid` desconocido;
- límite temporal;
- renovación;
- revocación;
- cierre;
- comportamiento del gateway si JWKS no está disponible.

APISIX debe fallar cerrado ante token no verificable.

---

### TC-003 — EC-02 — Confidencialidad de causa clínica

**Prioridad:** Crítica  
**Tipo:** Seguridad  
**Camino:** N

Objetivo:

Comprobar que ningún dato de causa clínica existe en:

- modelo;
- contratos;
- respuestas;
- errores;
- logs;
- trazas;
- auditoría;
- eventos.

Pasos clave:

1. revisar el esquema físico vigente de Donación contra nombres prohibidos (mientras `db_donacion` no tenga migraciones centrales aprobadas, se toma el esquema que despliega el servicio y se registra su fuente; ver H-24);
2. revisar OpenAPI;
3. revisar eventos AsyncAPI aplicables;
4. registrar veredicto;
5. consultar unidad/historial;
6. provocar errores;
7. enviar propiedad clínica no permitida;
8. inspeccionar logs y eventos.

**Aprueba si:** cero campos clínicos prohibidos y cero exposición diagnóstica.

---

### TC-004 — EC-04 / EC-36 — Máquina de estados

**Prioridad:** Alta  
**Tipo:** Integridad  
**Caminos:** F, N, B

Verifica:

- transiciones válidas;
- transiciones prohibidas;
- alta;
- comportamiento de dominio sin BD;
- tiempo total de la suite.

**Aprueba si:** todas las transiciones coinciden con el catálogo y la suite cumple el umbral temporal.

---

### TC-005 — EC-12 — Bloqueo de unidad no apta o vencida

**Prioridad:** Crítica  
**Tipo:** Seguridad física  
**Caminos:** N, B

Debe comprobar:

- no aparece como disponible;
- no puede despacharse;
- estado indeterminado no cuenta;
- unidad reservada que vence no puede despacharse;
- solo se admiten transiciones válidas posteriores.

---

### TC-006 — EC-39 — Límite operativo de despacho

**Prioridad:** Alta  
**Tipo:** Seguridad física  
**Camino:** N

Objetivo:

Comprobar que una institución distinta de la custodia no puede despachar.

Resultados:

- 404 para recurso ajeno cuando aplica ocultamiento;
- 403 para perfil que puede ver pero no ejecutar;
- cero exposición de institución ajena;
- intento auditado.

Transferencias permanecen fuera del incremento si el contrato no las incluye.

---

### TC-007 — EC-13 — Vencimiento automático

**Prioridad:** Alta  
**Tipo:** Funcional  
**Caminos:** F, B

Dependencia:

- proceso cada 5 minutos;
- UTC;
- datos con ancla conocida.

Pasos:

1. consultar existencias;
2. esperar un ciclo;
3. verificar retiro;
4. repetir con vencimiento en ventana;
5. probar cerca del cambio de día UTC;
6. intentar operación prohibida después del vencimiento;
7. revisar evento/auditoría.

**Aprueba si:** 100 % de unidades vencidas salen de disponibles dentro de 15 min.

---

### TC-008 — EC-33 — Atribución de acciones automáticas

**Prioridad:** Alta  
**Tipo:** Auditoría  
**Caminos:** F, N

El proceso automático debe registrar:

- `actor_tipo = sistema`;
- actor técnico del proceso;
- correlación;
- cero atribuciones al usuario que tuviera sesión abierta.

---

### TC-009 — EC-05 — Reconstrucción de trazabilidad

**Prioridad:** Alta  
**Tipo:** Auditoría  
**Camino:** F

Objetivo:

Reconstruir cadena de una unidad usando su historial/eventos y auditoría.

**Aprueba si:** se reconstruye en menos de 5 minutos y la secuencia es coherente.

La consulta compuesta del auditor depende del Servicio Institucional; mientras no exista, se usa la ruta de unidad disponible en Donación.

---

### TC-010 — EC-10 — Registro de donación idempotente

**Prioridad:** Alta  
**Tipo:** Integridad  
**Camino:** B

Pasos:

1. contar donaciones/unidades;
2. registrar con `Idempotency-Key`;
3. reenviar 100 veces;
4. comparar respuestas;
5. contar nuevamente;
6. simular reenvío por corte de red.

**Aprueba si:** cero donaciones y unidades duplicadas.

---

### TC-011 — EC-08 / RNF-06 — Indisponibilidad de la plataforma de eventos

**Prioridad:** Alta  
**Tipo:** Resiliencia / integración asíncrona  
**Camino:** X

> **Corrección V1.0:** este caso ya no evalúa una llamada HTTP Donación → Campañas. La arquitectura vigente no usa esa llamada directa. Evalúa la tolerancia a la indisponibilidad temporal de Kafka y la consistencia del Transactional Outbox.

**Objetivo:** comprobar que una indisponibilidad temporal del broker no bloquea ni pierde una transacción local válida y que el evento pendiente se publica después de la recuperación.

**Precondiciones:**

- Donación desplegado;
- PostgreSQL disponible;
- Kafka disponible inicialmente;
- Outbox habilitado;
- posibilidad de detener/levantar Kafka sin reiniciar Donación.

**Pasos:**

1. confirmar estado saludable de Donación y Kafka.  
   **Esperado:** ambos disponibles.

2. detener Kafka.  
   **Esperado:** broker no disponible; Donación continúa respondiendo en operaciones que no necesitan consumir un resultado síncrono del broker.

3. ejecutar una operación válida de Donación que produzca un evento de dominio.  
   **Esperado:** la transacción local se confirma según el contrato y el evento queda registrado como pendiente en Outbox.

4. verificar persistencia local.  
   **Esperado:** el cambio de negocio existe una sola vez.

5. verificar Outbox.  
   **Esperado:** exactamente un evento pendiente; no se pierde ni se duplica.

6. ejecutar operaciones locales independientes.  
   **Esperado:** continúan funcionando dentro de sus criterios normales.

7. levantar Kafka.  
   **Esperado:** se recupera sin reiniciar los demás componentes.

8. esperar el mecanismo de reintento/publicación.  
   **Esperado:** el evento pendiente se publica.

9. verificar consumo/idempotencia cuando exista consumidor habilitado.  
   **Esperado:** un único efecto lógico aunque exista reintento.

10. verificar correlación.  
    **Esperado:** `correlation_id` se conserva entre transacción, Outbox y evento.

**Aprueba si:**

- cero transacciones locales válidas se pierden;
- cero eventos se pierden;
- cero efectos duplicados;
- las operaciones independientes siguen funcionando;
- el evento se publica tras recuperar Kafka;
- no se requiere reinicio manual de Donación.

> **Nota V1.1 (H-19):** la redacción de RNF-06 en el SRS V3 plantea el escenario con el trabajador de Notificaciones no disponible (el evento permanece en Kafka y se consume al restablecerse el trabajador). Esa variante no puede ejecutarse mientras Notificaciones esté pendiente; se planifica en el Sprint 4 (sección 6.3) y, hasta entonces, el estado de esa parte es **Bloqueado**.

---

### TC-012 — EC-22 — Evolución de contratos

**Prioridad:** Media  
**Tipo:** Contrato  
**Caminos:** F, N

Objetivo:

Verificar compatibilidad de contratos.

Parte HTTP:

1. validar respuestas contra OpenAPI;
2. añadir campo opcional;
3. consumidor continúa funcionando;
4. cambio incompatible exige versión mayor.

Parte eventos:

1. validar mensaje contra AsyncAPI / esquema vigente;
2. añadir campo opcional compatible;
3. consumidor tolera el cambio;
4. cambio incompatible exige nueva versión de evento o estrategia formal;
5. mensaje inválido no debe detener indefinidamente el flujo.

**Aprueba si:** cambios compatibles no rompen consumidores y cambios incompatibles se versionan.

---

### TC-013 — EC-23 — Instalabilidad

**Prioridad:** Media  
**Tipo:** Instalabilidad  
**Camino:** F

Objetivo:

Levantar el sistema siguiendo solo documentación.

Pasos:

1. clonar repositorios;
2. ejecutar comando/documento de arranque;
3. medir tiempo a health;
4. verificar migraciones;
5. verificar datos sintéticos.

**Aprueba si:** <=10 min, sin pasos manuales no documentados.

La cantidad exacta de contenedores/sondeos se toma de la composición real vigente, no de un número histórico del catálogo.

Mientras no exista un registro de imágenes (Infraestructura V2.1, RI-04), el arranque construye las imágenes localmente según Infraestructura V2.1, sección 10. Esa construcción local se reporta como desviación frente a la redacción de RNF-11 del SRS V3 («a partir de las imágenes publicadas») y se registra en H-20; no cambia la medida de EC-23.

---

### TC-014 — EC-19 / EC-41 — Acciones irreversibles

**Prioridad:** Alta  
**Tipo:** Seguridad física  
**Caminos:** F, N

Parte API:

- disposición final sin confirmación → rechazo;
- confirmación con ID incorrecto → rechazo;
- confirmación correcta → ejecución;
- repetir con despacho;
- validar estado permitido;
- revisar auditoría.

Parte UI:

se ejecuta cuando exista la pantalla correspondiente.

---

### TC-015 — EC-17 — Registro anónimo

**Estado Sprint 3:** diseñado; fuera del incremento si C-08 no está implementada.

Aprueba si:

- <=3 pasos;
- cero identificación obligatoria;
- 4 de 5 usuarios completan sin ayuda en <=2 min.

---

### TC-016 — EC-28 — Reconocimiento del propósito

**Estado Sprint 3:** diseñado; fuera del incremento si la pantalla no está disponible.

Aprueba si 4 de 5 personas identifican propósito y acción principal en <30 s.

---

### TC-017 — EC-32 — Legibilidad del estado

**Estado Sprint 3:** diseñado.

Aprueba si:

- cero códigos internos visibles;
- lenguaje natural;
- usuarios reconstruyen historial.

---

### TC-018 — EC-31 — Recuperación ante rechazo

**Estado Sprint 3:** diseñado.

Verifica rechazo por:

- regla de negocio;
- conflicto de estado;
- falta de alcance.

La exigencia de “nombrar la causa” no se aplica cuando la política de seguridad requiere un 404 indistinguible para no filtrar existencia.

---

### TC-019 — EC-21 — Modificabilidad

**Estado Sprint 3:** diseñado.

Cambiar la regla de elegibilidad debe afectar un punto acotado del dominio y no obligar a modificar otros servicios ni contratos.

---

### TC-020 — Flujo del incremento por gateway

**Prioridad:** Alta  
**Tipo:** Integración  
**Camino:** F

Ruta de acceso:

```text
Frontend / cliente
  -> Caddy
  -> APISIX
  -> servicio
```

Flujo por tramos:

**Tramo A**

1. iniciar sesión;
2. buscar donante;
3. registrar donación.

**Tramo B**

1. usar unidad sembrada en estado previo requerido;
2. ingresar a tamizaje;
3. registrar veredicto;
4. consultar inventario.

**Tramo C**

1. despachar unidad sembrada en estado requerido;
2. verificar auditoría.

Cuando una operación produzca evento:

- verificar Outbox;
- verificar publicación en Kafka si corresponde.

El Review debe declarar que el flujo está dividido en tramos mientras fraccionamiento/reserva no formen un recorrido completo desde una donación nueva.

El script `pruebas/extremo_a_extremo.py` de Infraestructura V2.1 no sustituye este caso (ver sección 2.8).

---

### TC-021 — Datos sintéticos coherentes

**Prioridad:** Alta  
**Tipo:** Datos  
**Caminos:** F, N

Verifica:

- carga con semilla 302;
- referencias coherentes;
- cero causa clínica;
- conteos;
- reproducibilidad;
- consistencia entre contextos mediante IDs lógicos, no mediante joins físicos entre bases.

**Aprueba si:** cero referencias incoherentes, cero datos prohibidos y reproducción idéntica con misma semilla/ancla.

---

### TC-022 — RF-08 — Campañas

**Prioridad:** Alta  
**Tipo:** Funcional  
**Caminos:** F, N

Verifica:

- listados públicos;
- visibilidad por jurisdicción;
- borradores no visibles públicamente;
- publicación;
- cierre;
- roles no autorizados;
- auditoría;
- publicación de eventos cuando corresponda.

---

### TC-023 — RF-02, RF-03, RF-05 — Donación por API

**Prioridad:** Alta  
**Tipo:** Funcional  
**Caminos:** N, B

Verifica:

- búsqueda de donante;
- elegibilidad;
- inexistencia;
- intención vencida;
- campaña inválida;
- transición inválida;
- errores sin filtración de documento o valores sensibles.

---

# 3.4 Rendimiento y volumen del Sprint 3

Sprint 3 mide dentro de casos funcionales:

| Métrica | Caso | Umbral |
|---|---|---|
| Suite de transiciones | TC-004 | <2 min |
| Vencimiento | TC-007 | <=15 min |
| Reenvíos | TC-010 | 100, cero duplicados |
| Recuperación de evento pendiente | TC-011 | sin pérdida; publicación posterior a recuperación |
| Reconstrucción | TC-009 | <5 min |
| Arranque | TC-013 | <=10 min |

# 3.5 Carga, sobrecarga y estrés

| Prueba | Escenario | Carga | Aprueba si |
|---|---|---|---|
| LT-01 | EC-15 | 20 usuarios inventario | p95 <=3 s; p99 <=5 s |
| LT-02 | EC-16 | 50 usuarios / 10 min | error <1 %, p95 <=3 s, recursos bajo límite |
| LT-03 | EC-26 | 50 usuarios / 30 min | estabilidad de memoria/CPU/conexiones |
| LT-04 | EC-37 | 200 usuarios / 5 min | rechazo ordenado y recuperación |
| LT-05 | EC-07 | contenedor caído | >=99 %, recuperación <=60 s |
| LT-06 | EC-06 | abuso automatizado | exceso rechazado con 429 |
| LT-07 | — | rampa hasta quiebre | caracteriza límite y recuperación |

Estas pruebas se ejecutan sobre una pila separada de la instancia de demostración.

---

# 4. Cobertura de pruebas

## 4.1 Cobertura por operación

### Identidad

| ID | Operación | Casos |
|---|---|---|
| ID-01 | `POST /v1/sesiones` | TC-002, TC-020 |
| ID-02 | `POST /v1/sesiones/renovacion` | TC-002 |
| ID-03 | `DELETE /v1/sesiones/actual` | TC-002 |
| ID-04 | `GET /.well-known/jwks.json` | TC-002 |

### Donación

| ID | Operación | Casos |
|---|---|---|
| DON-01 | búsqueda de donante | TC-023, TC-020, TC-001 |
| DON-02 | registrar donación | TC-020, TC-010, TC-011, TC-023 |
| DON-03 | ingreso a tamizaje | TC-020, TC-023, TC-001 |
| DON-04 | tamizaje | TC-020, TC-003, TC-023 |
| DON-05 | inventario | TC-020, TC-005, TC-007, TC-001, LT-01 |
| DON-06 | despacho | TC-020, TC-005, TC-006, TC-014 |
| DON-07 | disposición final | TC-014, TC-005 |
| DON-08 | eventos de unidad | TC-009, TC-008, TC-001 |

### Campañas

| ID | Operación | Casos |
|---|---|---|
| CAM-01 | listar campañas | TC-022 |
| CAM-02 | detalle | TC-022 |
| CAM-03 | publicación | TC-022 |
| CAM-04 | cierre | TC-022 |

**Cobertura:** las 16 operaciones tienen al menos un caso con camino feliz y negativo; 6 tienen además borde o fallo inducido.

## 4.2 Cobertura por requerimiento

La línea base del SRS V4 contiene 22 RF (el SRS V3 del 22/09/2026 tenía 23 y no incluía RF-25; ver H-16). El incremento del Sprint 3 implementa 10 y los 10 disponen de caso.

| RF | Requerimiento | Estado Sprint 3 | Casos |
|---|---|---|---|
| RF-01 | Registro voluntario | fuera / opcional | TC-015 diseñado |
| RF-02 | Elegibilidad | parcial | TC-023 |
| RF-03 | Registro de donación | sí | TC-010, TC-011, TC-020, TC-023 |
| RF-04 | Trazabilidad | sí | TC-009 |
| RF-05 | Unidad no apta | sí | TC-003, TC-020, TC-023 |
| RF-06 | Disposición final | sí | TC-005, TC-014 |
| RF-07 | Existencias | sí | TC-005, TC-020, LT-01 |
| RF-08 | Campañas | sí | TC-022 |
| RF-09 | Jerarquía territorial | no | — |
| RF-10 | Transferencias | no | — |
| RF-11 | Reconocimiento no monetario | no | — |
| RF-12 | Notificación | no | pruebas cuando el consumidor esté implementado |
| RF-13 | Indicadores | no | — |
| RF-17 | Historial propio | no | — |
| RF-18 | Exclusión vencidas | sí | TC-007, TC-008 |
| RF-19 | Alerta escasez | no | — |
| RF-20 | Alerta vencimiento | no | — |
| RF-21 | Bitácora compuesta | no | — |
| RF-22 | Jurisdicción | no / parcial por contexto (la asignación pertenece a Identidad; ver H-21) | — |
| RF-23 | Inicio de sesión | sí | TC-002, TC-020 |
| RF-24 | Término de sesión | sí | TC-002 |
| RF-25 | Seguimiento campaña | pendiente | futura |

Nota: RF-14 y RF-15 figuran en el SRS V3 (prioridad Could, fuera de la V1) y no en esta tabla; el esquema `reserva_cupo` que soporta RF-15 ya existe en `db_campana` (DD V3.1, sección 10.2) sin operación expuesta en el incremento (H-22).

## 4.3 RNF

| RNF | Característica | Verificación |
|---|---|---|
| RNF-01 | Confidencialidad | TC-003, incluidos eventos vigentes |
| RNF-02 | Control de acceso | TC-001 |
| RNF-03 | Operabilidad | TC-015 diseñado |
| RNF-04 | Temporal | LT-01 |
| RNF-05 | Adaptabilidad | inspección / diseño |
| RNF-06 | Tolerancia a fallos de plataforma de eventos | **TC-011** (variante de consumidor detenido: bloqueada, H-19) |
| RNF-07 | Interoperabilidad | TC-012 verifica compatibilidad de contratos HTTP y de eventos; el punto de integración con SIHEVI-INS no tiene componente asignado y queda sin caso (H-23) |
| RNF-08 | Corrección funcional | TC-007 (medida EC-13: <= 15 min; la lectura inmediata del SRS V3 queda en H-17) |
| RNF-09 | Responsabilidad | TC-001, TC-008, TC-009 |
| RNF-10 | Inclusividad | instrumentos frontend |
| RNF-11 | Instalabilidad | TC-013 (con desviación por construcción local de imágenes, H-20) |

## 4.4 Cobertura por escenario de calidad

| EC | Caso | Cobertura |
|---|---|---|
| EC-01 | TC-001 | cubierto para perfiles/servicios disponibles |
| EC-02 | TC-003 | cubierto |
| EC-03 | TC-002 | cubierto sujeto a evidencias de llaves |
| EC-04 | TC-004 | cubierto |
| EC-05 | TC-009 | cubierto por ruta de unidad |
| EC-10 | TC-010 | cubierto |
| EC-12 | TC-005 | cubierto en despacho |
| EC-13 | TC-007 | cubierto |
| EC-17 | TC-015 | diseñado, fuera si UI no disponible |
| EC-19 | TC-014 | API cubierta; UI según disponibilidad |
| EC-21 | TC-019 | diseñado |
| EC-28 | TC-016 | diseñado |
| EC-31 | TC-018 | diseñado |
| EC-32 | TC-017 | diseñado |
| EC-33 | TC-008 | cubierto |
| EC-39 | TC-006 | cubierto con condición de ocultamiento |
| EC-41 | TC-014 | UI pendiente |
| EC-08 | TC-011 | **reformulado para plataforma de eventos** |
| EC-22 | TC-012 | contratos HTTP + eventos aplicables |
| EC-23 | TC-013 | instalabilidad |
| EC-36 | TC-004 | cubierto |

## 4.5 Lectura de la cobertura

De los 17 escenarios asignados originalmente al Sprint 3:

- 10 quedan cubiertos;
- 1 parcial;
- 6 no tienen implementación completa para ejecutar.

El incremento implementa 10 de 22 RF de la línea base y esos 10 tienen caso diseñado.

La cifra debe presentarse de manera explícita: se prueba el incremento disponible, no todo el sistema objetivo.

---

# 5. Reporte de pruebas

## 5.1 Regla de estado

| Estado | Regla |
|---|---|
| Aprobado | todas las condiciones se cumplen |
| Fallido | al menos una condición no se cumple |
| Bloqueado | no pudo ejecutarse por dependencia |
| No ejecutado | aún no intentado |
| No evaluable | definición/contrato impide verificar |
| No aplicable | depende de algo no incluido |

Un caso nunca se oculta por estar fallido o bloqueado.

## 5.2 Registro mínimo

Cada resultado debe almacenar:

- caso;
- EC/RF;
- commit;
- versión del conjunto sintético;
- ancla;
- ambiente;
- fecha;
- ejecutor;
- estado;
- valor observado;
- valor esperado;
- caminos ejecutados;
- evidencia;
- defecto asociado;
- severidad.

## 5.3 Resumen de Sprint 3

**Pendiente de ejecución/consolidación.**

| Indicador | Resultado |
|---|---|
| Casos diseñados | 23 |
| Casos comprometidos para Sprint 3 | 18 |
| Carga/estrés diseñadas | 7 |
| Casos ejecutados | Pendiente |
| Aprobados | Pendiente |
| Fallidos | Pendiente |
| Bloqueados | Pendiente |
| No evaluables | Pendiente |
| Defectos críticos abiertos | Pendiente |
| Operaciones con caso aprobado | Pendiente de 16 |
| Recomendación | Pendiente |

---

# 6. Plan de pruebas del Sprint 4 — borrador

El plan definitivo depende del Backlog V4.

## 6.1 Carga y estrés

Ejecutar LT-01 a LT-07 con Gatling, Prometheus y Grafana.

## 6.2 Regresión de APISIX

APISIX **ya es el gateway vigente**. Sprint 4 debe realizar regresión ampliada, no una “migración futura”:

- TC-001 completo;
- TC-002 completo;
- matriz de autorización;
- casos de prueba de concepto relevantes;
- rate limiting;
- rutas internas;
- correlación;
- recuperación ante JWKS no disponible.

## 6.3 Plataforma de eventos

Kafka **ya forma parte de la arquitectura vigente**. Sprint 4 amplía la cobertura:

- atomicidad de Outbox;
- broker detenido;
- consumidor detenido y recuperación (variante literal de RNF-06; H-19);
- consumo duplicado;
- mensaje incompatible;
- canal externo caído;
- ACL;
- contenido del evento;
- correlación;
- recuperación;
- dead-letter / estrategia equivalente si está implementada.

## 6.4 RF-25

Conteo/seguimiento de donaciones por campaña a partir del evento correspondiente, sin datos personales innecesarios.

## 6.5 Arrastre

Reejecutar:

- fallidos;
- bloqueados;
- casos afectados por defectos;
- regresiones arquitectónicas.

---

# 7. Riesgos, dependencias y hallazgos

## 7.1 Riesgos y dependencias

| Elemento | Impacto | Mitigación | Responsable |
|---|---|---|---|
| Llave de prueba / configuración de QA incompleta | Alto | cerrar antes de seguridad/auth | Sebastián / QA |
| Auditoría de Identidad sin evidencia completa | Alto | ejecutar antes de cierre | Sebastián |
| Despliegue del incremento | Alto | seguimiento diario | Veli |
| Capacidad del equipo | Alto | Críticos y Altos primero | Carlos |
| Escenarios sin implementación | Alto | declarar o diferir formalmente | Alex |
| Fraccionamiento/reserva fuera del flujo | Alto | declarar flujo por tramos | Alex |
| U5/U6 dependen de Institucional | Medio | limitar alcance del informe | Tomás |
| Esquemas Donación/Institucional aún no consolidados en repo central de DB | Medio | no inventar validación física | Sara / responsables de datos |
| Resultados QA aún pendientes | Alto | no afirmar aprobación | Tomás |
| Kafka como dependencia central de integración | Alto | TC-011 + observabilidad + recuperación | Veli / desarrollo |
| APISIX como punto de entrada | Alto | TC-001/002 + health/routing | Veli |
| Instancia de demostración y pila de medición sin ambiente definido en Infraestructura | Alto | fecha explícita de DevOps o diferir la carga al Sprint 4 (H-18) | Veli |
| Conflictos entre el SRS V3 y la arquitectura vigente sin decisión (H-16, H-17, H-21) | Medio | decisión de Arquitectura y Producto; no ajustar casos en silencio | Sara / Alex |

## 7.2 Hallazgos vigentes

### H-01 — flujo E2E por tramos

Una donación nueva no recorre todos los estados hasta despacho porque fraccionamiento/reserva no están completos.

**Acción:** TC-020 se mantiene por tramos y se declara en Review.

### H-02 — conteo de idempotencia

El inventario no sirve para detectar duplicación de unidades recién captadas.

**Acción:** TC-010 cuenta donaciones y unidades.

### H-03 — tamizaje sin observación clínica

El contrato no admite observación clínica en tamizaje.

**Acción:** TC-003 exige rechazo de campo adicional.

### H-04 — ocultamiento vs explicación del rechazo

Para recursos fuera de alcance, seguridad exige 404 indistinguible, lo que puede impedir “nombrar la causa”.

**Acción:** excepción explícita en la medida.

### H-05 — instancia del Review

La suite no corre sobre la instancia que se presenta.

**Acción:** base recién cargada.

**Pendiente V1.1:** ubicar esa instancia en Infraestructura (H-18).

### H-06 — RESUELTO EN V1.0 — gateway

El borrador 0.3 trataba YARP como gateway de Sprint 3 y APISIX como futuro.

**Corrección:** APISIX es el gateway vigente. Toda prueba de gateway se diseña/ejecuta sobre APISIX.

### H-07 — RESUELTO EN V1.0 — RNF-06 / plataforma de eventos

El borrador 0.3 mantenía TC-011 como fallo de una llamada directa a Campañas.

**Corrección:** RNF-06 y TC-011 verifican indisponibilidad de Kafka y comportamiento del Outbox. Se elimina la dependencia HTTP Donación → Campañas del caso.

### H-08 — acciones irreversibles

El conjunto incluye despacho, disposición final y, cuando exista, decisión de transferencia.

### H-09 — auditoría compuesta

La vista compuesta pertenece a Institucional y no está disponible.

**Acción:** EC-05 se mide con ruta de unidad en el incremento.

### H-10 — validador de respuestas / cliente API

Debe existir herramienta aprobada para validación contractual automatizada.

### H-11 — U5/U6 sin Institucional completo

La vista territorial no puede verificarse completamente.

**Acción:** limitar alcance.

### H-12 — EC-31 vs ocultamiento

Un 404 indistinguible no puede explicar que el recurso está fuera de jurisdicción.

**Acción:** excepción explícita.

### H-13 — aprobación documental

Se unifica la cadena de revisión y aprobación en la tabla de control.

### H-14 — NUEVO — contratos de eventos

Al incorporar Kafka como arquitectura vigente, QA debe validar no solo OpenAPI sino también AsyncAPI/esquemas de eventos en las interacciones asíncronas.

**Acción:** incorporar esta validación en TC-012 y regresión de Sprint 4.

### H-15 — NUEVO — consistencia documental

SAD V3, SDD V2, Infraestructura V2 y este TD deben usar la misma línea:

```text
Caddy -> APISIX -> servicios
servicios <-> Kafka por eventos
servicio -> su base
```

**Acción:** cualquier referencia a YARP vigente, Kafka futuro o HTTP directo entre microservicios debe considerarse histórica y corregirse.

**Estado V1.1:** corregido en SAD V3.1 y SDD V2.1 (vistas C4 redibujadas como fuente Mermaid: sin YARP, sin consulta HTTP Donación → Campañas, con Kafka y Kafbat en el despliegue). Los PNG anteriores deben sustituirse en el repositorio.

### H-16 — NUEVO — línea base documental (SRS V3 frente a SRS V4)

El SRS V3.0 (22/09/2026) tiene 23 RF, no incluye RF-25 y cita ADR-014 para la descomposición en cinco servicios. El SAD V3 cita ADR-017 para esa decisión y este TD toma como línea base 22 RF (SRS V4).

**Acción:** archivar el SRS V3 como histórico, contrastar contra el SRS V4 los ajustes propuestos en `SRS_V3_ajustes_propuestos.md` y conciliar la numeración de ADR (SAD V3.1, sección 10.4).

### H-17 — NUEVO — RNF-08 frente a EC-13

El SRS V3 (RNF-08) exige que ninguna unidad vencida figure como disponible en una consulta posterior a su fecha de vencimiento. EC-13 y el diseño (proceso cada 5 minutos, UTC) admiten hasta 15 minutos.

**Acción:** TC-007 aplica la medida de EC-13 (Regla 1). Arquitectura y Producto deciden si la consulta de inventario filtra además por fecha de vencimiento en el momento de la consulta (cumpliría RNF-08 literal) o si RNF-08 se alinea con EC-13. Hasta la decisión, la lectura inmediata se reporta como **No evaluable**.

### H-18 — NUEVO — instancia de demostración y pila de medición

La sección 2.8 y la aprobación de DevOps presuponen una instancia de demostración y una pila de medición separadas. Infraestructura V2.1 solo describe QA y Producción, y Producción no usa las semillas de QA aunque el SRS exige datos exclusivamente sintéticos.

**Acción:** DevOps define ambiente y fecha, o se difiere la campaña de carga al Sprint 4 (pendientes de Infraestructura V2.1).

### H-19 — NUEVO — RNF-06 con consumidor detenido

La redacción de RNF-06 en el SRS V3 supone el trabajador de Notificaciones no disponible; TC-011 verifica la indisponibilidad de Kafka.

**Acción:** la variante de consumidor detenido queda **Bloqueada** hasta que exista Notificaciones y se planifica en la sección 6.3.

### H-20 — NUEVO — RNF-11 sin registro de imágenes

RNF-11 (SRS V3) exige desplegar a partir de imágenes publicadas; Infraestructura V2.1 declara el registro de imágenes como pendiente y usa construcción local.

**Acción:** TC-013 se ejecuta con construcción local y reporta la desviación; Arquitectura y Producto deciden si RNF-11 se mantiene o si se incorpora el registro.

### H-21 — NUEVO — RF-22 y alcance de Institucional

El SRS V3 asigna RF-22 al módulo M6 / Servicio Institucional y le suma M7 y la consulta compuesta de auditoría. DD V3.1, SAD V3.1 y SDD V2.1 ubican la asignación de jurisdicción en Identidad (`usuario_jurisdiccion`) y describen la consulta compuesta y la analítica de Institucional como previstas y pendientes.

**Acción:** por el Anexo B (el DD define propiedad de datos), la verificación de RF-22 se orienta a Identidad; confirmar la asignación en el SRS V4.

### H-22 — NUEVO — RF-15 sin caso

El SRS V3 clasifica RF-15 (reserva de cupo) como Could fuera de la V1. El DD ya implementa `reserva_cupo` y SAD y SDD lo incluyen entre las responsabilidades de Campañas. Este TD no lo lista.

**Acción:** confirmar en el SRS V4 si RF-15 forma parte de la línea base; si es así, agregar el caso.

### H-23 — NUEVO — RNF-07 y SIHEVI-INS

RNF-07 exige un punto de integración documentado con SIHEVI-INS. Ningún servicio lo tiene asignado (SAD V3.1, sección 38) y TC-012 no lo cubre.

**Acción:** asignar el punto de integración y definir su caso; hasta entonces RNF-07 se reporta sin cobertura.

### H-24 — NUEVO — esquema físico de Donación

Donación figura como implementada (SAD, DD sección 7.4), pero `db_donacion` no tiene migraciones aprobadas en el repositorio `databases` (DD, Infraestructura). TC-003 y TC-021 necesitan un esquema de referencia.

**Acción:** documentar la fuente del esquema que se prueba y repetir la revisión cuando se publiquen las migraciones. No se inventan nombres físicos.

### H-25 — NUEVO — ubicación de la matriz de autorización

El SRS V3 (sección 4) sitúa la matriz normativa de autorización en «el DD» (en su historial de cambios: «Documento de Diseño»). El DD V3 (Data Design Document) no la contiene y el SAD la atribuye a ADR-011. TC-001 y la regresión de APISIX (sección 6.2) usan esa matriz.

**Acción:** TC-001 toma la matriz de ADR-011; confirmar su ubicación y corregir la referencia del SRS.

---

# 8. Revisión y aprobación

| Actividad | Persona | Fecha | Resultado |
|---|---|---|---|
| Revisión técnica | Sara, Tomás | Pendiente | Pendiente |
| Revisión del plan | Carlos Santiago Pinzón | Pendiente | Pendiente |
| Aprobación final | Alexander Aponte | Pendiente | Pendiente |

---

# Anexo A. Correspondencia con el borrador 0.3

| Elemento del 0.3 | Tratamiento en V1.0 |
|---|---|
| Propósito y metodología | Conservados |
| 23 casos / 18 Sprint 3 | Conservados |
| 7 pruebas LT | Conservadas |
| Clases F/N/B/X | Conservadas |
| Métricas | Conservadas; EC-08 actualizado a plataforma de eventos |
| Casos TC-001 a TC-010 | Conservados |
| TC-011 | Corregido: Kafka/Outbox en lugar de HTTP a Campañas |
| TC-012 | Ampliado a contratos de eventos vigentes |
| TC-013 a TC-023 | Conservados en intención |
| Cobertura 16 operaciones | Conservada |
| Cobertura 10/22 RF | Conservada |
| Resultados | Continúan pendientes |
| YARP Sprint 3 | Eliminado como arquitectura vigente |
| APISIX Sprint 4 | Corregido: APISIX vigente; Sprint 4 hace regresión ampliada |
| Kafka Sprint 4 | Corregido: Kafka vigente; Sprint 4 amplía cobertura |
| Ciclo vencimiento pendiente en Infra V2 | Resuelto en Infraestructura V2.1 y DD V3.1 (la V1.0 lo daba por resuelto sin que figurara en esos documentos) |
| H-06 | Resuelto |
| H-07 | Resuelto arquitectónicamente |
| H-14/H-15 | Añadidos para eventos y consistencia documental; H-15 resuelto en V1.1 |
| H-16 a H-25 | Añadidos en V1.1 por conflictos entre fuentes que requieren decisión |

---

# Anexo B. Regla de precedencia para pruebas

Cuando exista contradicción entre un borrador histórico y la arquitectura vigente:

1. SRS vigente define comportamiento esperado funcional.
2. SAD/ADR vigente define arquitectura y restricciones estructurales.
3. DD vigente define datos y ownership.
4. OpenAPI/AsyncAPI vigentes definen contratos.
5. SDD e Infraestructura materializan diseño y despliegue.
6. El TD se ajusta a esas fuentes sin cambiar silenciosamente las medidas de calidad.

---

# Anexo C. Resumen de la arquitectura que QA debe asumir

```text
Usuario
  |
  v
Frontend
  |
  v
Caddy
  |
  v
Apache APISIX
  |
  v
Servicio propietario
  |
  +----> su PostgreSQL
  |
  +----> Transactional Outbox
             |
             v
            Kafka
             |
             v
      consumidor autorizado
```

No se considera arquitectura vigente:

```text
YARP como gateway principal
Servicio A -> Servicio B por HTTP directo de negocio
Servicio A -> base de Servicio B
Kafka como tecnología exclusivamente futura
```

---

Este documento describe pruebas de un sistema académico que opera exclusivamente sobre datos sintéticos. Los resultados deben sustentarse con evidencia del commit, ambiente y conjunto probado.
