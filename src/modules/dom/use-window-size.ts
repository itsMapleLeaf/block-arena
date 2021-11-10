import { useEffect, useMemo, useState } from "react"

export function useWindowSize() {
  const [width, setWidth] = useState(
    typeof window === "undefined" ? 0 : window.innerWidth,
  )
  const [height, setHeight] = useState(
    typeof window === "undefined" ? 0 : window.innerHeight,
  )

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return useMemo(() => ({ width, height }), [width, height])
}
