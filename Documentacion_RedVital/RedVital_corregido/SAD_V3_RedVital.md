---
title: "Documento de Arquitectura de Software (SAD) - RedVital"
subtitle: "Version 3.1 - Sprint 3 / Semana 10"
author: "Arkhé Software S.A.S."
date: "17 de octubre de 2026"
lang: es
---

# Datos del documento

| Campo | Valor |
|---|---|
| Plataforma | RedVital - Plataforma Nacional para la Gestión Integral del Ciclo de Vida de la Donación de Sangre |
| Equipo | Arkhé Software S.A.S. - «De la raíz a la red» |
| Curso | Arquitectura de Software Empresarial |
| Cliente | Profesor de la asignatura, en el rol simulado de Ministerio de Salud y Protección Social |
| Entrega | Review Sprint 3 y Planning Sprint 4 - Semana 10 |
| Versión | 3.1 |
| Estado | Para entrega |
| Fecha | 17 de octubre de 2026 |
| Clasificación | Uso interno del proyecto |
| Institución | Pontificia Universidad Javeriana - Bogotá, Colombia |

# Control de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | 01/09/2026 | Versión inicial con drivers, killers, atributos de calidad, escenarios, arquitectura de alto nivel, negocio, datos e infraestructura. |
| 2.0 | 22/09/2026 | Consolidación de cinco servicios, separación de persistencia, seguridad, ambientes, observabilidad y decisiones arquitectónicas del Sprint 2. |
| 3.0 | 07/10/2026 | Alineación con Sprint 3: microservicios, Caddy, Apache APISIX, Kafka + Transactional Outbox, cuatro bases PostgreSQL independientes, topología de siete VMs, vistas C4 vigentes, estado real de implementación y relación con DD V3, SDD V2 e Infraestructura V2. |
| 3.1 | 17/10/2026 | Corrección de consistencia con SDD V2.1, DD V3.1, Infraestructura V2.1 y TD V1.1: figuras C4 redibujadas como fuente Mermaid (APISIX, sin HTTP Donación-Campañas, Outbox, Kafka y Kafbat en el despliegue), portada, EC-19, vocabulario de estado, rutas, responsabilidades de servicios y deuda arquitectónica ampliada. |

# Control de cambios de V3

La versión 3.0 conserva los fundamentos arquitectónicos del documento anterior, pero corrige y actualiza aquellos elementos que quedaron inconsistentes con las decisiones e implementación del Sprint 3.

Cambios principales:

- Apache APISIX reemplaza a YARP como API Gateway vigente.
- Caddy permanece como proxy de borde.
- La arquitectura mantiene cinco microservicios de grano grueso: Identidad, Institucional, Campañas, Donación y Notificaciones.
- La comunicación interservicio de negocio se modela como asíncrona mediante Apache Kafka.
- Se incorpora Transactional Outbox como táctica de consistencia entre persistencia local y publicación de eventos.
- Se elimina del modelo vigente la dependencia HTTP directa entre microservicios de negocio.
- Se reafirma database per service.
- Se mantienen cuatro bases PostgreSQL: `db_identidad`, `db_institucional`, `db_campana` y `db_donacion`.
- Notificaciones no utiliza base de negocio propia.
- La infraestructura se alinea con siete máquinas virtuales: una Tools, tres QA y tres Producción.
- Las vistas C4 se referencian desde el repositorio de documentación.
- Se distingue arquitectura objetivo de implementación realmente disponible.
- No se declaran resultados consolidados de QA mientras el reporte continúe pendiente.

# Control de cambios de V3.1

La versión 3.1 corrige discrepancias entre el SAD y los demás documentos (SDD, DD, Infraestructura, TD y SRS):

- Las figuras C4 (contexto, contenedores, componentes y despliegue) se redibujan como fuente Mermaid (RD-04) y se exportan a PNG. El gateway figura como Apache APISIX (ya no YARP); se elimina el adaptador HTTP Donación → Campañas (Donación mantiene una proyección local alimentada por eventos); el Outbox es visible en Donación y Campañas; el despliegue muestra Kafka y Kafbat; Institucional y Notificaciones figuran como pendientes; la aplicación web es una SPA única y «Ciudadanía» se integra en U1; SIHEVI-INS aparece como sistema externo.
- Se alinean la portada (curso y cliente), la clasificación de EC-19 (seguridad física, como en el TD), el vocabulario de estado de implementación (Infraestructura V2.1) y la ruta de testing.
- Se completan las responsabilidades de Identidad (asignación de jurisdicción, RF-22), Donación (proyección de campañas y proceso de vencimiento cada 5 minutos) e Institucional (consulta compuesta y analítica previstas) y se declaran las tecnologías previstas de los servicios pendientes.
- Se actualiza la sección 35.7: el TD V1.1 ya corrigió sus referencias históricas a YARP y a HTTP directo.
- Se registran como deuda: numeración de ADR frente al SRS, punto de integración SIHEVI-INS, deduplicación y datos de contacto de Notificaciones, mecanismo de datos de Institucional, ubicación de la matriz de autorización y esquema físico de Donación.

# 1. Introducción

## 1.1 Propósito

Este documento describe la arquitectura de RedVital, las fuerzas que la condicionan, las decisiones estructurales adoptadas y la manera en que esas decisiones permiten cumplir los requisitos funcionales, atributos de calidad y restricciones del proyecto.

El SAD define principalmente:

