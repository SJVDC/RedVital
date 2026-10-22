---
title: "Data Design Document (DD) - RedVital"
subtitle: "Version 3.1 - Sprint 3 / Semana 10"
author: "Arkhé Software S.A.S."
date: "17 de octubre de 2026"
lang: es
---

# Control de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | 01/09/2026 | Versión inicial del diseño de datos. |
| 2.0 | 22/09/2026 | Separación de persistencias por servicio, definición de modelo lógico/físico, metadata y diccionario de datos. |
| 3.0 | 07/10/2026 | Alineación con la arquitectura e implementación del Sprint 3: PostgreSQL 16, cuatro bases independientes, Notificaciones sin base de negocio, referencias entre contextos sin FK físicas, integración asíncrona por Kafka, estado real de migraciones y actualización del diccionario de datos. |
| 3.1 | 17/10/2026 | Corrección de consistencia entre documentos: aclara que «DD» es el Data Design Document y que no contiene la matriz de autorización (ADR-011) ni el catálogo de operaciones (OpenAPI); documenta el proceso de vencimiento de Donación (cada 5 minutos, UTC, umbral de 15 minutos); precisa que la asignación de jurisdicción (RF-22) es una operación de Identidad; registra la reserva de cupo (RF-15) sin operaciones expuestas, las responsabilidades previstas de Institucional según el SRS, la deduplicación pendiente de Notificaciones y el riesgo de divergencia del esquema físico de Donación. |

# 1. Propósito

El Data Design Document (DD) V3 describe el diseño de datos vigente de RedVital y establece la relación entre el modelo conceptual, el modelo lógico, el modelo físico, la metadata, el diccionario de datos y la implementación real.

El documento define:

- qué servicio es propietario de cada conjunto de datos;
- qué bases de datos existen;
- qué entidades pertenecen a cada contexto;
- qué relaciones son internas y cuáles son referencias entre contextos;
- qué datos pueden persistirse y cuáles están prohibidos;
- qué restricciones deben imponerse en PostgreSQL;
- cómo se versionan los cambios mediante migraciones;
- cómo se protege la separación entre servicios;
- cuál es el estado real de implementación de los esquemas al cierre del Sprint 3.

El DD no define protocolos de integración. Las APIs y los eventos se documentan en OpenAPI, AsyncAPI y en la documentación de integración. Este documento únicamente define cómo deben representarse y persistirse los datos.

En este conjunto documental «DD» significa Data Design Document. El DD no contiene la matriz de autorización por grupo de operaciones (definida en ADR-011) ni el catálogo de operaciones de las APIs (OpenAPI).

# 2. Alcance

El DD V3 cubre:

1. principios de diseño de datos;
2. persistencia por servicio;
3. modelo conceptual y lógico;
4. modelo físico;
5. metadata;
6. diccionario de datos;
7. integridad;
8. consistencia;
9. clasificación de información;
10. migraciones;
11. roles y permisos;
12. auditoría;
13. respaldo y recuperación;
14. trazabilidad;
15. estado real de implementación.

No cubre:

- contratos completos de APIs;
- payloads completos de eventos;
- lógica de negocio de los servicios;
- diseño visual del frontend;
- topología detallada de infraestructura;
- ejecución de pruebas.

# 3. Fuentes y relación con otros artefactos

| Artefacto | Relación con el DD |
|---|---|
| SRS V4 | Origina entidades, atributos, restricciones y reglas de información. |
| SAD V3 | Define fronteras de servicios, propiedad de datos, mínimo privilegio y separación de persistencia. |
| SDD V2 | Relaciona componentes de software con las estructuras de datos que utilizan. |
| ADRs | Registran decisiones estructurales que condicionan el diseño de datos. |
| OpenAPI / AsyncAPI | Definen los datos intercambiados por APIs y eventos. |
| Repositorio databases | Fuente de verdad del esquema físico versionado mediante Flyway. |
| Repositorios de servicios | Permiten validar que la persistencia implementada corresponde al dominio propietario. |
| Testing | Verifica restricciones, aislamiento, integridad, migraciones y recuperación. |

