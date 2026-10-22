# ADR-012 — Clasificación de la extensibilidad del dominio en ISO/IEC 25010:2023

| Campo | Contenido |
|---|---|
| **Identificador y título** | ADR-012. Clasificación de la extensibilidad del modelo de dominio como Flexibilidad — Adaptabilidad, y prioridad MoSCoW de la capacidad que habilita. |
| **Estado** | Aceptada. Deliberada y aprobada en Mesa de Arquitectura del 21 de septiembre de 2026. Complementa a ADR-005, base de datos relacional con esquema independiente por servicio, cuya referencia al catálogo de módulos anterior queda derogada por este registro. |
| **Restricciones aplicables** | RN-04 (ISO/IEC 25010:2023, revisión de nueve características), RI-01. |
| **Fecha** | 21 de septiembre de 2026. |

---

## Contexto

El sistema declara como atributo de calidad la capacidad de incorporar tipos de donación distintos de la sangre sin rehacer la trazabilidad ni el inventario. La restricción interna RI-01 la sustenta en el modelo de dominio, y el escenario de calidad correspondiente la verifica.

La norma ISO/IEC 25010:2023, adoptada en su revisión de nueve características, admite dos ubicaciones plausibles para ese atributo: **Mantenibilidad — Modularidad** y **Flexibilidad — Adaptabilidad**. La elección no es una cuestión de cita. El documento de arquitectura establece como criterio que las cuarenta subcaracterísticas de la norma tengan al menos un escenario de calidad asociado, y el escenario de extensión a otro tipo de donación es el único que cubre Adaptabilidad. Clasificarlo en Modularidad dejaría esa subcaracterística sin cobertura.

Es necesario además fijar la prioridad MoSCoW de la capacidad funcional que el atributo habilita, para distinguir con precisión entre la propiedad del modelo —que sí se construye y se verifica en la versión 1— y la funcionalidad de administrar un tipo nuevo, que no se construye.

---

## Opciones consideradas

### Opción A — Mantenibilidad — Modularidad

La norma define Modularidad como la propiedad de un sistema compuesto por componentes discretos tales que un cambio en uno tiene impacto mínimo sobre los demás. Es una propiedad de las fronteras internas entre componentes.

Incorporar un tipo de donación nuevo no modifica ninguna frontera: modifica el conjunto de contextos de uso que el sistema admite. Esta clasificación dejaría además la subcaracterística Adaptabilidad sin escenario asociado, en contra del criterio de cobertura completa del documento de arquitectura.

**Descartada.**

### Opción B — Flexibilidad — Adaptabilidad

La norma define Adaptabilidad como la capacidad de un producto de adaptarse de forma efectiva a entornos de hardware, software, operativos o de uso distintos o en evolución. Administrar un tipo de donación distinto de la sangre es un contexto de uso en evolución.

**Seleccionada.**

### Opción C — Clasificación en ambas características

Un requerimiento puede tener consecuencias en dos características, pero el documento de arquitectura fija que ningún escenario se clasifique en más de una subcaracterística y que cada subcaracterística conserve al menos un escenario. Duplicar la clasificación haría ambiguo el conteo de cobertura, que es uno de los criterios de calidad de la entrega.

**Descartada.**

---

## Compromiso evaluado

**Se gana.** Una sola clasificación coherente entre la especificación de requerimientos y el documento de arquitectura. Cobertura sostenida de las cuarenta subcaracterísticas de la norma. Distinción explícita entre la propiedad del modelo, que se verifica en esta versión, y la funcionalidad que no se compromete.

**Se sacrifica.** El atributo tiene un componente de modularidad real —la indirección que introduce el catálogo de tipo de donación es una decisión de frontera interna— que la clasificación elegida no refleja. Se acepta porque el escenario mide el resultado externo, admitir un tipo nuevo sin cambio estructural, y no el mecanismo interno que lo consigue. La modularidad del sistema se mide por su propio escenario, el de aislamiento del cambio dentro de un contexto.

---

## Decisión

