# ADR-017: Adopción de una arquitectura de microservicios

- **Estado:** Propuesta
- **Versión:** 1.0
- **Fecha:** 2026-10-05
- **Autor:** Sara — Arquitecta de Software
- **Responsable de implementar:** Equipo de desarrollo e infraestructura
- **Fecha de revisión:** 2026-10-05
- **Ítems relacionados:** HU-318, T-318.1, T-318.2, T-318.3
- **ADR relacionado:** ADR-003, ADR-014

## Historial de cambios

| Versión | Fecha | Descripción del cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-10-05 | Creación inicial de la decisión sobre el estilo arquitectónico de Red Vital | Sara |

## Contexto

Red Vital requiere una arquitectura distribuida que permita separar las principales capacidades del sistema, desplegarlas de manera controlada y reducir el impacto que pueda producir el fallo o la evolución de un componente sobre los demás.

El ADR-003 estableció previamente la transición desde un monolito modular hacia una arquitectura distribuida, pero dejó abierta la selección del estilo arquitectónico concreto y señaló que no debía asumirse automáticamente una arquitectura de microservicios.

Desde esa decisión, la arquitectura y los requisitos del proyecto han evolucionado hacia componentes con responsabilidades delimitadas, contratos de comunicación explícitos, despliegues independientes, propiedad separada de datos y mecanismos de infraestructura orientados al aislamiento entre servicios.

El Tech Radar V3 clasifica actualmente los microservicios como una tecnología o enfoque a adoptar y el monolito modular como un enfoque a evitar. Además, diferentes decisiones y tareas del proyecto contemplan API Gateway, contenedores independientes, contratos de API, integración continua por repositorio, bases de datos separadas y despliegue independiente de los servicios.

Por lo anterior, es necesario cerrar formalmente la decisión que quedó abierta en ADR-003 y definir el estilo arquitectónico que regirá la evolución de Red Vital.

## Opciones consideradas

### 1. Monolito modular

Mantener una única aplicación desplegable, organizada internamente mediante módulos funcionales.

**Ventajas:**
- Menor complejidad operacional.
- Comunicación interna sencilla.
- Despliegue y pruebas de integración más simples.

**Desventajas:**
- Mayor acoplamiento entre capacidades durante el despliegue.
- Un cambio puede requerir desplegar la aplicación completa.
- Menor aislamiento ante fallos.
- No satisface adecuadamente la orientación distribuida adoptada por el proyecto.

### 2. Arquitectura distribuida orientada a servicios sin adoptar formalmente microservicios

Mantener diferentes componentes distribuidos y comunicados por red, sin establecer como requisito una independencia explícita de despliegue, responsabilidad y propiedad de datos para cada servicio.

**Ventajas:**
- Permite conservar flexibilidad sobre la granularidad y organización interna.
- Reduce algunas exigencias operacionales asociadas con microservicios.

**Desventajas:**
- Mantiene ambigüedad sobre los límites arquitectónicos de cada servicio.
- Puede permitir dependencias fuertes entre componentes.
- Dificulta establecer criterios uniformes de despliegue, propiedad de datos y evolución independiente.
- No refleja con precisión las decisiones y artefactos que actualmente utiliza Red Vital.

### 3. Arquitectura de microservicios

Organizar Red Vital como un conjunto de servicios desplegables de manera independiente, con responsabilidades funcionales claramente delimitadas, contratos explícitos de comunicación y propiedad definida sobre los datos que administra cada servicio.

**Ventajas:**
- Permite evolución y despliegue independiente de los servicios.
- Mejora el aislamiento ante fallos.
- Facilita la separación de responsabilidades.
- Permite escalar o modificar capacidades específicas sin desplegar toda la solución.
- Es consistente con el API Gateway, los contratos de API, la separación de datos, los contenedores y los flujos de CI/CD definidos para el proyecto.

**Desventajas:**
- Aumenta la complejidad operacional.
- Introduce comunicación mediante red entre servicios.
- Requiere controlar explícitamente los contratos y su versionamiento.
- Exige mecanismos adicionales de observabilidad, despliegue y gestión de fallos.
- Obliga a gestionar cuidadosamente la consistencia y las dependencias entre servicios.

## Trade-off evaluado

La arquitectura de microservicios incrementa la complejidad operacional y de integración en comparación con un monolito modular o con una arquitectura distribuida menos estricta.

A cambio, Red Vital obtiene independencia de despliegue, aislamiento de fallos, separación explícita de responsabilidades y mayor capacidad para evolucionar servicios de manera independiente.

El equipo acepta esta complejidad adicional debido a que las restricciones de diseño y las decisiones arquitectónicas actuales del proyecto ya requieren componentes distribuidos, contratos definidos, separación de datos, contenedores independientes y mecanismos específicos de integración y despliegue.

## Decisión

Red Vital adopta una **arquitectura de microservicios** como estilo arquitectónico de la solución.

Cada microservicio deberá representar una capacidad funcional claramente delimitada y ser desplegable de manera independiente.

Los servicios deberán comunicarse mediante contratos explícitos y versionados, evitando dependencias directas sobre la implementación interna o los datos privados de otros servicios.

Cada servicio será responsable de los datos correspondientes a su capacidad funcional y no deberá acceder directamente a las bases de datos pertenecientes a otros servicios.

La granularidad definitiva de los microservicios y la identificación de los documentos y entradas del Tech Radar afectados por esta decisión se establecerán en la tarea T-318.2.

Esta decisión concreta el estilo arquitectónico distribuido establecido inicialmente por ADR-003. La relación definitiva de reemplazo o enmienda respecto de ADR-003 y ADR-014 se formalizará durante la aprobación de la decisión en la Mesa de Arquitectura, correspondiente a T-318.3.

## Justificación

La arquitectura de microservicios es la alternativa que mejor refleja las restricciones y decisiones actualmente adoptadas por Red Vital.

El proyecto requiere una solución distribuida y ya contempla separación de responsabilidades funcionales, contratos de API, API Gateway, bases de datos independientes, contenedores, integración continua por repositorio y despliegue independiente.

Mantener únicamente la denominación genérica de arquitectura distribuida dejaría sin resolver los criterios de independencia y responsabilidad que actualmente orientan el diseño y la implementación.

Formalizar el uso de microservicios permite mantener consistencia entre la arquitectura implementada, el SAD, los diagramas C4, el SDD, la documentación de infraestructura, el Tech Radar y los demás artefactos del proyecto.

## Consecuencias

A partir de esta decisión:

- Los documentos de arquitectura deberán utilizar de manera consistente el término **microservicio** cuando corresponda.
- Los límites y la granularidad definitiva de los microservicios deberán quedar documentados.
- Cada microservicio deberá tener una responsabilidad funcional delimitada.
- Los servicios deberán comunicarse mediante contratos explícitos y versionados.
- No se permitirá acceso directo entre las bases de datos privadas de diferentes microservicios.
- Los despliegues deberán permitir operar y actualizar servicios de manera independiente cuando la infraestructura lo permita.
- Los diagramas C4, SAD, SDD, DD, documentación de infraestructura y Tech Radar deberán revisarse para conservar consistencia con esta decisión.
- La arquitectura requerirá observabilidad y controles operacionales apropiados para un sistema distribuido.
- Las decisiones anteriores que entren en conflicto con este ADR deberán marcarse como reemplazadas o enmendadas una vez ADR-017 sea aprobado.