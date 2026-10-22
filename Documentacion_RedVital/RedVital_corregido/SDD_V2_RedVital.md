---
title: "Software Design Description (SDD) - RedVital"
subtitle: "Version 2.1 - Sprint 3 / Semana 10"
author: "Arkhé Software S.A.S."
date: "17 de octubre de 2026"
lang: es
---

# Control de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | 22/09/2026 | Diseño inicial de la solución, línea de diseño, servicios, C4 y relación con datos e integración. |
| 2.0 | 07/10/2026 | Alineación con Sprint 3: cinco microservicios, Caddy + APISIX, Kafka + Transactional Outbox, frontend React, vistas C4 actualizadas, despliegue en siete VMs y trazabilidad con DD V3 e Infraestructura V2. |
| 2.1 | 17/10/2026 | Corrección de consistencia entre SAD, SDD, DD, Infraestructura y TD: vistas C4 redibujadas como fuente Mermaid (APISIX en lugar de YARP; sin consulta HTTP Donación-Campañas, sustituida por una proyección local alimentada por eventos; Outbox visible en Donación y Campañas; Kafka y Kafbat en el despliegue; aplicación web única y actor Ciudadanía integrado en U1; SIHEVI-INS como sistema externo); responsabilidades de Identidad (RF-22), Donación (transferencias, escalamiento, proyección de campañas y proceso de vencimiento) e Institucional (consulta compuesta y analítica previstas); referencia a ADR-011 para la matriz de autorización; tecnologías previstas de los servicios pendientes; y nuevos pendientes (SIHEVI-INS, deduplicación de Notificaciones, numeración de ADR). |

# 1. Propósito

El **Software Design Description (SDD) V2** describe cómo se materializan en el diseño de RedVital las decisiones definidas en el SAD V3.

El SDD documenta:

- la línea de diseño de la solución;
- la estructura del frontend;
- los servicios y sus responsabilidades;
- las vistas C4;
- la integración entre componentes;
- la relación con los datos;
- el despliegue desde la perspectiva de diseño;
- los contratos;
- la trazabilidad entre arquitectura, diseño e implementación.

El SDD no reemplaza el SAD, el DD ni el Documento de Infraestructura.

# 2. Alcance

El documento cubre:

1. principios de diseño;
2. diseño de interfaz;
3. diseño de servicios;
4. C4 Nivel 1 - Contexto;
5. C4 Nivel 2 - Contenedores;
6. C4 Nivel 3 - Componentes;
7. vista de despliegue;
8. diseño de integración;
9. relación con datos;
10. contratos;
11. trazabilidad;
12. estado de diseño e implementación.

# 3. Relación con otros artefactos

| Artefacto | Relación |
|---|---|
| SAD V3 | Define estructura, drivers, restricciones y decisiones arquitectónicas. |
| SRS V4 | Define usuarios, módulos, requisitos y flujos funcionales (el SRS V3 del 22/09/2026 está superado). |
| ADRs | Justifican decisiones de diseño estructural; ADR-011 define la matriz de autorización por grupo de operaciones. |
| DD V3 (Data Design Document) | Define propiedad de datos, modelo lógico/físico y diccionario. No contiene la matriz de autorización ni el catálogo de operaciones. |
| Infraestructura V2 | Define VMs, redes, puertos, contenedores y operación. |
| OpenAPI | Define contratos HTTP expuestos por la capa de aplicación. |
| AsyncAPI | Define eventos asíncronos. |
| Frontend | Materializa navegación, componentes visuales y flujos de usuario. |
| Testing | Valida el diseño implementado. |

En este conjunto documental «DD» significa Data Design Document. La referencia del SRS V3 a «el DD» como sede de la matriz de autorización se registra como pendiente en la sección 25.

# 4. Principios de diseño

RedVital adopta los siguientes principios:

1. separación de responsabilidades;
2. servicios de grano grueso;
3. contratos explícitos;
4. persistencia propia por servicio;
5. cero acceso cruzado a bases;
6. cero llamadas HTTP directas entre microservicios de negocio;
7. integración asíncrona mediante Kafka;
8. autorización en gateway y validación en servicio;
9. diseño de interfaz consistente y accesible;
10. configuración externa;
11. observabilidad;
12. trazabilidad de decisiones.