# 4. Principios de diseño de datos

El diseño de datos de RedVital se rige por los siguientes principios:

1. Un dato tiene un único propietario.
2. Cada servicio persistente posee su propia base de datos.
3. Ningún servicio accede directamente a tablas de otro servicio.
4. No existen claves foráneas físicas entre bases de servicios diferentes.
5. Las referencias entre contextos se almacenan como identificadores lógicos.
6. La integración entre microservicios se realiza por contratos y eventos, no por acceso compartido a base.
7. La consistencia fuerte se mantiene dentro de la transacción local del servicio propietario.
8. La consistencia entre contextos es eventual cuando una operación cruza dominios.
9. Los cambios de esquema se aplican únicamente mediante migraciones versionadas.
10. Las credenciales son independientes por base y por función.
11. La aplicación opera con mínimo privilegio.
12. Los datos sensibles se reducen al mínimo necesario.
13. Los datos clínicos fuera del alcance están prohibidos.
14. Las tablas de auditoría son de solo anexado.
15. El modelo documentado debe distinguir claramente entre diseño objetivo y esquema realmente implementado.

# 5. Tecnología y contextos de persistencia

RedVital utiliza PostgreSQL 16 como motor relacional principal.

La solución contempla cuatro bases de negocio:

| Base | Servicio propietario | Estado al cierre del Sprint 3 |
|---|---|---|
| `db_identidad` | Identidad | Implementada. Migraciones V001-V003. |
| `db_campana` | Campañas | Implementada. Migraciones V001-V002. |
| `db_donacion` | Donación | Base creada; esquema formal pendiente en el repositorio `databases`. |
| `db_institucional` | Institucional | Base creada; esquema formal pendiente en el repositorio `databases`. |
| - | Notificaciones | No requiere base de negocio. |

Cada base mantiene:

- volumen independiente;
- red aislada;
- credenciales propias;
- usuario propietario/migración cuando el esquema existe;
- usuario de servicio con permisos mínimos;
- ciclo de migración independiente;
- respaldo y recuperación independientes.

El servicio de Donación persiste con el esquema que despliega actualmente (sección 7.4). Mientras el repositorio `databases` no publique las migraciones aprobadas, existe riesgo de divergencia entre el esquema desplegado y la fuente de verdad (sección 21).

# 6. Vista conceptual

La propiedad principal puede resumirse así:

```text
+----------------+          +-------------------+
|   IDENTIDAD    |          |   INSTITUCIONAL   |
| usuarios       |          | instituciones     |
| roles          |          | territorios       |
| jurisdicciones |          | bancos de sangre  |
| sesiones       |          | relaciones        |
+----------------+          +-------------------+
        |                             |
        | referencias lógicas         | referencias lógicas
        v                             v
+----------------+          +-------------------+
|   CAMPAÑAS     |          |     DONACIÓN      |
| campañas       |          | donantes          |
| reservas       |          | donaciones        |
| cupos          |          | unidades          |
| auditoría      |          | inventario        |
+----------------+          | alertas           |
                            | transferencias    |
                            +-------------------+

NOTIFICACIONES
- consume eventos;
- no posee base de negocio;
- no lee bases ajenas.
```

Las líneas anteriores representan referencias lógicas, no relaciones SQL entre bases.

# 7. Modelo lógico por contexto

## 7.1 Identidad

### Responsabilidad

Identidad administra autenticación, sesiones, roles, jurisdicción, credenciales de servicio y material público de firma.

### Entidades lógicas vigentes

- Rol
- Usuario
- UsuarioJurisdiccion
- Sesion
- CredencialServicio
- LlaveFirma
- RegistroAuditoriaIdentidad

### Relaciones

```text
Rol 1 ---- N Usuario
Usuario 1 ---- N UsuarioJurisdiccion
Usuario 1 ---- N Sesion
CredencialServicio (independiente de Usuario)
LlaveFirma (metadato de firma pública)
RegistroAuditoriaIdentidad (append-only)
```

