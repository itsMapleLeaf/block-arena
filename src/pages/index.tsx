import { useEffect, useRef } from "react"
import { useAnimationLoop } from "../modules/dom/use-animation-loop"
import { useKeyboard } from "../modules/dom/use-keyboard"
import { usePointer } from "../modules/dom/use-pointer"
import { useWindowEvent } from "../modules/dom/use-window-event"
import { useWindowSize } from "../modules/dom/use-window-size"
import { Game } from "../modules/game/game"
import { GameRenderer } from "../modules/game/game-renderer"
import { originVector } from "../modules/matter/vector"

const game = new Game()

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderRef = useRef<GameRenderer>()
  const playerId = useRef<string>()
  const windowSize = useWindowSize()
  const pointer = usePointer()

  useEffect(() => {
    playerId.current = game.addPlayer()
    game.addPlayer()
    game.addPlayer()
    game.addPlayer()
    return game.run()
  }, [])

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

    renderRef.current!.lookAtPlayer(playerId.current!)
    renderRef.current!.update(delta)

    game.handleInput(playerId.current!, {
      type: "pointer",
      position: renderRef.current!.toWorldPosition(pointer.getPosition()),
    })
  })

  const { isKeyPressed } = useKeyboard(({ repeat }) => {
    if (repeat) return

    const movement = { ...originVector }
    if (isKeyPressed("KeyA")) movement.x -= 1
    if (isKeyPressed("KeyD")) movement.x += 1
    if (isKeyPressed("KeyW")) movement.y -= 1
    if (isKeyPressed("KeyS")) movement.y += 1

    game.handleInput(playerId.current!, {
      type: "movement",
      movement,
    })
  })

  useWindowEvent("pointerdown", () => {
    game.handleInput(playerId.current!, { type: "grab" })
  })
  useWindowEvent("pointerup", () => {
    game.handleInput(playerId.current!, { type: "release" })
  })

  return <canvas ref={canvasRef} style={{ display: "block" }} />
}
