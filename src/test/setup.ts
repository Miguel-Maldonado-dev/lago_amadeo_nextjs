import '@testing-library/jest-dom/vitest'

// Polyfills de jsdom requeridos por cmdk / Radix
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
URL.createObjectURL ??= () => 'blob:test'
URL.revokeObjectURL ??= () => {}
