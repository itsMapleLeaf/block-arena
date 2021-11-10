import { useEffect, useRef } from "react"
import { useAnimationLoop } from "../modules/dom/use-animation-loop"
import { useWindowSize } from "../modules/dom/use-window-size"
import { Game } from "../modules/game/game"
import { GameRenderer } from "../modules/game/game-renderer"
import { vectorFromSize } from "../modules/matter/vector"

const game = new Game()

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderRef = useRef<GameRenderer>()
  const windowSize = useWindowSize()

  useEffect(() => game.run(), [])

  useEffect(() => {
    const renderer = (renderRef.current = new GameRenderer(
      game,
      canvasRef.current!,
      windowSize,
    ))
    return renderer.run()
  }, [windowSize])

  useAnimationLoop((delta) => {
    game.update(delta)
    renderRef.current!.update()
    game.player.updateCursorPosition(vectorFromSize(canvasRef.current!))
    game.player.updateGrabbedBlockPosition(vectorFromSize(canvasRef.current!))
  })

  return <canvas ref={canvasRef} style={{ display: "block" }} />
}