La jurisdicción puede representar un territorio o una institución. Cuando referencia una institución, el identificador es externo y no posee FK física hacia `db_institucional`.

La asignación y modificación de la jurisdicción de un usuario (RF-22) es una operación de Identidad sobre `UsuarioJurisdiccion`; los datos de jurisdicción pertenecen a `db_identidad`.

## 7.2 Institucional

### Responsabilidad

Institucional es propietario de la estructura organizacional y territorial.

### Entidades lógicas objetivo

- Institucion
- BancoSangre
- Territorio
- TipoInstitucion
- RelacionInstitucional
- RegistroAuditoriaInstitucional

### Relaciones conceptuales

```text
Territorio 1 ---- N Institucion
Institucion 1 ---- N BancoSangre
TipoInstitucion 1 ---- N Institucion
Institucion 1 ---- N RelacionInstitucional
```

Estado: el esquema físico aún no está publicado en el repositorio `databases`; por tanto, estas entidades se consideran modelo lógico objetivo y no deben presentarse como tablas implementadas.

Responsabilidades adicionales previstas por el SRS (consulta compuesta de auditoría, ST2, y analítica de solo lectura, M7) requerirán proyecciones locales o contratos de lectura. Su modelado queda pendiente de decisión arquitectónica y no se declara aquí: este DD no inventa entidades para ello.

## 7.3 Campañas

### Responsabilidad

Campañas administra campañas, cupos y reservas.

### Entidades lógicas vigentes

- Campania
- ReservaCupo
- RegistroAuditoriaCampanias

La implementación actual utiliza el cupo como atributos de `campania` y no como tabla independiente. Esto evita una transacción distribuida para reservar.

`ReservaCupo` soporta RF-15 (prioridad Could, no comprometido para la V1 en el SRS V3): el esquema existe en `db_campana` (migración V001), pero el incremento del Sprint 3 no expone operaciones de reserva.

### Relaciones

```text
Campania 1 ---- N ReservaCupo
Campania 1 ---- N RegistroAuditoriaCampanias (por referencia lógica de recurso)
```

`institucion_id`, `creada_por` y `usuario_id` son referencias lógicas hacia otros contextos.

## 7.4 Donación

### Responsabilidad

Donación es propietario de los datos relacionados con:

- registro de donantes dentro del alcance funcional del servicio;
- donaciones;
- unidades y su ciclo de vida;
- inventario;
- alertas;
- trazabilidad;
- transferencias;
- escalamiento;
- proyecciones locales necesarias para evitar consultas directas a otros servicios;
- outbox de eventos.

### Entidades lógicas objetivo

- Donante
- Donacion
- Unidad
- HistorialUnidad
- Inventario
- Alerta
- Transferencia
- Escalamiento
- ProyeccionCampania
- EventoOutbox
- RegistroAuditoriaDonacion

Estado: el servicio de Donación tiene implementación de persistencia, Kafka y Outbox, pero el repositorio central `databases` aún no publica un esquema Flyway aprobado para `db_donacion`. Por ello, este DD no inventa nombres físicos definitivos de tablas o columnas de Donación.

`ProyeccionCampania` se alimenta de los eventos que publica Campañas; Donación no consulta a Campañas por HTTP.

### Proceso de vencimiento

Las unidades vencidas se detectan mediante un proceso programado del servicio que se ejecuta cada 5 minutos, evalúa en UTC y debe retirar las unidades vencidas del inventario disponible dentro de un umbral de 15 minutos (EC-13). La transición a vencida es una acción automática atribuida al actor técnico `sistema` (`actor_tipo`, sección 9.7), no a un usuario. Este DD no fija nombres físicos de tablas ni de columnas para ello.

## 7.5 Notificaciones

Notificaciones no posee base de negocio en la línea arquitectónica vigente.

Puede procesar en memoria o mediante mecanismos técnicos de mensajería la información necesaria para:

- consumir eventos;
- evitar duplicados;
- reintentar;
- registrar resultados técnicos mediante observabilidad.

No es propietario de:

- usuarios;
- instituciones;
- campañas;
- donaciones;
- unidades;
- inventario.

La deduplicación debe basarse en el identificador del evento (SDD, sección 11.3). Si requiriera memoria durable propia, la decisión corresponde a un nuevo ADR (sección 21). El origen de los datos de contacto del destinatario, sin leer bases ajenas y con payload mínimo, está pendiente de diseño.

# 8. Referencias entre contextos

Una referencia externa:

- no es una FK física;
- no autoriza acceso a la base remota;
- no garantiza consistencia transaccional distribuida;
- debe ser un identificador estable;
- debe contener únicamente la información mínima necesaria.

Ejemplos:

| Contexto origen | Campo lógico | Propietario real |
|---|---|---|
| Identidad | `institucion_id` en jurisdicción | Institucional |
| Campañas | `institucion_id` | Institucional |
| Campañas | `usuario_id` de reserva | Identidad / sujeto autenticado |
| Donación | `campania_id` | Campañas |
| Donación | `institucion_id` | Institucional |
| Auditoría | `actor_id` | Contexto que emite identidad |

Cuando un servicio necesita reaccionar a un cambio de otro contexto, lo hace mediante un evento y, cuando se justifica, mantiene una proyección local.

# 9. Modelo físico implementado - Identidad

## 9.1 Tabla `rol`

| Columna | Tipo | Null | Restricción |
|---|---|---|---|
| `codigo` | varchar(20) | No | PK |
| `perfil` | varchar(80) | No | - |
| `ambito_admitido` | varchar(80) | No | - |

Roles cargados inicialmente:

- donante;
- operador;
- admin_banco;
- coordinador;
- admin_nacional;
- auditor.

## 9.2 Tabla `usuario`

| Columna | Tipo | Null | Restricción |
|---|---|---|---|
| `id` | uuid | No | PK, `gen_random_uuid()` |
| `correo` | varchar(160) | No | UNIQUE |
| `nombre` | varchar(120) | Sí | - |
| `credencial_hash` | varchar(200) | No | Nunca credencial en claro |
| `rol_id` | varchar(20) | No | FK interna a `rol(codigo)` |
| `activo` | boolean | No | default true |
| `ultimo_acceso_en` | timestamptz | Sí | - |
| `creado_en` | timestamptz | No | default now() |
| `actualizado_en` | timestamptz | No | default now() |

## 9.3 Tabla `usuario_jurisdiccion`

| Columna | Tipo | Null | Regla |
|---|---|---|---|
| `id` | uuid | No | PK |
| `usuario_id` | uuid | No | FK interna a `usuario` |
| `ambito` | varchar(20) | No | territorio o institucion |
| `territorio_codigo` | varchar(5) | Según ámbito | Requerido para territorio |
| `territorio_ruta` | varchar(32) | Según ámbito | Requerido para territorio |
| `institucion_id` | uuid | Según ámbito | Referencia lógica externa |
| `asignada_por` | uuid | No | Actor que asigna |
| `vigente_desde` | timestamptz | No | default now() |
| `vigente_hasta` | timestamptz | Sí | Debe ser posterior a inicio |

La restricción `ck_jurisdiccion_coherente` impide mezclar territorio e institución en una misma asignación.

## 9.4 Tabla `sesion`

| Columna | Tipo | Null | Regla |
|---|---|---|---|
| `id` | uuid | No | PK |
| `usuario_id` | uuid | No | FK interna |
| `secreto_hash` | varchar(200) | No | Solo hash |
| `emitida_en` | timestamptz | No | default now() |
| `expira_en` | timestamptz | No | Máximo 8 horas |
| `renovada_en` | timestamptz | Sí | - |
| `revocada_en` | timestamptz | Sí | - |
| `motivo_revocacion` | varchar(30) | Sí | catálogo cerrado |
| `origen` | varchar(45) | Sí | dato técnico |

