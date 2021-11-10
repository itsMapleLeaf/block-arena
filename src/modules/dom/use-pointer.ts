import { useCallback, useState } from "react"
import { useWindowEvent } from "./use-window-event"

export function usePointer() {
  const [pointer] = useState({ x: 0, y: 0 })

  useWindowEvent("pointermove", (event) => {
    pointer.x = event.clientX
    pointer.y = event.clientY
  })

  return {
    getPosition: useCallback(() => pointer, [pointer]),
  }
}