- fronteras arquitectónicas;
- responsabilidades de los servicios;
- propiedad de datos;
- mecanismos de comunicación;
- tácticas arquitectónicas;
- restricciones;
- infraestructura de alto nivel;
- riesgos;
- trazabilidad entre requisitos, decisiones, componentes y verificación.

El SAD no reemplaza los documentos especializados de diseño, datos, infraestructura, integración ni pruebas.

## 1.2 Alcance

El SAD V3 cubre:

1. contexto arquitectónico;
2. drivers;
3. killers;
4. atributos de calidad;
5. escenarios;
6. trade-offs;
7. tácticas;
8. ADRs;
9. arquitectura de alto nivel;
10. arquitectura lógica;
11. arquitectura de negocio;
12. arquitectura de datos;
13. integración;
14. seguridad;
15. observabilidad;
16. infraestructura de alto nivel;
17. vistas C4 de referencia;
18. implementación actual;
19. QA desde la perspectiva arquitectónica;
20. riesgos;
21. deuda;
22. trazabilidad;
23. gobierno y evolución.

## 1.3 Relación con otros artefactos

| Artefacto | Relación con el SAD |
|---|---|
| SRS V4 | Fuente de usuarios, módulos, requisitos y restricciones. |
| ADRs | Registro formal de decisiones arquitectónicas. |
| Quality Attributes | Catálogo detallado de escenarios verificables. |
| SDD V2 | Materializa el diseño de la solución y contiene C4. |
| DD V3 | Desarrolla modelo lógico, físico, metadata y diccionario (Data Design Document; no contiene la matriz de autorización). |
| Infraestructura V2 | Materializa VMs, redes, puertos, contenedores, firewall, observabilidad, backup y despliegue. |
| OpenAPI | Contratos HTTP. |
| AsyncAPI | Contratos de eventos. |
| Testing | Estrategia, diseño, ejecución y reporte de pruebas. |
| Backlog V4 | Historias y tareas que implementan arquitectura y tácticas. |

# 2. Contexto arquitectónico

RedVital es una plataforma nacional académica orientada a soportar procesos relacionados con gestión de donantes, campañas, ciclo de vida de unidades, inventario, administración institucional, trazabilidad y notificaciones.

La arquitectura debe responder simultáneamente a:

- separación de responsabilidades;
- seguridad de datos;
- jurisdicción;
- auditabilidad;
- evolución independiente;
- despliegue reproducible;
- integración desacoplada;
- observabilidad;
- restricciones del entorno académico.

Sistema externo: SIHEVI-INS (reporte de donaciones y eventos adversos al Instituto Nacional de Salud). El SRS (RNF-07) exige un punto de integración documentado; el reporte efectivo no se ejecuta en la V1 y el punto de integración aún no tiene un componente asignado (sección 38).

# 3. Drivers arquitectónicos

## 3.1 Control de acceso

La arquitectura debe soportar:

- autenticación;
- rol;
- jurisdicción;
- autorización por operación;
- rechazo consistente;
- auditoría de denegaciones.

Este driver afecta Identidad, gateway, servicios y trazabilidad.

## 3.2 Aislamiento de datos

Cada servicio persistente administra sus propios datos.

No se permite:

- acceso SQL cruzado;
- base compartida como mecanismo de integración;
- credenciales reutilizadas;
- FK físicas entre bases de servicios distintos.

## 3.3 Trazabilidad

El sistema debe permitir reconstruir operaciones sensibles sin registrar información clínica prohibida.

Se requiere:

- actor;
- operación;
- recurso;
- resultado;
- correlación;
- tiempo.

## 3.4 Evolución independiente

Los servicios deben poder cambiar sin obligar a recompilar o desplegar otros servicios de forma innecesaria.

Esto exige:

- contratos explícitos;
- versionado;
- datos privados;
- integración desacoplada;
- límites claros.

## 3.5 Despliegue reproducible

Los ambientes deben levantarse con composiciones declarativas, configuración externa y secretos fuera del código.

## 3.6 Observabilidad

La arquitectura debe producir evidencia para:

- disponibilidad;
- latencia;
- fallos;
- correlación;
- estado de servicios;
- estado de Kafka;
- salud de bases.

## 3.7 Protección de información

Los datos clínicos fuera del alcance funcional no deben capturarse, persistirse, enviarse ni registrarse.

# 4. Killers arquitectónicos

Se consideran condiciones capaces de invalidar la arquitectura:

1. base de datos compartida entre servicios;
2. acceso directo de un servicio a tablas de otro;
3. comunicación directa interservicio que rompa la estrategia vigente de desacoplamiento;
4. secretos en Git;
5. contraseñas en claro;
6. frontend como única frontera de autorización;
7. rutas internas expuestas al exterior;
8. pérdida de trazabilidad;
9. captura de datos clínicos prohibidos;
10. dependencia estructural de una tecnología no aprobada;
11. despliegue que mezcle QA y Producción;
12. ausencia de mecanismo de consistencia entre cambio local y publicación de evento.

# 5. Atributos de calidad

RedVital prioriza:

- seguridad;
- fiabilidad;
- adecuación funcional;
- eficiencia de desempeño;
- capacidad de interacción;
- mantenibilidad;
- flexibilidad;
- compatibilidad;
- seguridad física.

El catálogo especializado mantiene el detalle de escenarios.

# 6. Escenarios de calidad

Los escenarios de calidad siguen la estructura:

- fuente;
- estímulo;
- contexto;
- artefacto;
- respuesta;
- medida.

