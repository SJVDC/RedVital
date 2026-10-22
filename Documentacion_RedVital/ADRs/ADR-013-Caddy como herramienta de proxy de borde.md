# ADR-[13] — [Caddy como herramienta de proxy de borde]

| Campo                        | Contenido                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| **Identificador y título**   | ADR-[13]. [Caddy como herramienta de proxy de borde].                                 |
| **Estado**                   | Aceptada. Deliberada y aprobada en Mesa de Arquitectura del 22 de septiembre de 2026. |
| **Restricciones aplicables** | [Ej. RN-XX, RI-XX].                                                                   |
| **Fecha**                    | 22 de septiembre de 2026.                                                             |

---

## Contexto

La evolución de la topología de despliegue de RedVital hacia una arquitectura distribuida por contextos acotados exige un único punto de entrada en el borde de la red. Este componente es responsable de centralizar la terminación TLS, la inyección de cabeceras de seguridad y el límite de tasa (_rate limiting_) antes de que el tráfico alcance el API Gateway interno, el cual está gestionado por YARP según lo definido en el ADR-007.

Adicionalmente, el proyecto ha establecido como medida para mitigar riesgos la obligatoriedad de mantener una paridad estricta entre ambientes (tarea T-305). Esto incluye el requerimiento innegociable de operar con conexiones seguras a través de TLS desde el entorno local de Desarrollo, previniendo así fallos relacionados con _cookies_ seguras, políticas CORS y cabeceras que históricamente solo se manifiestan de forma tardía al desplegar en QA o Producción.

Para resolver esta necesidad arquitectónica y operativa, se deben evaluar las dos alternativas más viables en la industria: Nginx y Caddy. 

---

## Opciones consideradas

### Opción A — [Nginx]

Nginx es el estándar consolidado en proxies inversos. En RedVital, operaría en el borde aplicando límite de tasa mediante zonas de memoria compartida e inyectando cabeceras de seguridad antes de enrutar el tráfico hacia YARP. Su madurez estructural garantiza el soporte para cualquier patrón de enrutamiento que exija el proyecto.

El compromiso principal es la carga operativa para cumplir la paridad de ambientes (T-305). Nginx carece de gestión TLS nativa: exige emitir y confiar en certificados manualmente en el entorno de Desarrollo local (usando herramientas como `mkcert`), y obliga a incorporar un proceso adicional con `certbot` y tareas programadas para renovar certificados en Producción.

**Descartada.**

### Opción B — [Caddy]

Caddy es un proxy inverso moderno que destaca por su configuración segura por defecto. En RedVital, centralizaría el enrutamiento hacia YARP, la inyección de cabeceras HTTP y el límite de tasa mediante un archivo de configuración (Caddyfile) significativamente más conciso. Su diseño declarativo reduce la curva de aprendizaje del equipo y simplifica la mantenibilidad a largo plazo.

La ventaja crítica de Caddy para cumplir la paridad de ambientes exigida (T-305) es su gestión automática de TLS. Resuelve de forma nativa la emisión y renovación de certificados en Producción (vía Let's Encrypt), y genera automáticamente una autoridad certificadora local para aprovisionar certificados de confianza en el entorno de Desarrollo. Esto elimina por completo la necesidad de mantener herramientas externas o contenedores adicionales para la rotación de claves.

**Seleccionada.**

---

## Compromiso evaluado

**Se gana:** Paridad estricta de ambientes con cero dependencias operativas externas. La gestión nativa de TLS cumple directamente el requerimiento de operar con conexiones seguras en Desarrollo (mediante su autoridad certificadora local) y en Producción (vía Let's Encrypt) sin requerir contenedores auxiliares ni tareas programadas para la rotación de certificados. Adicionalmente, el modelo declarativo del _Caddyfile_ simplifica drásticamente la inyección de cabeceras y el límite de tasa, reduciendo la carga de mantenimiento para el equipo.

**Se sacrifica:** El extenso ecosistema de documentación comunitaria y casos de borde resueltos que posee Nginx tras décadas en la industria. Ante un escenario de configuración anómalo, la literatura disponible para depurar Caddy es considerablemente menor. Asimismo, el consumo base de memoria de Caddy es marginalmente superior al de Nginx, un trade-off que se asume como aceptable y quedará medido en la tarea de validación de recursos del anfitrión (T-411).
- - -

## Decisión

1. **Se adopta Caddy como proxy de borde para el sistema**, centralizando el límite de tasa y la inyección de cabeceras de seguridad antes de enrutar el tráfico externo hacia el API Gateway interno (YARP).

2. **La gestión de certificados TLS será nativa y automática**, operando con Let's Encrypt en Producción y con la autoridad certificadora local generada por Caddy para garantizar la paridad estricta en el entorno de Desarrollo.

3. **La configuración se consolidará en un único archivo declarativo (Caddyfile)**, prohibiendo explícitamente la introducción de contenedores auxiliares, dependencias operativas o tareas programadas externas para la rotación de claves.

---

## Justificación

La elección de Caddy se fundamenta en su capacidad para resolver la complejidad operativa del entorno de despliegue con una fracción del esfuerzo de configuración y mantenimiento requerido por Nginx. Mientras Nginx exige orquestar múltiples piezas móviles —como contenedores auxiliares con clientes ACME, cronjobs y recargas manuales del proceso— para sostener el cifrado y la rotación de claves, Caddy encapsula todo el ciclo de vida de los certificados TLS de forma nativa. Este mérito técnico es determinante: el sacrificio de optar por una herramienta con un ecosistema comunitario ligeramente menor frente al estándar histórico se compensa ampliamente al eliminar puntos de fallo en la infraestructura. Además, la sintaxis declarativa del _Caddyfile_ permite implementar los controles de límite de tasa y las cabeceras de seguridad con mayor agilidad, reduciendo la carga cognitiva sobre el equipo.

Esta decisión se alinea de forma directa con la exigencia estructural de mantener una paridad estricta entre ambientes (tarea T-305), garantizando que el entorno de Desarrollo opere con conexiones seguras mediante una autoridad certificadora local generada automáticamente, sin demandar configuraciones manuales en cada estación de trabajo. Asimismo, la adopción de Caddy protege la topología distribuida al evitar la adición de servicios extra a los catorce contenedores ya planificados. El marginal incremento en el consumo de memoria respecto a Nginx es un compromiso aceptado que se cuantificará formalmente en la medición de recursos del anfitrión (tarea T-411), asegurando que el diseño de seguridad en el borde consolide la protección hacia el API Gateway interno (YARP, ADR-007) sin comprometer los tiempos de arranque estipulados.

---

## Vigencia de lo elegido

[Indica si esta decisión está sujeta a la vida útil de alguna tecnología, a una ventana de soporte específica (ej. versiones LTS), o si es aplicable de forma indefinida durante el ciclo de vida del proyecto.]

---
## Responsable y fecha de revisión

| Rol              | Responsabilidad                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ingeniero DevOps | Implementar y mantener el archivo declarativo _Caddyfile_, garantizando la gestión automática de certificados TLS, la inyección de cabeceras y la paridad estricta entre Desarrollo y Producción. |
| QA / Tester      | Verificar la correcta inyección de las cabeceras de seguridad en todos los ambientes y validar mediante pruebas que los límites de tasa rechacen adecuadamente el tráfico abusivo.\|              |

