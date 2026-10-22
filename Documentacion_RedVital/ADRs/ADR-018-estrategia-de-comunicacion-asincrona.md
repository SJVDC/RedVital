# ADR-018: Estrategia de comunicación entre microservicios y adopción de Apache Kafka

- **Estado:** Propuesta
- **Versión:** 1.0
- **Fecha:** 2026-10-05
- **Autor:** Sara — Arquitecta de Software
- **Responsable de implementar:** Equipo de desarrollo e infraestructura
- **Fecha de revisión:** 2026-10-05
- **Ítems relacionados:** HU-319, T-319.1, T-319.2, T-319.3
- **ADR relacionado:** ADR-014, ADR-017

## Historial de cambios

| Versión | Fecha | Descripción del cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-10-05 | Creación de la decisión sobre comunicación entre microservicios y adopción de Apache Kafka | Sara |

---

## Contexto

ADR-017 formaliza una arquitectura de microservicios para Red Vital.

Esta arquitectura requiere que los servicios se comuniquen mediante contratos explícitos y que ningún microservicio acceda directamente a la base de datos privada de otro.

El análisis realizado en T-319.1 identificó dos tipos principales de interacción:

1. comunicaciones síncronas que requieren una respuesta inmediata;
2. comunicaciones asíncronas asociadas a hechos ocurridos dentro del dominio.

Las comunicaciones síncronas pueden resolverse mediante APIs HTTP cuando el servicio solicitante necesita información para continuar una operación.

Un ejemplo vigente es la interacción entre Donación y Campañas. T-306.4 define un adaptador hacia Campañas con un tiempo máximo de espera de 3 segundos, resultado tipado y degradación controlada.

Las comunicaciones asíncronas corresponden a hechos que pueden ser procesados por otros servicios después de que la operación original haya finalizado.

Entre los eventos identificados en la documentación se encuentran:

- `donation.completed`;
- `blood-unit.created`;
- `blood-unit.state-changed`;
- `transfusion.completed`;
- `stock.below-threshold`.

El benchmark de T-319.1 comparó HTTP, Transactional Outbox, RabbitMQ y Apache Kafka.

El análisis mostró que estas tecnologías no cumplen exactamente la misma función.

HTTP permite comunicación solicitud-respuesta.

Transactional Outbox ayuda a mantener consistencia entre una transacción de negocio y el evento que debe producir.

RabbitMQ permite mensajería asíncrona mediante colas y mecanismos de routing.

Kafka proporciona un modelo de eventos persistentes basado en topics, particiones y consumidores independientes.

El equipo ha decidido adoptar Apache Kafka como plataforma de eventos de Red Vital.

---

## Opciones consideradas

### 1. Utilizar únicamente HTTP entre microservicios

Todas las comunicaciones entre servicios se realizan mediante APIs HTTP.

#### Ventajas

- Implementación sencilla.
- Amplio soporte en las tecnologías utilizadas por el proyecto.
- Compatible con los contratos OpenAPI existentes.
- Fácil de probar y observar.
- Adecuado para operaciones que requieren una respuesta inmediata.
- Menor infraestructura adicional.

#### Desventajas

- Genera acoplamiento temporal entre servicios.
- El consumidor depende de que el proveedor se encuentre disponible.
- Las cadenas de llamadas pueden propagar fallos.
- No proporciona persistencia ni replay de eventos.
- Dificulta distribuir un mismo hecho a varios consumidores independientes.

Esta alternativa se considera adecuada únicamente para las interacciones que requieren respuesta inmediata.

---

### 2. HTTP + Transactional Outbox

Las operaciones síncronas utilizan HTTP y los eventos se almacenan mediante una bandeja de salida dentro de la base de datos del servicio productor.

#### Ventajas

- Permite registrar el cambio de negocio y el evento dentro de una misma transacción local.
- Reduce el riesgo de perder eventos.
- Evita utilizar transacciones distribuidas.

#### Desventajas

- Transactional Outbox no proporciona por sí solo un mecanismo completo de distribución.
- Requiere implementar un proceso de publicación.
- No resuelve directamente la distribución hacia varios consumidores.
- Sería necesario construir infraestructura adicional para transportar los eventos.

Por esta razón, Transactional Outbox se considera un complemento de la solución y no un reemplazo de un broker o plataforma de eventos.