# 5. Línea de diseño del frontend

El frontend se implementa con:

- React 19;
- TypeScript;
- Vite;
- Tailwind CSS 4;
- primitivas de Radix UI.

## 5.1 Sistema visual

La línea visual mantiene:

- tipografía de alta legibilidad;
- paleta institucional;
- separación entre color de identidad y color de error;
- foco visible;
- objetivos táctiles mínimos;
- iconografía SVG;
- respeto por `prefers-reduced-motion`;
- animaciones limitadas a `transform` y `opacity`;
- componentes reutilizables.

## 5.2 Organización del frontend

La estructura actual separa:

```text
src/
├── modules/
│   ├── donantes/
│   ├── ciclovida/
│   └── inventario/
├── shared/
│   ├── ui/
│   ├── layout/
│   ├── paginas/
│   ├── sesion/
│   └── tipos/
└── styles/
```

La aplicación web es una **SPA única**: los perfiles U1 a U7 se atienden con navegación por perfil sobre los mismos módulos, no con aplicaciones separadas. La consulta de campañas publicadas por personas sin sesión corresponde al perfil U1 (SRS: los donantes acceden a M2 para consultar campañas publicadas).

El diseño favorece:

- modularidad;
- reutilización;
- navegación según perfil;
- estados de carga/error;
- separación entre presentación y reglas de negocio.

## 5.3 Responsabilidad del frontend

El frontend puede:

- presentar información;
- capturar datos;
- validar formato;
- gestionar navegación;
- adaptar visibilidad por rol;
- manejar estados de interacción.

El frontend **no es una frontera de seguridad**. La autorización definitiva se aplica en gateway y servicio.

## 5.4 Mockups y evidencia visual

Para esta versión no se mantiene un set independiente de mockups como fuente normativa.

La evidencia de diseño se encuentra en:

- la implementación del frontend;
- el inventario de pantallas;
- los componentes reutilizables;
- la línea visual implementada.

Esto evita duplicar un mockup que pueda quedar desactualizado frente al código.

# 6. Diseño de servicios

RedVital se estructura en cinco servicios principales:

| Servicio | Responsabilidad |
|---|---|
| Identidad | autenticación, sesiones, roles, jurisdicción (incluida su asignación, RF-22), tokens y claves públicas |
| Institucional | instituciones, bancos de sangre y estructura territorial; previstas: consulta compuesta de auditoría (ST2) y analítica de solo lectura (M7) |
| Campañas | campañas, cupos, publicación y reservas |
| Donación | donantes, donaciones, unidades, inventario, alertas, transferencias, escalamiento y ciclo de vida |
| Notificaciones | consumo de eventos y envío desacoplado de notificaciones |

## 6.1 Identidad

Diseño predominante:

```text
API
  ↓
Aplicación
  ↓
Dominio
  ↓
Infraestructura
```

Responsabilidades de diseño:

- emisión y renovación de sesión;
- firma asimétrica RS256;
- JWKS;
- autorización de identidad;
- asignación y modificación de la jurisdicción de los usuarios (RF-22), que surte efecto en el siguiente token de acceso emitido;
- auditoría de operaciones sensibles.

## 6.2 Campañas

Mantiene separación por capas y persistencia propia.

Campañas no debe leer bases ajenas.

Cuando otro servicio requiere cambios de campaña, la integración se realiza por eventos.

Campañas publica sus eventos de dominio mediante Outbox y consume los eventos relevantes; ningún otro servicio la consulta por HTTP. Donación conoce las campañas mediante una proyección local alimentada por esos eventos (DD V3, sección 7.4).

## 6.3 Donación

Utiliza arquitectura hexagonal:

```text
web
  ↓
aplicacion
  ↓
dominio
  ↑
infraestructura
```

Incluye:

