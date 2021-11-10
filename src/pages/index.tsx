import { useEffect, useRef } from "react"
import { Game } from "../modules/game/game"
import { GameRenderer } from "../modules/game/game-renderer"
import { useAnimationLoop } from "../modules/dom/use-animation-loop"

const game = new Game()

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderRef = useRef<GameRenderer>()

  useEffect(() => game.run(), [])

  useEffect(() => {
    const renderer = (renderRef.current = new GameRenderer(
      game,
      canvasRef.current!,
    ))
    return renderer.run()
  }, [])

  useAnimationLoop((delta) => {
    game.update(delta)
    renderRef.current!.update()
  })

  return <canvas width={800} height={600} ref={canvasRef} />
}
