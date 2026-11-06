/** Descarga un archivo generado en el navegador. */
export function descargar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Se libera después del clic para no cancelar la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