- persistencia;
- Kafka;
- Outbox;
- consumidores;
- reglas de ciclo de vida;
- inventario;
- alertas;
- transferencias y escalamiento (previstos);
- proyección local de campañas alimentada por eventos;
- proceso de vencimiento programado (cada 5 minutos, en UTC).

## 6.4 Institucional

Permanece como servicio definido en arquitectura y diseño. Su implementación completa continúa pendiente.

Tecnología prevista: .NET 10 (SRS, sección 3.5).

El SRS le asigna además la consulta compuesta de auditoría (ST2, RF-21) y los indicadores de solo lectura (M7, RF-13). El mecanismo con el que obtendría esos datos sin consultas HTTP directas ni acceso a bases ajenas (proyecciones locales alimentadas por eventos o contratos de lectura) está **pendiente de decisión** (sección 25).

## 6.5 Notificaciones

Consume eventos notificables.

No accede directamente a las bases de otros servicios y no posee base de negocio propia.

Tecnología prevista: Java 25 (SRS, sección 3.5). La deduplicación por identificador de evento (sección 11.3) y el origen de los datos de contacto del destinatario están pendientes de diseño (sección 25).

# 7. C4 Nivel 1 - Contexto

El C1 representa RedVital como sistema y sus actores externos.

**Archivo del repositorio:**  
[`architecture/diagrams/Red Vital C4-c1.png`](./diagrams/Red%20Vital%20C4-c1.png) · fuente Mermaid: [`c1-contexto.mmd`](./diagrams/c1-contexto.mmd)

![C4 Nivel 1 - Contexto](./diagrams/Red%20Vital%20C4-c1.png)

El diagrama debe permitir identificar:

- usuarios;
- RedVital;
- interacciones externas;
- límites del sistema.

Los actores corresponden a los siete tipos de usuario del SRS (U1 a U7). La consulta de campañas publicadas por una persona sin sesión se atiende bajo el perfil U1 (donante anónimo); no existe un actor «Ciudadanía» separado. SIHEVI-INS aparece como sistema externo con un punto de integración documentado; el reporte efectivo no se ejecuta en la V1 (RNF-07).

# 8. C4 Nivel 2 - Contenedores

**Archivo del repositorio:**  
[`architecture/diagrams/Red Vital C4-c2- Container Diagram.png`](./diagrams/Red%20Vital%20C4-c2-%20Container%20Diagram.png) · fuente Mermaid: [`c2-contenedores.mmd`](./diagrams/c2-contenedores.mmd)

![C4 Nivel 2 - Contenedores](./diagrams/Red%20Vital%20C4-c2-%20Container%20Diagram.png)

El C2 representa:

- frontend (aplicación web única);
- Caddy;
- APISIX;
- microservicios;
- Kafka;
- persistencias;
- relaciones principales.

Reglas de lectura:

- frontend entra por borde/gateway;
- el gateway es Apache APISIX; el C2 no contiene YARP;
- cada servicio usa su propia persistencia;
- Kafka media la comunicación interservicio;
- Campañas y Donación se integran por eventos: Donación mantiene una proyección local de campañas y no consulta a Campañas por HTTP;
- Institucional y Notificaciones se dibujan con trazo discontinuo porque su implementación está pendiente;
- no se representan accesos cruzados a bases.

# 9. C4 Nivel 3 - Componentes

Los C3 describen componentes lógicos. No deben interpretarse como un espejo literal de las carpetas del código.

## 9.1 Identidad

**Archivo:**  
[`Red Vital C4-c3- Identidad.png`](./diagrams/Red%20Vital%20C4-c3-%20Identidad.png) · fuente Mermaid: [`c3-identidad.mmd`](./diagrams/c3-identidad.mmd)

![C3 Identidad](./diagrams/Red%20Vital%20C4-c3-%20Identidad.png)

El gestor de roles y jurisdicciones atiende también la asignación de jurisdicción de los usuarios (RF-22). APISIX entrega a Identidad los accesos denegados mediante una operación interna no expuesta al exterior.

## 9.2 Campañas

**Archivo:**  
[`Red Vital C4-c3- campañas.png`](./diagrams/Red%20Vital%20C4-c3-%20campa%C3%B1as.png) · fuente Mermaid: [`c3-campanas.mmd`](./diagrams/c3-campanas.mmd)

