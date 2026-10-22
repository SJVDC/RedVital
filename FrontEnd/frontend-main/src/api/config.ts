/**
 * Configuracion de la capa de servicios, leida en tiempo de construccion.
 *
 * La aplicacion habla solo con el gateway, en el mismo origen que la sirve:
 * Caddy entrega la web y reenvia `/api/*` a APISIX. Por eso la base es una
 * ruta relativa y la cookie de renovacion (Secure, SameSite=Strict, limitada
 * a /api/v1/sesiones) viaja sin configuracion adicional.
 */
export const CONFIG = {
  baseApi: (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, ''),
  /** Version del aviso de privacidad que acepta quien crea una cuenta. */
  versionAvisoPrivacidad: import.meta.env.VITE_VERSION_AVISO ?? 'AV-2026.1',
} as const