Para Sprint 3 destacan:

| Escenario | Atributo | Medida / intención | Táctica |
|---|---|---|---|
| EC-01 | Seguridad | rechazar accesos fuera de jurisdicción | APISIX + validación de servicio |
| EC-02 | Confidencialidad | no exponer causa clínica | minimización de datos |
| EC-03 | Autenticidad | sesión válida y verificable | RS256 + JWKS |
| EC-04 | Integridad | transiciones válidas | reglas de dominio |
| EC-05 | Auditoría | operación sensible trazable | append-only + correlación |
| EC-10 | Fiabilidad | evitar duplicación | idempotencia |
| EC-12 | Seguridad física | bloquear unidad no apta/vencida | invariantes de dominio |
| EC-13 | Adecuación | exclusión automática (15 min o menos; proceso cada 5 min) | proceso de dominio |
| EC-17 | Interacción | registro anónimo en tres pasos | diseño UI |
| EC-19 | Seguridad física | proteger acción irreversible | confirmación explícita |

La clasificación de EC-19 sigue la del Documento de Pruebas (TD, sección 2.6); debe confirmarse contra el catálogo Quality Attributes.

Escenarios de desempeño, observabilidad, carga y recuperación continúan verificándose en sprints posteriores según el plan.

# 7. Precedencia entre atributos

Cuando existe conflicto:

1. seguridad física;
2. seguridad y cumplimiento;
3. fiabilidad;
4. desempeño;
5. facilidad de uso;
6. conveniencia operativa.

Una optimización de rendimiento o UX no justifica romper seguridad, jurisdicción o integridad.

# 8. Trade-offs

## 8.1 Seguridad vs complejidad

Se acepta validación en gateway y servicio.

**Ventaja:**

- defensa en profundidad.

**Costo:**

- más lógica y pruebas.

## 8.2 Independencia vs complejidad operativa

Microservicios permiten independencia y aislamiento.

**Costo:**

- más despliegues;
- más contratos;
- más monitoreo.

## 8.3 Separación de datos vs facilidad de consulta

No se realizan joins entre dominios.

**Ventaja:**

- independencia y seguridad.

**Costo:**

- proyecciones locales y consistencia eventual.

## 8.4 Asincronía vs consistencia inmediata

Kafka desacopla productores y consumidores.

**Costo:**

- idempotencia;
- reintentos;
- observabilidad;
- orden/eventualidad.

## 8.5 Gateway central vs punto de concentración

APISIX reduce duplicación de políticas.

**Costo:**

- componente crítico de entrada.

## 8.6 Siete VMs vs simplicidad

La separación mejora aislamiento de ambientes y responsabilidades.

**Costo:**

- operación más compleja.

# 9. Tácticas arquitectónicas

## 9.1 Seguridad

- Caddy para TLS y controles de borde.
- APISIX como punto único de entrada a la API.
- tokens RS256;
- JWKS;
- autorización por rol y ruta;
- jurisdicción;
- rutas internas bloqueadas;
- mínimo privilegio;
- secretos externos;
- rate limiting;
- auditoría.

## 9.2 Fiabilidad

- aislamiento de servicios;
- Kafka;
- Outbox;
- consumidores idempotentes;
- reintentos controlados;
- health checks;
- degradación explícita.

## 9.3 Mantenibilidad

- límites de dominio;
- contratos versionados;
- ADRs;
- documentación viva;
- separación SAD/SDD/DD/Infraestructura;
- migraciones versionadas.

## 9.4 Observabilidad

- correlación;
- logs estructurados;
- métricas;
- Prometheus;
- Grafana;
- Kafbat;
- health endpoints.

## 9.5 Evolución

- OpenAPI;
- AsyncAPI;
- configuración externa;
- persistencia privada;
- servicios independientes.

# 10. Architecture Decision Records

Los ADRs formalizan decisiones estructurales.

## 10.1 ADR-008 - Identidad

**Decisión:**

- token con firma asimétrica.

**Consecuencias:**

- los servicios validan tokens sin consultar Identidad en cada petición;
- se publica JWKS;
- la clave privada permanece protegida.

## 10.2 ADR-011 - Autorización

**Decisión:**

- matriz de autorización por operaciones.

**Consecuencias:**

- permisos explícitos;
- trazabilidad de acceso;
- control por rol y contexto.

La matriz de autorización por grupo de operaciones definida en ADR-011 es la especificación normativa única del control de acceso. No forma parte del DD (Data Design Document) ni del SDD; el SRS V3 la sitúa en «el DD» (ver sección 38).

## 10.3 ADR-013 - Caddy

**Decisión:**

- Caddy como proxy de borde.

**Responsabilidades:**

- TLS;
- cabeceras;
- límites;
- reverse proxy;
- acceso al frontend.

## 10.4 ADR-017 - Microservicios

**Decisión:**

- cinco servicios de grano grueso.

La numeración está pendiente de conciliar con el SRS V3, que cita esta decisión como ADR-014 («Descomposición del sistema en cinco servicios de grano grueso y topología por zonas de confianza», que reemplaza a ADR-004). Ver sección 38.

## 10.5 ADR-018 - Integración asíncrona

**Decisión:**

- Kafka + Transactional Outbox.

## 10.6 ADR-019 - API Gateway

**Decisión:**

- Apache APISIX.

APISIX reemplaza la alternativa previa basada en YARP.

# 11. Arquitectura de alto nivel