![C3 Campañas](./diagrams/Red%20Vital%20C4-c3-%20campa%C3%B1as.png)

Campañas publica sus eventos de dominio mediante Outbox y consume los eventos relevantes. El detalle de una campaña se sirve solo a usuarios autorizados mediante la API; Donación no lo consulta por HTTP. El gestor de cupos y reservas (RF-15) aparece con trazo discontinuo: el esquema existe en `db_campana` y no hay operación expuesta en el incremento.

## 9.3 Donación

**Archivo:**  
[`Red Vital C4-c3- donacion.png`](./diagrams/Red%20Vital%20C4-c3-%20donacion.png) · fuente Mermaid: [`c3-donacion.mmd`](./diagrams/c3-donacion.mmd)

![C3 Donación](./diagrams/Red%20Vital%20C4-c3-%20donacion.png)

El diagrama no incluye un adaptador HTTP hacia Campañas: Donación conoce las campañas mediante una proyección local alimentada por eventos (DD V3, sección 7.4). Los eventos se registran en el Outbox en la misma transacción que el cambio de negocio. El gestor de alertas, transferencias y escalamiento aparece con trazo discontinuo (pendiente). El proceso de vencimiento se ejecuta cada 5 minutos, en UTC.

## 9.4 Institucional

**Archivo:**  
[`Red Vital C4-c3-institucional.png`](./diagrams/Red%20Vital%20C4-c3-institucional.png) · fuente Mermaid: [`c3-institucional.mmd`](./diagrams/c3-institucional.mmd)

![C3 Institucional](./diagrams/Red%20Vital%20C4-c3-institucional.png)

Los componentes están por definir. La consulta compuesta de auditoría (ST2) y los indicadores (M7) que el SRS asigna a este servicio aparecen con trazo discontinuo: el mecanismo para obtener esos datos sin HTTP directo ni acceso a bases ajenas está pendiente de decisión (sección 25).

## 9.5 Notificaciones

**Archivo:**  
[`Red Vital C4-c3- Notificaciones.png`](./diagrams/Red%20Vital%20C4-c3-%20Notificaciones.png) · fuente Mermaid: [`c3-notificaciones.mmd`](./diagrams/c3-notificaciones.mmd)

![C3 Notificaciones](./diagrams/Red%20Vital%20C4-c3-%20Notificaciones.png)

Los componentes están por definir. El control de duplicados y el origen de los datos de contacto del destinatario están pendientes de diseño (sección 25).

## 9.6 Regla de consistencia entre C3 y código

La vista C3 expresa **responsabilidades y componentes lógicos**.

La implementación puede utilizar:

- capas;
- arquitectura hexagonal;
- módulos;
- adapters;
- ports;
- controllers;
- handlers.

No es obligatorio que cada caja del C3 exista con el mismo nombre como carpeta o clase.

Sí es obligatorio que:

- la responsabilidad exista;
- las dependencias respeten la arquitectura;
- no aparezcan conexiones prohibidas;
- no exista acceso a persistencias ajenas;
- no se introduzcan llamadas directas servicio-servicio.

## 9.7 Mantenimiento de los diagramas

Las vistas C4 se mantienen como texto (RD-04): la fuente es el archivo Mermaid `.mmd` de cada vista y el PNG se genera a partir de él.

```text
mmdc -i architecture/diagrams/<vista>.mmd -o "architecture/diagrams/<archivo>.png" -s 2 -b white
```

SAD y SDD incluyen exactamente los mismos PNG. Ningún PNG se edita a mano: se corrige la fuente `.mmd` y se regenera.

# 10. C4 - Despliegue

**Archivo:**  
[`Red Vital C4-c4- Despliegue.png`](./diagrams/Red%20Vital%20C4-c4-%20Despliegue.png) · fuente Mermaid: [`c4-despliegue.mmd`](./diagrams/c4-despliegue.mmd)

![C4 - Despliegue](./diagrams/Red%20Vital%20C4-c4-%20Despliegue.png)

