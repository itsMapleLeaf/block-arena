import { Render, Vector } from "matter-js"
import { Game } from "./game"

export class GameRenderer {
  private render: Render

  constructor(
    private game: Game,
    private canvas: HTMLCanvasElement,
    private windowSize: { width: number; height: number },
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

  run() {
    Render.run(this.render)
    return () => Render.stop(this.render)
  }

  update() {
    const canvasSize = { x: this.canvas.width, y: this.canvas.height }

    const topLeft = Vector.sub(
      this.game.player.position,
      Vector.div(canvasSize, 2),
    )

    Render.lookAt(this.render, {
      bounds: {
        min: topLeft,
        max: Vector.add(topLeft, canvasSize),
      },
    })
  }
}