La arquitectura contiene:

- frontend;
- Caddy;
- APISIX;
- Identidad;
- Institucional;
- Campañas;
- Donación;
- Notificaciones;
- Kafka;
- PostgreSQL por servicio;
- observabilidad.

Flujo principal:

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
APISIX
   |
   v
Servicio propietario
   |
   +--> su PostgreSQL
   |
   +--> Kafka --> consumidor
```

No se permite:

```text
Servicio A --> Servicio B por HTTP directo
Servicio A --> Base de B
Frontend --> Servicio directo
```

# 12. Arquitectura lógica

## 12.1 Identidad

Responsable de:

- autenticación;
- usuarios;
- roles;
- jurisdicción (incluida su asignación y modificación, RF-22);
- sesiones;
- credenciales;
- claves públicas;
- tokens.

**Tecnología actual:**

- .NET 10.

## 12.2 Institucional

Responsable de:

- instituciones;
- bancos de sangre;
- territorios;
- jerarquía;
- relaciones institucionales.

**Estado:**

- definido arquitectónicamente;
- implementación completa pendiente.

**Tecnología prevista:**

- .NET 10 (SRS, sección 3.5).

El SRS le asigna además la consulta compuesta de auditoría (ST2, RF-21) y los indicadores de solo lectura (M7, RF-13). El mecanismo con el que obtendría esos datos sin HTTP directo ni acceso a bases ajenas está pendiente de decisión (sección 38).

## 12.3 Campañas

Responsable de:

- campañas;
- publicación;
- fechas;
- cupos;
- reservas;
- proyección de estado.

**Tecnología:**

- .NET 10.

Publica sus eventos de dominio mediante Outbox y consume los eventos relevantes; ningún otro servicio la consulta por HTTP. El esquema de reservas existe en `db_campana`; el incremento del Sprint 3 no expone operaciones de reserva.

## 12.4 Donación

Responsable de:

- donantes;
- registro de donación;
- unidades;
- trazabilidad;
- ciclo de vida;
- inventario;
- alertas;
- transferencias;
- escalamiento;
- proyección local de campañas;
- proceso de vencimiento (cada 5 minutos, en UTC);
- eventos de dominio.

**Tecnología:**

- Java 25 + Spring Boot.

## 12.5 Notificaciones

Responsable de:

- consumo de eventos;
- determinación de destinatarios;
- entrega;
- reintentos;
- deduplicación.

**Estado:**

- arquitectura definida;
- implementación completa pendiente;
- sin base de negocio propia.

**Tecnología prevista:**

- Java 25 (SRS, sección 3.5).

La deduplicación y el origen de los datos de contacto del destinatario (sin leer bases ajenas y con payload mínimo) están pendientes de diseño (sección 38).

# 13. Fronteras y ownership

Cada servicio:

- controla sus reglas;
- controla su persistencia;
- expone contratos;
- no conoce tablas internas ajenas;
- no modifica datos de otro servicio;
- no comparte credenciales.

# 14. Arquitectura de negocio

Capacidades principales:

- gestión de donantes;
- gestión de campañas;
- trazabilidad y ciclo de vida;
- inventario y alertas;
- red de transferencias;
- administración institucional y territorial;
- analítica e indicadores.

Los servicios se alinean con estas capacidades sin adoptar una granularidad de servicio por pantalla o por historia.

# 15. Usuarios y módulos

Perfiles:

- U1 Donante anónimo;
- U2 Donante registrado;
- U3 Operador de banco;
- U4 Administrador de banco;
- U5 Coordinador territorial;
- U6 Administrador nacional;
- U7 Auditor.

Módulos:

- M1 Gestión de Donantes;
- M2 Gestión de Campañas;
- M3 Trazabilidad y Ciclo de Vida;
- M4 Inventario y Alertas;
- M5 Red de Transferencias;
- M6 Administración Institucional y Territorial;
- M7 Analítica e Indicadores.

La autorización se implementa por operación, rol y jurisdicción, no solo por visibilidad en UI.

La consulta de campañas publicadas por personas sin sesión se atiende bajo el perfil U1; no existe un perfil «Ciudadanía» separado.

# 16. Arquitectura de datos

## 16.1 Principio

Un dato tiene un único propietario.

## 16.2 Bases

| Base | Propietario |
|---|---|
| `db_identidad` | Identidad |
| `db_institucional` | Institucional |
| `db_campana` | Campañas |
| `db_donacion` | Donación |
| - (sin base de negocio) | Notificaciones |

## 16.3 Reglas

- sin FK entre bases;
- sin joins distribuidos;
- credenciales independientes;
- volúmenes independientes;
- migraciones independientes;
- backup independiente.

## 16.4 Estado físico

**Identidad:**

- migraciones V001-V003.

**Campañas:**

- V001-V002.

**Donación:**

- base existente;
- esquema central aún pendiente;
- el servicio persiste con el esquema que despliega actualmente (riesgo de divergencia; ver DD V3.1, sección 21).

**Institucional:**

- base existente;
- esquema central pendiente.

# 17. Consistencia

La consistencia fuerte se limita a transacciones locales.

Para cambios que originan eventos:

```text
BEGIN
   cambio negocio
   insert outbox
COMMIT
   |
   v
publicador
   |
   v