---

### 3. HTTP + Transactional Outbox + RabbitMQ

Las comunicaciones que requieren respuesta inmediata utilizan HTTP.

Los eventos se registran mediante Transactional Outbox y posteriormente se publican mediante RabbitMQ.

#### Ventajas

- Reduce el acoplamiento temporal.
- Permite procesamiento asíncrono.
- Proporciona acknowledgements.
- Permite reintentos.
- Permite dead-letter queues.
- Tiene mecanismos flexibles de routing.
- Es adecuado para colas de trabajo y notificaciones.
- Presenta una complejidad operacional moderada.

#### Desventajas

- La reproducción histórica de eventos no constituye su principal modelo de uso.
- Agregar múltiples consumidores independientes puede requerir nuevas colas y bindings.
- Su modelo se orienta principalmente a entrega y procesamiento de mensajes.
- No proporciona un log de eventos persistente como elemento central de la arquitectura.

RabbitMQ cubre adecuadamente escenarios de mensajería tradicional, pero ofrece menos ventajas cuando los eventos deben mantenerse disponibles para distintos consumidores independientes y futuras capacidades del sistema.

---

### 4. HTTP + Transactional Outbox + Apache Kafka

Las operaciones que requieren una respuesta inmediata utilizan APIs HTTP.

Los hechos del dominio que no requieren respuesta inmediata se registran mediante Transactional Outbox y posteriormente se publican en Apache Kafka.

Conceptualmente:

```text
Operación de negocio
        │
        ├── cambio en datos
        │
        └── evento en Outbox
                  │
                  ▼
             Publicador
                  │
                  ▼
                Kafka
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
   Consumidor Consumidor Consumidor
```

#### Ventajas

- Permite comunicación asíncrona.
- Reduce el acoplamiento temporal.
- Mantiene eventos durante un periodo configurable.
- Permite replay.
- Soporta múltiples consumidores independientes.
- Permite incorporar nuevos consumidores sin modificar el productor.
- Facilita arquitecturas orientadas a eventos.
- Escala mediante topics y particiones.
- Puede soportar futuras capacidades de analítica y procesamiento de eventos.

#### Desventajas

- Introduce mayor complejidad operacional que RabbitMQ.
- Requiere diseñar topics, particiones y claves.
- Requiere gestionar consumer groups y offsets.
- Los consumidores deben diseñarse de manera idempotente.
- Requiere mayor observabilidad.
- Introduce infraestructura adicional para desarrollo, pruebas y despliegue.
- El equipo debe adquirir conocimiento específico sobre Kafka.

A pesar de estos costos, esta alternativa proporciona una base más adecuada para la evolución prevista de la arquitectura de Red Vital.

---

## Trade-off evaluado

RabbitMQ proporciona una solución más sencilla para mensajería tradicional y cubre adecuadamente escenarios de colas de trabajo, routing y notificaciones.

Apache Kafka introduce una mayor complejidad operacional y requiere conocimientos adicionales para administrar topics, particiones, consumer groups y offsets.

Sin embargo, Kafka permite que los eventos permanezcan disponibles después de haber sido consumidos, soporta múltiples consumidores independientes y permite replay.

Estas propiedades son relevantes para una arquitectura de microservicios en la que un mismo hecho puede ser utilizado actualmente o en el futuro por diferentes capacidades.

Por ejemplo:

```text
                    ┌──► Campañas
                    │
Donación ──► Kafka ─┼──► Notificaciones
                    │
                    └──► Analítica futura
```

El Servicio de Donación publica el hecho ocurrido sin necesitar conocer todos los consumidores presentes o futuros.

El equipo acepta la mayor complejidad operacional de Kafka a cambio de:

- mayor desacoplamiento entre productores y consumidores;
- persistencia de eventos;
- posibilidad de replay;
- múltiples consumidores independientes;
- capacidad de incorporar nuevos consumidores;
- una base tecnológica coherente con la evolución hacia una arquitectura orientada a eventos.

---

## Decisión

Red Vital adopta una estrategia híbrida de comunicación entre microservicios.

### Comunicación síncrona mediante APIs HTTP

Las interacciones que requieran una respuesta inmediata utilizarán APIs HTTP.

