import { useEffect } from "react"

export function useWindowEvent<EventName extends keyof WindowEventMap>(
  eventNameArg: EventName | EventName[],
  handler: (event: WindowEventMap[EventName]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    const eventNames = Array.isArray(eventNameArg)
      ? eventNameArg
      : [eventNameArg]

    for (const name of eventNames) {
      window.addEventListener(name, handler, options)
    }
    return () => {
      for (const name of eventNames) {
        window.removeEventListener(name, handler, options)
      }
    }
  })
}