La vista representa la topología física de referencia.

La distribución vigente se interpreta como:

| Ambiente | Datos | Servicios | Borde |
|---|---|---|---|
| QA | VM2 | VM3 | VM4 |
| Producción | VM5 | VM6 | VM7 |
| Compartido | VM1 Tools | - | - |

Contenido por VM:

| VM | Componentes |
|---|---|
| VM1 Tools | GitHub Actions Runner, Prometheus, Grafana, Kafbat y utilidades de respaldo |
| VM de Datos (VM2, VM5) | PostgreSQL 16 con una base por servicio |
| VM de Servicios (VM3, VM6) | Identidad, Campañas, Donación y Kafka (con kafka-init); Institucional y Notificaciones cuando se implementen |
| VM de Borde (VM4, VM7) | Caddy, frontend web y Apache APISIX |

Institucional y Notificaciones aparecen con trazo discontinuo porque están pendientes de implementación. Los puertos concretos, incluido el de cada base PostgreSQL, siguen la configuración ejecutable del repositorio de infraestructura.

La especificación detallada de:

- redes;
- puertos;
- firewall;
- secretos;
- TLS;
- Docker Compose;
- backup;
- observabilidad;

se mantiene en **Infraestructura V2**.

# 11. Diseño de integración

## 11.1 Entrada síncrona

El tráfico de usuario sigue:

```text
Frontend
   ↓
Caddy
   ↓
APISIX
   ↓
Servicio propietario
   ↓
Persistencia propia
```

## 11.2 Comunicación interservicio

La comunicación entre microservicios de negocio es asíncrona:

```text
Servicio productor
      ↓
Transactional Outbox
      ↓
     Kafka
      ↓
Servicio consumidor
```

No se utiliza:

```text
Servicio A ──HTTP directo──> Servicio B
```

como mecanismo normal de integración entre microservicios de negocio.

Ejemplo: Campañas publica eventos de campaña mediante Outbox; Donación los consume para mantener su proyección local de campañas y no consulta a Campañas por HTTP.

## 11.3 Eventos

Los eventos deben incluir:

- identificador;
- tipo;
- versión;
- productor;
- momento de emisión;
- correlación;
- payload mínimo;
- reglas de idempotencia.

Los contratos asíncronos se versionan mediante AsyncAPI cuando corresponde.

# 12. Transactional Outbox

El diseño utiliza Transactional Outbox para operaciones que requieren publicar un evento como consecuencia de un cambio persistente.

```text
BEGIN TX
 ├── cambio de negocio
 └── insert evento_outbox
COMMIT
       ↓
 publicador
       ↓
     Kafka
```

Beneficios:

- evita pérdida de eventos después del commit;
- no requiere transacción distribuida;
- permite reintento;
- mejora trazabilidad.

# 13. API Gateway y borde

## 13.1 Caddy

Responsabilidades:

- TLS;
- HTTPS;
- cabeceras;
- tamaño de solicitudes;
- rate limiting;
- acceso a frontend;
- forwarding hacia APISIX.

## 13.2 APISIX

Responsabilidades:

- routing;
- validación inicial;
- JWKS/RS256;
- autorización por ruta y rol;
- correlación;
- bloqueo de rutas internas;
- entrega de los accesos denegados al Servicio de Identidad para su auditoría, mediante una operación interna no expuesta al exterior.

El gateway no contiene lógica de negocio de dominio.

# 14. Diseño de datos

El SDD no duplica el DD V3.

Persistencia:

| Servicio | Base |
|---|---|
| Identidad | `db_identidad` |
| Institucional | `db_institucional` |
| Campañas | `db_campana` |
| Donación | `db_donacion` |
| Notificaciones | sin base de negocio |

Reglas:

- una base por servicio;
- sin FK entre bases;
- sin joins distribuidos;
- referencias externas mediante identificadores;
- consistencia local + eventos.

**Referencia:** [`../data/DD.md`](../data/DD.md)

# 15. Contratos

## 15.1 OpenAPI

OpenAPI documenta las rutas HTTP expuestas hacia gateway.