Cada microservicio expondrá únicamente las operaciones necesarias mediante contratos explícitos y versionados.

Los contratos HTTP deberán documentarse mediante OpenAPI cuando corresponda.

Ejemplo:

```text
Donación ───── HTTP / API ─────► Campañas
```

Este tipo de comunicación solamente deberá utilizarse cuando el servicio solicitante necesite la respuesta para continuar la operación actual.

Las llamadas síncronas deberán considerar:

- timeout;
- manejo de errores;
- degradación controlada cuando corresponda;
- trazabilidad;
- reintentos limitados;
- autenticación y autorización entre servicios cuando aplique.

Las APIs no permiten que un servicio acceda directamente a las bases de datos de otro.

---

### Comunicación asíncrona mediante Apache Kafka

Los hechos del dominio cuyo procesamiento no requiera una respuesta inmediata utilizarán Apache Kafka.

Los productores publicarán eventos en topics y los consumidores procesarán dichos eventos de manera independiente.

Conceptualmente:

```text
Microservicio productor
          │
          │ evento
          ▼
        Kafka
          │
     ┌────┼─────┐
     ▼    ▼     ▼
    S1    S2    S3
```

Kafka actuará como plataforma de distribución de eventos entre microservicios.

---

### Transactional Outbox

Cuando una operación de negocio deba generar un evento de manera confiable, se utilizará el patrón Transactional Outbox.

El cambio en los datos de negocio y el registro del evento pendiente deberán realizarse dentro de la misma transacción local.

Posteriormente, un proceso publicador enviará los eventos pendientes hacia Kafka.

Conceptualmente:

```text
Microservicio
      │
      ├── cambio de negocio
      │
      └── evento Outbox
               │
               ▼
           Publicador
               │
               ▼
             Kafka
```

Este mecanismo reduce el riesgo de confirmar una operación de negocio y perder posteriormente el evento asociado.

---

## Clasificación de las comunicaciones

La arquitectura utilizará el mecanismo de comunicación según la naturaleza de cada interacción.

| Tipo de interacción | Mecanismo |
|---|---|
| Usuario/Web → sistema | HTTP mediante Gateway |
| Solicitud-respuesta inmediata entre servicios | API HTTP |
| Hecho del dominio | Evento mediante Kafka |
| Cambio de negocio que debe producir evento confiablemente | Transactional Outbox + Kafka |
| Notificaciones | Kafka hacia el consumidor correspondiente |
| Varios consumidores interesados en el mismo hecho | Kafka |
| Integración directa mediante bases de datos | No permitida |

---

## Eventos iniciales

La documentación existente identifica como candidatos iniciales a publicación en Kafka:

| Evento | Descripción |
|---|---|
| `donation.completed` | Una donación terminó correctamente |
| `blood-unit.created` | Se generó una nueva unidad |
| `blood-unit.state-changed` | Una unidad cambió de estado |
| `transfusion.completed` | Una transfusión fue completada |
| `stock.below-threshold` | Las existencias quedaron por debajo del umbral definido |

La lista podrá evolucionar mediante contratos de eventos versionados.

---

## Topics

ADR-018 no define todavía la topología definitiva de topics.

La definición de:

- nombres de topics;
- número de particiones;
- claves de particionamiento;
- políticas de retención;
- consumer groups;
- esquemas de eventos;
- estrategia de versionamiento;

deberá realizarse en el diseño de integración correspondiente.

Esto evita convertir el ADR en una especificación de implementación detallada.

---

## Justificación

Kafka fue seleccionado porque permite desacoplar a los productores de los consumidores y mantener los eventos disponibles independientemente de que hayan sido procesados.

Esto permite que un microservicio publique un hecho sin conocer todas las capacidades que actualmente o en el futuro pueden necesitarlo.

Por ejemplo, una donación completada puede ser utilizada por:

- Campañas;
- Notificaciones;
- capacidades futuras de analítica;
- capacidades futuras de auditoría o generación de proyecciones.

Kafka también permite que un consumidor temporalmente indisponible continúe procesando eventos posteriormente.

La posibilidad de replay constituye además una ventaja para escenarios futuros donde sea necesario volver a procesar eventos o reconstruir determinadas proyecciones.

