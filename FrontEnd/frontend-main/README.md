# RedVital Web

Aplicación web de RedVital. React 19 + TypeScript + Vite + Tailwind CSS 4, con primitivos de Radix UI.

La web **solo habla con el API Gateway**: toda petición va a `/api/v1/...` en el mismo origen, el Caddy de borde la envía a APISIX y APISIX la enruta al servicio (DD V3.0, sección 15). No conoce la dirección de ningún servicio ni de ninguna base de datos, y no tiene datos sintéticos ni simulador: si un servicio no responde, la pantalla lo dice.

## Sesión

- **Iniciar sesión** (`/ingresar`): `POST /api/v1/sesiones`. El token de acceso (15 min) vive solo en memoria.
- **Renovación**: cookie `HttpOnly; Secure; SameSite=Strict` limitada a `/api/v1/sesiones`. Al recargar la página la sesión se restaura en silencio, y el token se renueva un minuto antes de vencer.
- **Sesión expirada**: un diálogo pide la contraseña sin desmontar la pantalla, así no se pierde lo que se estaba escribiendo.
- **Cerrar sesión**: `DELETE /api/v1/sesiones/actual`.
- **Crear cuenta** (`/registro`): `POST /api/v1/donantes`. Crea la cuenta en Identidad y el perfil en Donación, con los dos consentimientos por separado, y entra con la sesión nueva.

Como la cookie es `Secure`, la aplicación se sirve por HTTPS (en QA, Caddy con `tls internal`).

## Pantallas por perfil

| Perfil | Pantallas |
|---|---|
| U1 visitante | Portada, registro anónimo en 3 pasos, consulta por código, jornadas, crear cuenta, iniciar sesión |
| U2 donante | Mi perfil (elegibilidad, contacto, autorizaciones), historial, reconocimientos, jornadas |
| U3 operador | Consultar donante, registrar donación y fraccionamiento, unidades y su detalle con las acciones de los 9 estados, inventario y alertas (lectura), campañas |
| U4 administrador de banco | Inventario y umbrales, alertas (atender), unidades (lectura), campañas del banco (publicar y cerrar) |
| U5 / U6 | Campañas de su jurisdicción, en lectura |
| U7 auditor | Aviso de que aún no hay módulos para su perfil |

Transferencias, bitácora, red territorial y analítica dependen del Servicio Institucional y no se ofrecen todavía: una entrada que un perfil no puede usar no se dibuja.

## Desarrollo

Requiere Node.js 24.

```bash
npm ci
```

```bash
npm run dev
```

El servidor de desarrollo (`http://localhost:5173`) envía `/api` al borde: por defecto `https://localhost`, o lo que diga la variable `REDVITAL_BORDE`. Levanta antes las pilas de `Despliegue_RedVital`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila TypeScript y genera `dist/` |
| `npm run typecheck` | Verifica tipos sin generar archivos |

| Variable de build | Por defecto | Uso |
|---|---|---|
| `VITE_API_BASE` | `/api` | Prefijo del gateway |
| `VITE_VERSION_AVISO` | `AV-2026.1` | Versión del aviso de privacidad que se registra con cada consentimiento |

## Imagen

```bash
docker build -t redvital/web:qa .
```

Build de Vite servido por Caddy en el puerto 8080, sin root, apto para `read_only` y `cap_drop: ALL`. Expone `/salud` para el healthcheck. TLS, cabeceras de seguridad y límite de cuerpo los aplica el Caddy de borde, no este contenedor.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/api/` | Contratos por servicio, cliente HTTP, gestor de sesión y adaptadores snake_case ↔ modelo |
| `src/modules/donantes/` | M1 — Gestión de Donantes |
| `src/modules/campanas/` | M2 — Campañas |
| `src/modules/ciclovida/` | M3 — Ciclo de Vida de la Unidad |
| `src/modules/inventario/` | M4 — Inventario y alertas |
| `src/shared/sesion/` | Contexto de sesión, rutas protegidas, diálogo de sesión expirada |
| `src/shared/consulta/` | `useConsulta` / `useAccion`: carga, error y reintento de cada pantalla |
| `src/shared/datos/` | Catálogos cerrados, roles y DIVIPOLA |
| `src/shared/ui/` | Componentes visuales compartidos e iconografía |
| `src/styles/tema.css` | Tokens de color, tipografía, sombras y movimiento |

## Restricciones que la interfaz hace cumplir

- **RNF-01, nunca la causa clínica.** El tamizaje tiene dos botones y ningún campo de motivo; la elegibilidad muestra una fecha, nunca una razón. Lo que no se captura no se puede exponer después.
- **RNF-03, registro anónimo en 3 pasos**, sin ningún campo de identificación.
- **TR-03, navegación por rol.** Una ruta ajena a un perfil responde «no encontrado»; no insinúa que existe.
- **Decreto 1571 de 1993.** Los reconocimientos no tienen saldo, puntos ni canje.

## Sistema visual

Atkinson Hyperlegible servida desde el propio origen (sin peticiones a terceros), paleta institucional en `tema.css`, objetivos táctiles de 44 px, foco visible, iconos SVG propios y `prefers-reduced-motion` respetado. El inventario de pantallas está en [`docs/inventario-pantallas.md`](docs/inventario-pantallas.md); la elección de stack, en `ADR-006`.