La base impide sesiones de vigencia absoluta superior a ocho horas.

## 9.5 Tabla `credencial_servicio`

| Columna | Tipo | Null | Regla |
|---|---|---|---|
| `id` | uuid | No | PK |
| `cliente` | varchar(40) | No | UNIQUE; catálogo |
| `secreto_hash` | varchar(200) | No | Nunca secreto en claro |
| `activa` | boolean | No | default true |
| `creada_en` | timestamptz | No | default now() |
| `rotada_en` | timestamptz | Sí | - |

## 9.6 Tabla `llave_firma`

| Columna | Tipo | Null | Regla |
|---|---|---|---|
| `kid` | varchar(80) | No | PK |
| `clave_publica_pem` | text | No | Solo clave pública |
| `activa_desde` | timestamptz | No | - |
| `retirada_en` | timestamptz | Sí | Posterior a activación |

La clave privada permanece fuera de la base y del control de versiones.

## 9.7 Tabla `registro_auditoria_ident`

| Columna | Tipo | Null | Regla |
|---|---|---|---|
| `id` | uuid | No | PK |
| `actor_tipo` | varchar(20) | No | usuario / sistema / anonimo |
| `actor_id` | varchar(64) | Sí | nulo para anónimo |
| `rol` | varchar(40) | Sí | - |
| `jurisdiccion_solicitada` | varchar(80) | Sí | - |
| `operacion` | varchar(80) | No | - |
| `recurso_tipo` | varchar(40) | No | - |
| `recurso_id` | uuid | Sí | - |
| `resultado` | varchar(20) | No | permitido / denegado |
| `correlacion_id` | varchar(36) | No | trazabilidad |
| `origen` | varchar(45) | Sí | - |
| `ocurrido_en` | timestamptz | No | default now() |

La tabla es append-only: el rol de servicio solo puede leer e insertar; triggers bloquean UPDATE, DELETE y TRUNCATE.

# 10. Modelo físico implementado - Campañas

## 10.1 Tabla `campania`

| Columna | Tipo | Null | Regla |
|---|---|---|---|
| `id` | uuid | No | PK |
| `institucion_id` | uuid | No | Referencia lógica externa |
| `territorio_codigo` | varchar(5) | No | DIVIPOLA |
| `territorio_ruta` | varchar(32) | No | Filtrado de jurisdicción |
| `nombre` | varchar(160) | No | - |
| `descripcion` | varchar(500) | Sí | - |
| `sede` | varchar(200) | No | - |
| `inicia_en` | timestamptz | No | - |
| `termina_en` | timestamptz | No | > `inicia_en` |
| `cupo_total` | integer | Sí | nulo = ilimitado |
| `cupo_reservado` | integer | No | default 0 |
| `estado` | varchar(20) | No | borrador/publicada/cerrada/cancelada |
| `publicada_en` | timestamptz | Según estado | requerida para publicada/cerrada |
| `creada_por` | uuid | No | referencia lógica |
| `creada_en` | timestamptz | No | default now() |
| `actualizada_en` | timestamptz | No | default now() |

Restricciones importantes:

- fecha de cierre posterior al inicio;
- cupo reservado nunca negativo;
- cupo reservado nunca superior a cupo total;
- una campaña publicada o cerrada debe tener `publicada_en`.

Índices:

- `ix_campania_estado_termina`;
- `ix_campania_territorio`;
- `ix_campania_institucion`.

## 10.2 Tabla `reserva_cupo`

| Columna | Tipo | Null | Regla |
|---|---|---|---|
| `id` | uuid | No | PK |
| `campania_id` | uuid | No | FK interna a `campania` |
| `usuario_id` | uuid | No | referencia lógica externa |
| `estado` | varchar(20) | No | pendiente/confirmada/liberada/cancelada |
| `creada_en` | timestamptz | No | default now() |
| `expira_en` | timestamptz | No | máximo 24 h |
| `confirmada_en` | timestamptz | Sí | - |
| `cerrada_en` | timestamptz | Sí | - |

