/**
 * Identificador aleatorio con forma de UUID v4.
 *
 * `crypto.randomUUID` solo existe en contextos seguros (https o localhost), y
 * un ambiente de QA servido por http en otra maquina no lo es. Se construye
 * entonces sobre `getRandomValues`, que esta disponible en ambos casos.
 */
export function nuevoId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
