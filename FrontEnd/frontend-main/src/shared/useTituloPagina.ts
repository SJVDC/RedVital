import { useEffect } from 'react'

/** Título de la pestaña: «Pantalla · RedVital». Lo anuncian los lectores de pantalla al navegar. */
export function useTituloPagina(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · RedVital`
  }, [titulo])
}