Índices:

- `ix_reserva_estado_expira`;
- `ix_reserva_campania`.

Esta tabla soporta RF-15 (prioridad Could, no comprometido para la V1 en el SRS V3). El esquema existe, pero el incremento del Sprint 3 no expone operaciones de reserva (sección 7.3).

## 10.3 Tabla `registro_auditoria_camp`

Mantiene la misma estructura conceptual de auditoría que Identidad:

- actor;
- rol;
- jurisdicción;
- operación;
- tipo e identificador de recurso;
- resultado;
- correlación;
- origen;
- fecha.

También es append-only mediante permisos y triggers.

# 11. Modelo físico pendiente - Donación e Institucional

Al cierre del Sprint 3, el repositorio central de bases declara:

- `db_donacion`: base vacía, pendiente del esquema aprobado;
- `db_institucional`: base vacía, pendiente del esquema aprobado.

Por lo tanto:

- este DD mantiene su modelo lógico y reglas;
- no declara tablas físicas ficticias;
- no inventa migraciones;
- no asigna nombres SQL definitivos no verificados;
- la aprobación del esquema deberá producir nuevas migraciones Flyway.

Esta distinción es deliberada: documentar un diseño objetivo no equivale a afirmar que ya está implementado.

«Base vacía» describe el repositorio central `databases` (sin migraciones aprobadas); no implica que el servicio de Donación carezca de persistencia (sección 7.4).

# 12. Diccionario de datos - criterios generales

Cada atributo oficial debe documentar:

| Elemento | Significado |
|---|---|
| Nombre | Nombre lógico o físico vigente. |
| Descripción | Significado funcional. |
| Tipo | Tipo lógico y, cuando existe, PostgreSQL. |
| Obligatorio | Si admite ausencia. |
| Clasificación | Personal, operacional, auditoría, etc. |
| Propietario | Servicio responsable. |
| Restricciones | Integridad, unicidad, catálogo, rango. |
| Fuente | Usuario, sistema, evento o cálculo. |
| Retención | Regla de conservación cuando aplique. |

# 13. Clasificación de información

| Clasificación | Ejemplos | Tratamiento |
|---|---|---|
| Personal | nombre, correo, identificadores personales autorizados | acceso por necesidad y jurisdicción |
| Operacional restringida | campaña, inventario, unidades, transferencias | solo perfiles autorizados |
| Auditoría | actor, operación, resultado, fecha, correlación | append-only, sin contenido sensible |
| Técnica | IDs de correlación, estado de entrega, métricas | mínima y sin secretos |
| Prohibida | información clínica no contemplada en el alcance | no capturar, persistir, transmitir ni registrar |

# 14. Datos prohibidos

El modelo oficial no debe contener información clínica que permita inferir o almacenar diagnósticos, resultados de laboratorio u otros datos fuera del alcance funcional.

Por tanto, no forman parte del DD V3:

- resultados de pruebas diagnósticas;
- hemoglobina u otras mediciones clínicas;
- información de pacientes o transfusiones;
- reacciones adversas;
- razones clínicas detalladas de no aptitud;
- cualquier texto libre que revele información clínica prohibida.

Cuando una operación requiera indicar una condición de negocio sin exponer su causa clínica, se persiste únicamente el estado mínimo necesario permitido por el SRS.

# 15. Integridad

La integridad se aplica en dos capas:

## 15.1 Integridad en PostgreSQL

Se utilizan:

- PK;
- FK internas al mismo contexto;
- NOT NULL;
- UNIQUE;
- CHECK;
- índices únicos;
- triggers para restricciones especiales;
- defaults controlados.

## 15.2 Integridad en dominio

Las reglas que no corresponden a una restricción relacional se verifican en el servicio propietario:

- autorización;
- transición de estados;
- jurisdicción;
- reglas de ciclo de vida;
- idempotencia de eventos;
- validaciones que dependen de contexto.

# 16. Consistencia e integración

