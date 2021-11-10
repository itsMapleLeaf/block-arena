import { useState } from "react"
import { useWindowEvent } from "./use-window-event"

export function useKeyboard(onUpdate: (event: { repeat: boolean }) => void) {
  const [pressedCodes] = useState(() => new Set<string>())
  const isKeyPressed = (code: string) => pressedCodes.has(code)

  useWindowEvent("keydown", (event) => pressedCodes.add(event.code))
  useWindowEvent("keyup", (event) => pressedCodes.delete(event.code))
  useWindowEvent("blur", () => pressedCodes.clear())

  useWindowEvent(["keydown", "keyup", "blur"], (event) => {
    const repeat = event instanceof KeyboardEvent ? event.repeat : false
    onUpdate({ repeat })
  })

  return { isKeyPressed }
}