1. **El requerimiento no funcional de extensibilidad del modelo de dominio y su escenario de calidad se clasifican en Flexibilidad — Adaptabilidad**, conforme a ISO/IEC 25010:2023.

2. **La capacidad funcional de administrar tipos de donación distintos de la sangre se clasifica Won't para la versión 1**, y se declara como tal en el catálogo de requerimientos especificados y no comprometidos de la especificación de requerimientos. La propiedad del modelo que la habilita sí se construye y se verifica en esta versión.

3. **La extensibilidad de dominio no constituye módulo funcional.** Se especifica como atributo de calidad y como restricción interna de diseño, y no figura en ningún catálogo de módulos.

4. **La referencia de ADR-005 al catálogo de módulos anterior queda derogada.** La decisión que ese registro contiene —base de datos relacional con esquema independiente por servicio— conserva plena vigencia y no se reescribe; se corrige únicamente la referencia.

5. **La restricción interna RI-01 se conserva sin cambios.** Sigue siendo la restricción de diseño que sustenta el requerimiento, y la relación entre ambos es la correcta.

---

## Justificación

La norma resuelve el caso sin necesidad de criterio adicional. Modularidad responde a la pregunta de si una parte puede cambiar sin romper otra. Adaptabilidad responde a la de si el producto puede operar en un contexto de uso para el que no fue construido. La situación que el escenario describe —el cliente solicita administrar un tipo de donación distinto— es la segunda.

La medida de respuesta del escenario lo confirma: cero cambios estructurales en las tablas de trazabilidad y de inventario, y alta del tipo nuevo por registro en catálogo o por configuración. Esa medida no observa el acoplamiento entre módulos, que es lo que mediría un escenario de modularidad y que en este catálogo ya mide otro. Observa si el sistema admite un contexto de uso nuevo.

La clasificación como Won't de la capacidad funcional preserva una distinción que importa para la evaluación de la entrega: el proyecto no compromete construir la administración de otros tipos de donación, pero sí compromete que el modelo de datos no la impida, y eso se decide antes de la primera migración y no se revierte barato después.

---

## Vigencia de lo elegido

No aplica. La decisión fija la clasificación de un atributo de calidad conforme a una norma vigente, y no selecciona una tecnología con ventana de soporte. La revisión de ISO/IEC 25010 adoptada es la de 2023, declarada en las restricciones normativas del catálogo de herramientas.

---

## Consecuencias

**Sobre la especificación de requerimientos.** El requerimiento no funcional de extensibilidad figura clasificado en Flexibilidad — Adaptabilidad, y la capacidad que habilita figura en el catálogo de requerimientos fuera de la línea base con prioridad Won't.

**Sobre el documento de arquitectura.** El escenario de extensión a otro tipo de donación conserva su clasificación y su índice de prioridad. Su referencia a la prioridad MoSCoW remite al catálogo de la especificación de requerimientos, que es donde esa prioridad se asigna.

**Sobre la cobertura de la norma.** Adaptabilidad conserva su escenario y las cuarenta subcaracterísticas siguen cubiertas. Modularidad conserva el escenario que sí la mide, el de aislamiento del cambio dentro de un contexto.

**Sobre el catálogo de módulos.** El catálogo vigente son siete módulos funcionales y tres servicios transversales. La extensibilidad de dominio no figura en él, y la tabla de correspondencia de identificadores documenta su supresión.

**Sobre el Tech Radar.** Ninguna entrada nace, cambia de anillo ni se retira. La entrada de mapeo objeto-relacional del Servicio de Donación actualiza su justificación para referir el requerimiento no funcional y la restricción interna vigentes.

---

## Responsable y fecha de revisión

| Rol | Responsabilidad |
|---|---|
| Arquitecta de Software | Clasificación del atributo y coherencia con la cobertura de la norma. |
| QA / Tester | Verificación de que las cuarenta subcaracterísticas conservan al menos un escenario asociado. |

**Próxima revisión:** cierre del Sprint 2, junto con la emisión de ADR-007, ADR-008 y ADR-009.
