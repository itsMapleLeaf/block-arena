const pressedKeys = new Set<string>()

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    pressedKeys.add(e.code)
  })
  window.addEventListener("keyup", (e) => {
    pressedKeys.delete(e.code)
  })
  window.addEventListener("blur", () => {
    pressedKeys.clear()
  })
}

export function isDown(...keys: string[]) {
  return keys.some((key) => pressedKeys.has(key))
}
