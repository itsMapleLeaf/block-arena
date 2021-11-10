import { useEffect, useRef } from "react"

export function useAnimationLoop(callback: (deltaTimeSeconds: number) => void) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    let running = true

    ;(async () => {
      let previousTime = await animationFrame()
      while (running) {
        const currentTime = await animationFrame()
        const deltaTime = currentTime - previousTime
        previousTime = currentTime
        callbackRef.current(deltaTime / 1000)
      }
    })()

    return () => {
      running = false
    }
  }, [])
}

function animationFrame() {
  return new Promise<number>((resolve) => {
    requestAnimationFrame(resolve)
  })
}
