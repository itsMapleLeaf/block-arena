import { Render, Vector } from "matter-js"
import {
  lerpVectorClamped,
  originVector,
  vectorFromSize,
} from "../matter/vector"
import { Game, Player } from "./game"

const cameraSpeed = 10

export class GameRenderer {
  private render: Render
  private cameraPosition = originVector
  private cameraTarget = originVector

  constructor(
    private game: Game,
    private canvas: HTMLCanvasElement,
    windowSize: { width: number; height: number },
  ) {
    this.render = Render.create({
      canvas,
      options: {
        ...windowSize,
        wireframes: false,
      },

      // https://github.com/liabru/matter-js/issues/241#issuecomment-596164871
      engine: undefined as any,
    })
    ;(this.render as any).engine = game.engine
  }

  private get canvasSize() {
    return vectorFromSize(this.canvas)
  }

  run() {
    Render.run(this.render)
    return () => Render.stop(this.render)
  }

  update(delta: number) {
    this.cameraPosition = lerpVectorClamped(
      this.cameraPosition,
      this.cameraTarget,
      delta * cameraSpeed,
    )

    Render.lookAt(this.render, {
      bounds: {
        min: this.cameraPosition,
        max: Vector.add(this.cameraPosition, this.canvasSize),
      },
    })
  }

  lookAtPlayer(playerId: Player["id"]) {
    const player = this.game.getPlayer(playerId)
    if (!player) return

    this.cameraTarget = Vector.sub(
      player.body.position,
      Vector.div(this.canvasSize, 2),
    )
  }

  toWorldPosition(screenPosition: Vector) {
    return Vector.add(
      screenPosition,
      this.cameraPosition,
      // Vector.sub(this.cameraPosition, Vector.div(this.canvasSize, 2)),
    )
  }
}