La consistencia fuerte solo se garantiza dentro de la base local del servicio.

Para cambios que deben producir eventos:

```text
Transacción local
    |
    +-- actualiza estado de negocio
    |
    +-- inserta evento en Outbox
    |
    v
publicador asíncrono
    |
    v
Kafka
    |
    v
consumidor(es)
```

Esto evita una transacción distribuida entre PostgreSQL y Kafka.

Los consumidores deben tolerar:

- reintentos;
- entrega repetida;
- demora;
- consistencia eventual.

# 17. Auditoría

Los registros de auditoría deben almacenar el hecho de la operación, no el contenido completo del recurso.

Campos mínimos esperados:

- actor;
- rol;
- jurisdicción;
- operación;
- recurso/tipo;
- identificador;
- resultado;
- correlación;
- origen;
- fecha/hora.

Las tablas implementadas de Identidad y Campañas son de solo anexado.

# 18. Roles y permisos

Para las bases con esquema implementado se utilizan roles separados:

| Rol | Función |
|---|---|
| `postgres` | Inicialización local controlada. |
| `*_propietario` | Aplicación de migraciones y administración del esquema. |
| `*_servicio` | Ejecución normal del servicio con permisos mínimos. |

Reglas:

- el servicio no usa superusuario;
- el gateway no pertenece a redes de datos;
- un servicio no recibe credenciales de otra base;
- las tablas de auditoría no otorgan UPDATE ni DELETE al rol de servicio.

# 19. Migraciones

Flyway es el mecanismo de versionado del esquema.

Reglas:

1. una migración aplicada no se edita;
2. todo cambio se agrega como nueva versión;
3. el checksum permite detectar alteraciones;
4. una migración pertenece a una única base;
5. los scripts se revisan por Pull Request;
6. el esquema documentado debe actualizarse junto con la migración.

Estado actual:

| Base | Migraciones |
|---|---|
| Identidad | V001 esquema inicial; V002 auditoría; V003 llave de firma |
| Campañas | V001 esquema inicial; V002 auditoría |
| Donación | Pendientes en repositorio central |
| Institucional | Pendientes en repositorio central |

# 20. Respaldo y recuperación

Cada base debe poder:

- respaldarse de forma independiente;
- restaurarse sin restaurar las demás;
- validar integridad posterior a la restauración;
- conservar trazabilidad de la prueba;
- utilizar secretos separados por ambiente.

La recuperación no autoriza temporalmente accesos cruzados entre bases.

# 21. Estado de implementación y brechas

| Elemento | Estado | Acción |
|---|---|---|
| `db_identidad` | Implementado | Mantener DD sincronizado con migraciones |
| `db_campana` | Implementado | Mantener DD sincronizado con migraciones |
| `db_donacion` | Esquema central pendiente | Publicar migraciones aprobadas |
| `db_institucional` | Esquema central pendiente | Publicar migraciones aprobadas |
| Esquema físico de Donación | El servicio persiste con el esquema que despliega actualmente; la fuente de verdad central está pendiente | Publicar las migraciones aprobadas y conciliarlas con el esquema desplegado (riesgo de divergencia) |
| Reserva de cupo (RF-15) | Esquema disponible en `db_campana`; sin operación expuesta en el incremento | Confirmar su prioridad en el SRS V4 |
| Responsabilidades previstas de Institucional | Consulta compuesta de auditoría y analítica sin modelo de datos | Decidir el mecanismo (proyecciones locales o contratos de lectura) |
| Notificaciones | Sin base de negocio | Mantener esa regla salvo nuevo ADR |
| Diccionario histórico | Contiene elementos demasiado genéricos/obsoletos | Sustituir por definición alineada a esquemas reales |
| Modelo conceptual antiguo | Incluye datos clínicos fuera de alcance | No usar como fuente normativa |
| Nombres de bases antiguos | `identity_db`, `campaigns_db`, etc. | Usar `db_identidad`, `db_campana`, `db_donacion`, `db_institucional` |

# 22. Trazabilidad