Kafka
```

No se usan transacciones distribuidas entre PostgreSQL y Kafka.

# 18. Integración

## 18.1 Entrada síncrona

La entrada del usuario es síncrona:

```text
Frontend -> Caddy -> APISIX -> Servicio
```

## 18.2 Interservicio

La integración de negocio entre servicios es asíncrona:

```text
Productor -> Outbox -> Kafka -> Consumidor
```

Campañas y Donación se integran solo por eventos: Campañas publica eventos de campaña que Donación consume para mantener su proyección local de campañas; Donación no consulta a Campañas por HTTP.

## 18.3 Contratos

Se usan:

- OpenAPI para HTTP;
- AsyncAPI para eventos.

## 18.4 Idempotencia

Los consumidores deben tolerar:

- reintentos;
- duplicados;
- demoras;
- reinicios.

# 19. Kafka

La implementación vigente utiliza Kafka 4.3.1.

Características:

- KRaft;
- SASL/SCRAM;
- ACL;
- tópicos declarados;
- creación mediante kafka-init;
- inspección mediante Kafbat.

# 20. Seguridad

## 20.1 Borde

Caddy:

- TLS;
- HSTS;
- CSP;
- X-Frame-Options;
- nosniff;
- Referrer-Policy;
- límite de cuerpo;
- rate limit.

## 20.2 Gateway

APISIX:

- routing;
- validación inicial;
- JWKS;
- roles;
- rutas;
- correlación;
- bloqueo de `/internal`;
- entrega de los accesos denegados a Identidad mediante una operación interna no expuesta al exterior.

## 20.3 Servicios

Cada servicio vuelve a aplicar reglas de dominio, autorización y jurisdicción relevantes.

## 20.4 Persistencia

- TLS;
- SCRAM;
- mínimo privilegio;
- redes privadas.

# 21. Auditoría

La auditoría registra:

- actor;
- rol;
- jurisdicción;
- operación;
- recurso;
- resultado;
- correlación;
- origen;
- fecha/hora.

No debe registrar contenido clínico.

Las tablas implementadas de Identidad y Campañas son append-only mediante permisos y triggers.

# 22. Clasificación de información

| Clase | Tratamiento |
|---|---|
| Personal | acceso restringido |
| Operacional restringida | perfiles autorizados |
| Auditoría | append-only |
| Técnica | mínima |
| Prohibida | no capturar |

Información prohibida:

- resultados clínicos;
- diagnósticos;
- causas clínicas detalladas;
- información de pacientes;
- datos fuera del alcance.

# 23. Arquitectura del frontend

Tecnologías:

- React 19;
- TypeScript;
- Vite;
- Tailwind CSS 4;
- Radix UI.

Principios:

- modularidad;
- componentes reutilizables;
- accesibilidad;
- navegación por perfil;
- estados de carga/error;
- frontend sin lógica de autorización definitiva.

La aplicación web es una SPA única con navegación por perfil; no hay aplicaciones separadas por perfil.

# 24. C4 - Contexto

**Archivo:**  
[`Red Vital C4-c1.png`](./diagrams/Red%20Vital%20C4-c1.png) · fuente Mermaid: [`c1-contexto.mmd`](./diagrams/c1-contexto.mmd)

![Figura 1: C4 Contexto](./diagrams/Red%20Vital%20C4-c1.png)

La vista contextual ubica RedVital frente a actores y sistemas externos. Los actores son los siete perfiles U1 a U7; SIHEVI-INS aparece como sistema externo con un punto de integración documentado (RNF-07).

# 25. C4 - Contenedores

**Archivo:**  
[`Red Vital C4-c2- Container Diagram.png`](./diagrams/Red%20Vital%20C4-c2-%20Container%20Diagram.png) · fuente Mermaid: [`c2-contenedores.mmd`](./diagrams/c2-contenedores.mmd)

![Figura 2: C4 Contenedores](./diagrams/Red%20Vital%20C4-c2-%20Container%20Diagram.png)

La vista incluye frontend, borde, gateway, servicios, Kafka y persistencias. El gateway es Apache APISIX; Campañas y Donación se integran por eventos; los servicios pendientes (Institucional y Notificaciones) se dibujan con trazo discontinuo.

# 26. C4 - Componentes

Los C3 representan componentes lógicos.

## 26.1 Identidad

![Figura 3: C3 Identidad](./diagrams/Red%20Vital%20C4-c3-%20Identidad.png)

## 26.2 Campañas

![Figura 4: C3 Campañas](./diagrams/Red%20Vital%20C4-c3-%20campa%C3%B1as.png)

## 26.3 Donación

![Figura 5: C3 Donación](./diagrams/Red%20Vital%20C4-c3-%20donacion.png)

Donación no tiene adaptador HTTP hacia Campañas: conoce las campañas mediante una proyección local alimentada por eventos.

## 26.4 Institucional

![Figura 6: C3 Institucional](./diagrams/Red%20Vital%20C4-c3-institucional.png)

## 26.5 Notificaciones

![Figura 7: C3 Notificaciones](./diagrams/Red%20Vital%20C4-c3-%20Notificaciones.png)

La correspondencia entre C3 y código es semántica, no literal. Las cajas deben existir como responsabilidades, aunque la implementación use capas o arquitectura hexagonal.

Las fuentes de todas las vistas son los archivos Mermaid (`.mmd`) del SDD (sección 9.7); SAD y SDD incluyen exactamente los mismos PNG.

# 27. C4 - Despliegue

![Figura 8: C4 Despliegue](./diagrams/Red%20Vital%20C4-c4-%20Despliegue.png)

La vista de despliegue se interpreta junto con Infraestructura V2. Institucional y Notificaciones figuran con trazo discontinuo (pendientes). Los puertos de las bases de datos siguen la composición del repositorio de infraestructura (Infraestructura V2.1, sección 15).

# 28. Infraestructura de alto nivel

Topología:

- VM1 Tools;
- VM2 QA Datos;
- VM3 QA Servicios;
- VM4 QA Borde;
- VM5 Prod Datos;
- VM6 Prod Servicios;
- VM7 Prod Borde.

## 28.1 VM Tools

- GitHub Runner;
- Prometheus;
- Grafana;
- Kafbat;
- utilidades de respaldo.

## 28.2 VM Servicios

- Identidad;
- Campañas;
- Donación;
- Kafka;
- servicios pendientes cuando existan.

## 28.3 VM Borde

- Caddy;
- APISIX;
- frontend.

## 28.4 VM Datos

- PostgreSQL por contexto.

# 29. Ambientes

QA y Producción no comparten:

- bases;
- secretos;
- volúmenes;
- certificados;
- sesiones;
- archivos de configuración.

Las imágenes deben ser equivalentes siempre que sea posible.

# 30. Contenedores

Reglas:

- no root;
- `cap_drop: ALL`;
- `no-new-privileges`;
- read-only cuando aplique;
- secretos en `/run/secrets`;
- health checks;
- redes mínimas.

# 31. Observabilidad

La arquitectura contempla:

- métricas;
- logs;
- health;
- correlación;
- Prometheus;
- Grafana;
- Kafbat.

Tools es infraestructura operativa, no parte del dominio.

# 32. Despliegue

Flujo:

```text
GitHub
   |
   v
