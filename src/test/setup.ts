import '@testing-library/jest-dom/vitest'

// Polyfills de jsdom requeridos por cmdk / Radix
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Las pruebas con `@vitest-environment node` (p. ej. generación de archivos) no tienen DOM.
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
}
URL.createObjectURL ??= () => 'blob:test'
URL.revokeObjectURL ??= () => {}