Aunque Kafka aumenta la complejidad operacional frente a RabbitMQ, el equipo acepta este costo como parte de la estrategia de arquitectura distribuida de Red Vital.

---

## Costos de la decisión

La adopción de Kafka implica costos adicionales.

### Infraestructura

Será necesario:

- desplegar Kafka en los entornos donde se pruebe la comunicación asíncrona;
- configurar conectividad entre productores, consumidores y Kafka;
- administrar topics;
- gestionar credenciales y configuración;
- incorporar Kafka al despliegue correspondiente.

---

### Desarrollo

Los servicios deberán implementar:

- productores de eventos;
- consumidores;
- serialización y deserialización;
- manejo de errores;
- idempotencia;
- correlación;
- estrategias de retry;
- control de eventos procesados cuando corresponda.

---

### Transactional Outbox

Los productores que requieran consistencia entre datos y eventos deberán:

- almacenar eventos pendientes;
- implementar un publicador;
- registrar estado de publicación;
- manejar publicaciones duplicadas;
- establecer mecanismos de limpieza o retención de la bandeja.

---

### Operación

Será necesario observar:

- disponibilidad de Kafka;
- retraso de consumidores;
- mensajes pendientes;
- fallos de publicación;
- fallos de consumo;
- consumer lag;
- estado de topics y particiones.

---

### Aprendizaje

El equipo deberá comprender:

- topics;
- particiones;
- offsets;
- producers;
- consumers;
- consumer groups;
- claves de particionamiento;
- entrega de eventos;
- idempotencia.

Este costo se considera aceptable frente a las capacidades obtenidas.

---

## Consecuencias

A partir de esta decisión:

- Red Vital utilizará APIs HTTP para comunicaciones que requieran respuesta inmediata.
- Las APIs HTTP deberán utilizar contratos explícitos y versionados.
- OpenAPI continuará documentando los contratos síncronos cuando corresponda.
- Kafka será la plataforma adoptada para comunicación asíncrona entre microservicios.
- Los hechos del dominio deberán modelarse como eventos cuando no requieran respuesta inmediata.
- Transactional Outbox se utilizará en operaciones donde deba garantizarse la relación entre una transacción local y la publicación posterior del evento.
- Los consumidores deberán diseñarse para tolerar reprocesamiento y duplicados cuando corresponda.
- Los servicios no deberán acceder directamente a las bases de datos de otros microservicios.
- Los diagramas C4 deberán reflejar Kafka en los niveles donde corresponda.
- El SAD y SDD deberán documentar la estrategia híbrida HTTP + Kafka.
- La documentación de infraestructura deberá incorporar Kafka cuando forme parte del entorno desplegado.
- El Tech Radar deberá actualizar Kafka para reflejar su adopción.
- RabbitMQ permanecerá documentado como alternativa evaluada pero no seleccionada por ADR-018.

---

## Relación con ADR-014

ADR-018 actualiza las decisiones de comunicación previamente asociadas a ADR-014.

ADR-014 mantiene vigencia para las decisiones que no entren en conflicto con este ADR.

ADR-018 prevalece específicamente en lo relacionado con:

- clasificación de comunicaciones síncronas y asíncronas;
- uso de APIs HTTP para solicitud-respuesta;
- uso de Apache Kafka para eventos;
- utilización de Transactional Outbox;
- desacoplamiento entre productores y consumidores;
- prohibición de utilizar bases de datos compartidas como mecanismo de integración.

---

## Relación con ADR-017

ADR-017 establece la arquitectura de microservicios.

ADR-018 complementa esa decisión definiendo cómo se comunicarán dichos microservicios.

En conjunto:

```text
ADR-017
Arquitectura de microservicios
          │
          ▼
ADR-018
HTTP para sincronía
Kafka para asincronía
Transactional Outbox para publicación confiable
```

---

## Estado de la decisión

Este ADR permanece en estado **Propuesta** hasta su revisión y aprobación mediante T-319.3 en la Mesa de Arquitectura.

Una vez aprobado:

- el estado deberá cambiar a `Aceptada`;
- deberá registrarse la aprobación en el historial de cambios;
- Kafka deberá reflejarse como tecnología adoptada en el Tech Radar;
- los documentos arquitectónicos dependientes deberán actualizarse para mantener consistencia con esta decisión.