GitHub Actions
   |
   v
Runner Tools
   |
   +--> QA
   |
   +--> Producción con aprobación
```

QA puede automatizarse.

Producción requiere control explícito.

# 33. Backup y recuperación

Cada base debe respaldarse de forma independiente.

La restauración:

1. identifica la base;
2. detiene dependientes;
3. restaura;
4. valida;
5. aplica migraciones posteriores;
6. inicia servicio;
7. smoke test.

# 34. Estado de implementación

| Componente | Estado |
|---|---|
| Frontend | prototipo/implementación funcional parcial según flujo disponible |
| Identidad | implementado |
| Campañas | implementado |
| Donación | implementado (esquema central de `db_donacion` pendiente) |
| Institucional | pendiente |
| Notificaciones | pendiente |
| Caddy | implementado |
| APISIX | implementado/configurado |
| Kafka | implementado |
| PostgreSQL | implementado |
| Observabilidad | implementado/configurado (Prometheus, Grafana y Kafbat) |

El SAD diferencia arquitectura objetivo de incremento implementado. El vocabulario de estado coincide con el de Infraestructura V2.1 (sección 33).

# 35. Verificación arquitectónica y QA

El Documento de Pruebas TD V1 (rev. 1.1) es la fuente especializada para la metodología, diseño, cobertura y reporte de pruebas del Sprint 3. El SAD incorpora solo aquellos elementos que afectan decisiones, riesgos y verificabilidad de la arquitectura.

## 35.1 Estrategia de verificación

La estrategia está orientada al riesgo y utiliza cuatro clases de camino:

| Código | Camino | Propósito |
|---|---|---|
| F | Feliz | Entrada válida, permisos correctos y resultado esperado. |
| N | Negativo | Entrada inválida, rol sin permiso, recurso fuera de alcance o transición prohibida. |
| B | Borde | Valores en límites de tiempo, cantidad, vigencia o repetición. |
| X | Fallo inducido / carga | Dependencia no disponible o condición de carga controlada. |

Para Sprint 3 existen 23 casos de prueba diseñados; 18 forman parte de la ejecución comprometida del Sprint 3. El TD deja además 7 pruebas de carga, sobrecarga y estrés diseñadas principalmente para Sprint 4.

La arquitectura considera especialmente relevantes las pruebas de seguridad, seguridad física, funcionalidad, integridad e idempotencia, auditoría, resiliencia, contrato, instalabilidad, integración, datos, interfaz y carga.

## 35.2 Cobertura del incremento

**Operaciones.** Las 16 operaciones del incremento disponen de al menos un caso con camino feliz y uno negativo; seis incluyen además borde o fallo inducido.

**Requerimientos.** De los 22 requerimientos funcionales de línea base (SRS V4), el Sprint 3 implementa 10 y los 10 cuentan con al menos un caso diseñado.

**Escenarios de calidad.** De los 17 escenarios asignados al Sprint 3, 10 quedan cubiertos por casos diseñados, 1 queda parcialmente cubierto y 6 no disponen todavía de implementación que permita ejecutarlos completamente.

Esta cobertura expresa diseño de prueba, no aprobación.

## 35.3 Métricas y umbrales arquitectónicos

| Aspecto | Métrica | Umbral / criterio |
|---|---|---|
| Confidencialidad | Campos de causa clínica | 0 |
| Trazabilidad | Reconstrucción de cadena de unidad | Menos de 5 min |
| Idempotencia | Duplicados ante reenvíos | 0 en 100 reenvíos |
| Vencimiento | Salida de inventario disponible | 15 min o menos |
| Instalabilidad | Puesta en marcha completa | 10 min o menos, un comando |
| Carga nominal inventario | Latencia | p95 3 s o menos; p99 5 s o menos |
| Pico de campaña | Latencia y error | p95 3 s o menos; error menor al 1 % |
| Abuso automatizado | Solicitudes por encima del límite | 100 % rechazadas con 429 |

Los umbrales de carga y estrés se ejecutan cuando la pila de medición esté disponible; su inclusión aquí no implica aprobación. La pila de medición aún no tiene ambiente definido en Infraestructura V2.1 (TD, H-18).

El umbral de vencimiento corresponde a EC-13 (proceso cada 5 minutos). La redacción de RNF-08 en el SRS V3 exige una lectura inmediata; la decisión está registrada en el TD (H-17).

## 35.4 Datos sintéticos y reproducibilidad

Las pruebas utilizan un conjunto sintético reproducible con semilla controlada. El núcleo documentado contiene, entre otros:

- 18 donantes;
- 13 campañas;
- 38 donaciones;
- 89 unidades;
- 361 eventos.

El conjunto no contiene causa clínica, mantiene referencias coherentes y puede regenerarse con la misma semilla y ancla.

La suite automatizada no debe modificar la instancia utilizada durante el Review. Debe ejecutarse sobre Desarrollo o sobre una base recién cargada. El script E2E de Infraestructura V2.1 (sección 27) sigue la misma regla.

## 35.5 Criterios de entrada y salida

Las pruebas requieren, según el caso, contratos publicados, incremento desplegado, conjunto sintético cargado y configuración de prueba disponible.

La ejecución se considera cerrada cuando:

1. se ejecutan todos los casos Críticos y Altos dentro del alcance comprometido;
2. los defectos críticos están resueltos o aceptados formalmente;
3. las evidencias están enlazadas;
4. se emite el informe de pruebas.

## 35.6 Estado de resultados

El TD V1 declara el resumen de resultados del Sprint 3 como pendiente de ejecución/consolidación. Por ello este SAD no afirma porcentajes de aprobación, fallos, bloqueos ni cumplimiento medido de carga o estrés.

## 35.7 Verificaciones pendientes de la arquitectura vigente

La arquitectura V3 utiliza Apache APISIX y Kafka. Las verificaciones deben alinearse con esa línea.

Se requiere mantener o completar pruebas sobre:

- regresión de autorización y routing en APISIX;
- atomicidad del Transactional Outbox;
- broker Kafka temporalmente no disponible;
- consumo duplicado sin efecto duplicado;
- mensajes incompatibles con contrato;
- ACL y credenciales por productor/consumidor;
- ausencia de datos prohibidos en eventos;
- correlación a través de eventos;
- recuperación del procesamiento.

Las referencias históricas del borrador previo del TD (0.3) a YARP y a llamadas HTTP directas entre microservicios no redefinen la arquitectura V3: ya fueron corregidas en el TD V1.0 (hallazgos H-06 y H-07) y su consistencia con SAD V3.1 y SDD V2.1 se cierra en el TD V1.1 (H-15).

# 36. Pruebas arquitectónicas esperadas

## 36.1 Seguridad

- token inválido;
- rol no autorizado;
- jurisdicción incorrecta;
- ruta interna desde exterior.

## 36.2 Datos

- intento de conexión a base ajena;
- credencial equivocada;
- auditoría inmutable.

## 36.3 Integración

- productor publica;
- consumidor procesa;
- duplicado;
- caída temporal;
- reintento.

## 36.4 Infraestructura

- firewall;
- health;
- TLS;
- servicios internos no expuestos.

# 37. Riesgos arquitectónicos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| RA-01 | arquitectura objetivo por delante de parte del código | Alto | distinguir estado real |
| RA-02 | referencias históricas a YARP | Alto | APISIX como línea vigente; figuras C4 y TD corregidos (SAD V3.1, TD V1.1) |
| RA-03 | referencias históricas a HTTP interservicio | Alto | Kafka + Outbox; adaptador HTTP Donación-Campañas eliminado de las figuras (SAD V3.1) |
| RA-04 | Kafka como dependencia central | Alto | monitoreo, ACL, recuperación |
| RA-05 | gateway como concentración de tráfico | Medio | health y observabilidad |
| RA-06 | Institucional pendiente | Alto | no declarar completo |
| RA-07 | Notificaciones pendiente | Medio | conservar contrato y evento |
| RA-08 | QA no consolidado | Medio | no inventar resultados |
| RA-09 | divergencia documental | Alto | SAD/SDD/DD/Infra sincronizados; diagramas con fuente única Mermaid |
| RA-10 | backup en mismo dominio de fallo | Medio | futura copia externa |
| RA-11 | decisiones abiertas entre el SRS V3 y la arquitectura vigente (numeración de ADR, matriz de autorización, alcance de Institucional) | Medio | conciliar con el SRS V4 (TD, H-16 a H-25) |
| RA-12 | SIHEVI-INS sin componente asignado | Medio | asignar el punto de integración (RNF-07) |

# 38. Deuda arquitectónica

Se reconoce:

- falta de Institucional completo;
- falta de Notificaciones completo;
- ausencia de registry de imágenes;
- esquema central pendiente de Donación;
- esquema central pendiente de Institucional;
- resultados QA aún por consolidar;
- necesidad de limpiar ADRs/referencias obsoletas;
- necesidad de mantener diagramas sincronizados;
- conciliar la numeración de ADR con el SRS (cinco servicios: ADR-017 en el SAD y ADR-014 en el SRS V3);
- confirmar la ubicación de la matriz de autorización (ADR-011) y corregir la referencia del SRS, que la sitúa en «el DD»;
- asignar un componente al punto de integración con SIHEVI-INS (RNF-07);
- definir el mecanismo de datos de Institucional para la consulta compuesta de auditoría (ST2) y la analítica (M7) sin HTTP directo ni acceso a bases ajenas;
- diseñar la deduplicación de Notificaciones y el origen de los datos de contacto del destinatario, compatibles con RNF-06 y con el payload mínimo;
- conciliar el esquema físico desplegado de Donación con las migraciones centrales cuando existan;
- sustituir en el repositorio los PNG de C4 por los de esta versión (fuente Mermaid).

# 39. Trazabilidad

| Driver | Decisión | Componente | Verificación |
|---|---|---|---|
| seguridad | RS256 + APISIX | Identidad/Gateway | pruebas auth |
| jurisdicción | matriz + claims | gateway/servicio | EC-01 |
| aislamiento | database-per-service | PostgreSQL | prueba acceso cruzado |
| desacoplamiento | Kafka + Outbox | servicios/Kafka | integración |
| borde seguro | Caddy | borde | TLS/headers |
| auditabilidad | append-only | DB/servicios | EC-05 |
| observabilidad | métricas/correlación | Tools/servicios | Prometheus/Grafana |
| despliegue reproducible | Docker Compose | infraestructura | smoke/E2E |

# 40. Reglas invariantes

1. un dato tiene un dueño;
2. un servicio no consulta base ajena;
3. frontend no autoriza por sí solo;
4. secretos no viven en Git;
5. rutas internas no se exponen;
6. Kafka media integración de negocio;
7. Outbox protege publicación de eventos;
8. QA y Producción permanecen separados;
9. datos clínicos prohibidos no se modelan;
10. todo cambio estructural debe dejar trazabilidad.

# 41. Gobierno

Cambios sobre:

- fronteras;
- ownership;
- integración;
- gateway;
- datos;
- topología;

requieren revisión arquitectónica y, cuando corresponda, ADR.

# 42. Evolución prevista

| Versión | Entrega | Objetivo |
|---|---|---|
| V1 | Semana 6 | arquitectura inicial |
| V2 | Semana 8 | servicios, seguridad, ambientes |
| V3 | Semana 10 | alineación con implementación y Sprint 3 |
| V4 | Semana 12 | evidencia de carga/observabilidad |
| V5 | Semana 14 | recuperación y cierre de deuda |

# 43. Referencias internas

```text
architecture/adrs/
architecture/quality-attributes/
architecture/diagrams/          (PNG y fuentes .mmd de las vistas C4)
architecture/SDD.md
data/DD.md
infrastructure/infrastructure.md
api/
integration/
testing/
```

# 44. Criterio de consistencia de V3

La versión 3 se considera coherente si:

- APISIX reemplaza YARP;
- Caddy permanece en borde;
- Kafka media integración interservicio;
- no aparecen llamadas HTTP directas entre microservicios de negocio;
- existen cinco servicios arquitectónicos;
- existen cuatro bases de negocio;
- Notificaciones no tiene base de negocio;
- datos no cruzan bases directamente;
- despliegue usa siete VMs;
- QA/Prod están separados;
- C4 coincide con SDD;
- las figuras C4 no rotulan YARP ni muestran HTTP directo entre servicios, y el despliegue muestra Kafka y Kafbat;
- DD V3 coincide con ownership;
- Infra V2 coincide con topología;
- no se afirman resultados QA no evidenciados.

# Anexo A. Resumen de componentes

| Componente | Responsabilidad |
|---|---|
| Frontend | interacción |
| Caddy | borde |
| APISIX | gateway |
| Identidad | identidad y sesión |
| Institucional | estructura institucional |
| Campañas | campañas y cupos |
| Donación | ciclo de donación |
| Notificaciones | entrega de mensajes |
| Kafka | bus de eventos |
| PostgreSQL | persistencia |
| Prometheus | métricas |
| Grafana | visualización |
| Kafbat | inspección Kafka |

# Anexo B. Comunicación permitida

```text
Usuario -> Frontend -> Caddy -> APISIX -> Servicio
Servicio -> su PostgreSQL
Servicio -> Kafka
Kafka -> Servicio consumidor
Tools -> métricas
```

# Anexo C. Comunicación prohibida

```text
Frontend -> Servicio directo
Servicio -> Base ajena
Servicio -> Servicio directo por HTTP de negocio
Internet -> Tools
Internet -> administración APISIX
```

# Anexo D. Persistencia

```text
Identidad -> db_identidad
Institucional -> db_institucional
Campañas -> db_campana
Donación -> db_donacion
Notificaciones -> sin base de negocio
```

# Anexo E. Notas de implementación

El documento evita confundir diseño objetivo con disponibilidad real.

Institucional y Notificaciones continúan siendo parte de la arquitectura aunque su implementación completa no esté disponible.

El frontend y los servicios pueden evolucionar internamente sin obligar a que los nombres de carpetas coincidan literalmente con las cajas C3, siempre que se conserven las responsabilidades y dependencias definidas.

Este documento describe la arquitectura académica vigente de RedVital para la entrega de Semana 10. Cuando exista diferencia entre una afirmación histórica y una decisión arquitectónica vigente, debe prevalecer la decisión formal más reciente y verificarse su coherencia con SDD V2, DD V3, Infraestructura V2 y la implementación disponible.