Debe permanecer alineado con:

- implementación;
- códigos de respuesta;
- esquemas;
- seguridad;
- versionado.

## 15.2 AsyncAPI

AsyncAPI documenta:

- tópicos;
- productores;
- consumidores;
- eventos;
- payloads;
- versiones.

# 16. Seguridad por diseño

El diseño utiliza defensa en profundidad:

```text
Caddy
  ↓
APISIX
  ↓
Servicio
  ↓
Persistencia
```

Controles:

- TLS;
- tokens firmados;
- autorización;
- rol;
- jurisdicción;
- rutas internas bloqueadas;
- mínimo privilegio;
- secretos externos;
- auditoría;
- redes de datos aisladas.

# 17. Observabilidad

Los componentes deben propagar identificadores de correlación.

La observabilidad contempla:

- logs estructurados;
- métricas;
- health checks;
- Prometheus;
- Grafana;
- métricas Kafka;
- Kafbat para inspección controlada.

# 18. Manejo de errores

Las respuestas deben:

- ser consistentes;
- no revelar información sensible;
- diferenciar errores funcionales y técnicos;
- conservar correlación;
- permitir observabilidad.

Cuando aplique, las APIs utilizan respuestas compatibles con Problem Details / RFC 9457.

# 19. Diseño de estados de interfaz

Las pantallas deben contemplar:

- carga;
- vacío;
- éxito;
- error;
- denegación;
- sesión expirada;
- no encontrado;
- confirmación.

Las operaciones irreversibles o sensibles deben presentar confirmación clara.

# 20. Acceso por perfil

La navegación puede cambiar según U1-U7.

La UI:

- oculta opciones no aplicables;
- adapta módulos;
- muestra contexto;
- comunica denegaciones.

Esto mejora usabilidad pero **no reemplaza autorización backend**.

La **matriz de autorización por grupo de operaciones** definida en ADR-011 es la especificación normativa única del control de acceso: APISIX la aplica por ruta y rol y cada servicio la revalida. La tabla usuarios-módulos del SRS es una vista de lectura derivada. Esa matriz no forma parte del DD (Data Design Document) ni de este SDD.

# 21. Dependencias permitidas

Permitido:

```text
Frontend -> Caddy -> APISIX -> Servicio
Servicio -> su Base
Servicio -> Kafka
Kafka -> Servicio consumidor
Tools -> métricas
```

No permitido:

```text
Frontend -> Servicio directo
Servicio -> Base ajena
Servicio -> Servicio directo por HTTP
Internet -> Tools
Internet -> administración de APISIX
```

# 22. Correspondencia diseño - implementación

| Diseño | Implementación / estado |
|---|---|
| Frontend React | repositorio `frontend` |
| Identidad | .NET 10 |
| Campañas | .NET 10 |
| Donación | Java 25 + Spring Boot |
| Institucional | pendiente de implementación completa; tecnología prevista .NET 10 (SRS, sección 3.5) |
| Notificaciones | pendiente de implementación completa; tecnología prevista Java 25 (SRS, sección 3.5) |
| Borde | Caddy |
| Gateway | APISIX |
| Mensajería | Kafka |
| Persistencia | PostgreSQL 16 |
| Observabilidad | Prometheus + Grafana + Kafbat (VM1 Tools) |

# 23. Trazabilidad

```text
SRS
 ↓
SAD / ADR
 ↓
SDD
 ↓
C4 / contrato / diseño UI
 ↓
Implementación
 ↓
QA
```

Ejemplos:

| Necesidad | Diseño |
|---|---|
| autorización por perfil | APISIX + validación en servicio |
| aislamiento de datos | una base por servicio |
| desacoplamiento | Kafka + Outbox |
| seguridad de borde | Caddy |
| trazabilidad | correlación + auditoría |
| usabilidad | sistema visual + estados de interacción |

# 24. Estado de la V2

Para la entrega de Semana 10:

