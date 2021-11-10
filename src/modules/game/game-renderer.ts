import { Render, Vector } from "matter-js"
import { clampVector, originVector } from "../matter/vector"
import { worldSize } from "./constants"
import { Game } from "./game"

export class GameRenderer {
  private render: Render

  constructor(private game: Game, private canvas: HTMLCanvasElement) {
    this.render = Render.create({
      canvas,
      options: {
        wireframes: false,
      },

      // https://github.com/liabru/matter-js/issues/241#issuecomment-596164871
      engine: undefined as any,
    })
    ;(this.render as any).engine = game.engine
  }

  run() {
    Render.run(this.render)
    return () => Render.stop(this.render)
  }

  update() {
    const canvasSize = { x: this.canvas.width, y: this.canvas.height }

    const topLeft = clampVector(
      Vector.sub(this.game.player.position, Vector.div(canvasSize, 2)),
      originVector,
      Vector.sub(worldSize, canvasSize),
    )

    Render.lookAt(this.render, {
      bounds: {
        min: topLeft,
        max: Vector.add(topLeft, canvasSize),
      },
    })
  }
}