La trazabilidad esperada es:

```text
Requisito / regla de negocio
   |
   v
Entidad y atributo lógico
   |
   v
Servicio propietario
   |
   v
Tabla / columna (si está implementada)
   |
   v
Migración Flyway
   |
   v
Repositorio del servicio
   |
   v
Prueba
```

Ejemplos:

| Necesidad | Modelo | Implementación |
|---|---|---|
| sesión con vigencia controlada | Sesion | `sesion` + `ck_sesion_ocho_horas` |
| jurisdicción de usuario | UsuarioJurisdiccion | `usuario_jurisdiccion` + check de coherencia |
| cupo de campaña | Campania / ReservaCupo | `campania.cupo_total`, `cupo_reservado`, `reserva_cupo` |
| auditoría inmutable | RegistroAuditoria | tablas `registro_auditoria_*` + triggers |
| claves públicas de firma | LlaveFirma | `llave_firma` |

# 23. Reglas de mantenimiento

El DD V3 debe actualizarse cuando:

- se cree o elimine una tabla;
- cambie un atributo persistente;
- cambie una FK interna;
- cambie una referencia entre contextos;
- cambie el servicio propietario;
- se introduzca una nueva migración;
- cambie la clasificación de un dato;
- cambie la política de retención;
- se modifique el mecanismo de backup;
- un ADR modifique persistencia o integración;
- se formalice el esquema de Donación o Institucional.

# 24. Criterio de cierre de la V3

La V3 se considera coherente para la entrega de Semana 10 cuando:

- las cuatro bases y sus propietarios coinciden con SAD e Infraestructura;
- Notificaciones se mantiene sin base de negocio;
- no se documentan FK entre servicios;
- no se documenta comunicación mediante base compartida;
- los nombres y columnas de Identidad/Campañas coinciden con las migraciones reales;
- Donación/Institucional se identifican claramente como esquemas físicos aún pendientes;
- no aparecen datos clínicos prohibidos;
- el diccionario distingue entre atributos implementados y modelo objetivo;
- el DD no se cita como fuente de la matriz de autorización ni del catálogo de operaciones.

# Anexo A. Resumen del diccionario implementado

## A.1 Identidad

| Tabla | Propósito |
|---|---|
| `rol` | Catálogo de perfiles de sesión |
| `usuario` | Cuenta de acceso |
| `usuario_jurisdiccion` | Ámbito territorial/institucional |
| `sesion` | Ciclo de sesión y renovación |
| `credencial_servicio` | Credenciales de actores técnicos |
| `llave_firma` | Claves públicas para validación |
| `registro_auditoria_ident` | Auditoría append-only |

## A.2 Campañas

| Tabla | Propósito |
|---|---|
| `campania` | Campañas y control de cupo |
| `reserva_cupo` | Reservas de cupo |
| `registro_auditoria_camp` | Auditoría append-only |

# Anexo B. Decisiones de consistencia de esta versión

1. Los nombres oficiales de bases son `db_identidad`, `db_campana`, `db_donacion` y `db_institucional`.
2. Notificaciones no se modela con base de negocio.
3. El documento histórico que incluye pruebas de laboratorio, pacientes y reacciones no se considera modelo vigente.
4. Las tablas físicas de Identidad y Campañas se documentan desde las migraciones reales.
5. No se inventan tablas físicas para Donación e Institucional mientras no existan migraciones aprobadas.
6. Kafka y Transactional Outbox son parte de la estrategia de consistencia entre servicios, no del modelo relacional compartido.
7. Ningún consumidor de eventos adquiere propiedad sobre los datos del productor.
8. En este conjunto documental «DD» significa Data Design Document; no contiene la matriz de autorización (ADR-011) ni el catálogo de operaciones (OpenAPI).
9. El proceso de vencimiento de Donación (cada 5 minutos, UTC) se documenta como regla operativa en la sección 7.4, sin fijar nombres físicos.
10. La asignación de jurisdicción (RF-22) se documenta como operación de Identidad.