- las vistas C4 están incorporadas, enlazadas y mantenidas como fuente Mermaid (`.mmd`) con exportación a PNG;
- la vista de despliegue existe en `architecture/diagrams`;
- los PNG anteriores (con YARP, con adaptador HTTP hacia Campañas y con el despliegue sin Kafka) se sustituyen por los de esta versión;
- el diseño utiliza APISIX, no YARP (las vistas C2, C3 y de despliegue ya no rotulan YARP);
- la integración interservicio utiliza Kafka y ninguna vista muestra consultas HTTP entre servicios;
- el modelo de datos se referencia desde DD V3;
- la infraestructura se referencia desde Infraestructura V2;
- el frontend tiene línea de diseño documentada;
- los mockups separados no son requisito para considerar coherente el SDD mientras el diseño visual esté materializado y documentado.

# 25. Pendientes

- cerrar implementación de Institucional;
- cerrar implementación de Notificaciones;
- mantener C4 sincronizado con decisiones vigentes;
- mantener contratos alineados con código;
- actualizar evidencia del frontend cuando los flujos cambien;
- consolidar resultados QA;
- definir el mecanismo con el que Institucional obtendrá los datos de la consulta compuesta de auditoría (ST2) y de la analítica (M7) sin HTTP directo ni acceso a bases ajenas;
- diseñar la deduplicación de Notificaciones y el origen de los datos de contacto del destinatario, compatibles con RNF-06 («sin pérdida ni duplicado») y con el payload mínimo;
- asignar un servicio o componente al punto de integración con SIHEVI-INS (RNF-07);
- confirmar la ubicación de la matriz de autorización (ADR-011) y corregir la referencia del SRS, que la sitúa en «el DD»;
- conciliar la numeración de ADR con el SRS (decisión de cinco servicios: ADR-014 en el SRS V3 y ADR-017 en el SAD V3);
- sustituir en el repositorio los PNG de C4 por los de esta versión y retirar el archivo con el nombre erróneo `Red Vital C4-c4- Despligue.png`.

# 26. Regla de mantenimiento

El SDD debe actualizarse cuando cambie:

- una vista C4;
- la responsabilidad de un servicio;
- la integración;
- el gateway;
- la estructura del frontend;
- un contrato;
- la persistencia;
- la vista de despliegue;
- una decisión de diseño estructural.

# Anexo A. Índice directo de diagramas

| Vista | Archivo | Fuente Mermaid |
|---|---|---|
| C1 Contexto | [`Red Vital C4-c1.png`](./diagrams/Red%20Vital%20C4-c1.png) | `c1-contexto.mmd` |
| C2 Contenedores | [`Red Vital C4-c2- Container Diagram.png`](./diagrams/Red%20Vital%20C4-c2-%20Container%20Diagram.png) | `c2-contenedores.mmd` |
| C3 Campañas | [`Red Vital C4-c3- campañas.png`](./diagrams/Red%20Vital%20C4-c3-%20campa%C3%B1as.png) | `c3-campanas.mmd` |
| C3 Donación | [`Red Vital C4-c3- donacion.png`](./diagrams/Red%20Vital%20C4-c3-%20donacion.png) | `c3-donacion.mmd` |
| C3 Identidad | [`Red Vital C4-c3- Identidad.png`](./diagrams/Red%20Vital%20C4-c3-%20Identidad.png) | `c3-identidad.mmd` |
| C3 Notificaciones | [`Red Vital C4-c3- Notificaciones.png`](./diagrams/Red%20Vital%20C4-c3-%20Notificaciones.png) | `c3-notificaciones.mmd` |
| C3 Institucional | [`Red Vital C4-c3-institucional.png`](./diagrams/Red%20Vital%20C4-c3-institucional.png) | `c3-institucional.mmd` |
| C4 Despliegue | [`Red Vital C4-c4- Despliegue.png`](./diagrams/Red%20Vital%20C4-c4-%20Despliegue.png) | `c4-despliegue.mmd` |

# Anexo B. Ubicación esperada

El documento debe residir en:

```text
architecture/SDD.md
```

y los diagramas (PNG y fuentes `.mmd`) en:

```text
architecture/diagrams/
```

De esta forma los enlaces relativos del documento funcionan directamente dentro del repositorio.
