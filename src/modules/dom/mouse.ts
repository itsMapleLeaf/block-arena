let mousePosition = { x: 0, y: 0 }
let pressedButtons = new Set<number>()

if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e: MouseEvent) => {
    mousePosition = {
      x: e.clientX,
      y: e.clientY,
    }
  })

  window.addEventListener("pointerdown", (e: MouseEvent) => {
    pressedButtons.add(e.button)
  })

  window.addEventListener("pointerup", (e: MouseEvent) => {
    pressedButtons.delete(e.button)
  })
}

export function getMousePosition() {
  return mousePosition
}

export function isMouseDown() {
  return pressedButtons.size > 0
}

export function isMouseButtonPressed(button: number) {
  return pressedButtons.has(button)
}

export function requestMouseLock(element: HTMLElement) {
  element.requestPointerLock()
}
