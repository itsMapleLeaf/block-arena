let mousePosition = { x: 0, y: 0 }

if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e: MouseEvent) => {
    mousePosition = {
      x: e.clientX,
      y: e.clientY,
    }
  })
}

export function getMousePosition() {
  return mousePosition
}

export function requestMouseLock(element: HTMLElement) {
  element.requestPointerLock()
}
