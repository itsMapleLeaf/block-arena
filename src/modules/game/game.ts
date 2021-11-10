import { Bodies, Body, Composite, Engine, Runner } from "matter-js"
import { worldSize } from "./constants"
import { Player } from "./player"

const boxSize = 100

export class Game {
  readonly engine = Engine.create({
    gravity: { x: 0, y: 0 },
  })

  readonly player = new Player()

  private boxes = this.createBoxes()

  constructor() {
    Composite.add(this.engine.world, [
      this.player.playerBody,
      ...this.boxes,
      this.player.playerCursorBody,
    ])
    this.randomizeBoxVelocities()
  }

  run() {
    const runner = Runner.create()
    Runner.run(runner, this.engine)
    return () => Runner.stop(runner)
  }

  update(delta: number) {
    this.player.move(delta)
    this.clampBoxesToWorld()
  }

  private createBoxes() {
    const boxes: Body[] = []
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * worldSize.x
      const y = Math.random() * worldSize.y
      boxes.push(
        Bodies.rectangle(x, y, boxSize, boxSize, {
          friction: 0,
          frictionAir: 0,
        }),
      )
    }
    return boxes
  }

  private randomizeBoxVelocities() {
    for (const box of this.boxes) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 2 + 1
      Body.setVelocity(box, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      })
    }
  }

  private clampBoxesToWorld() {
    for (const box of this.boxes) {
      let { x, y } = box.position
      if (x < 0) x += worldSize.x
      if (x > worldSize.x) x -= worldSize.x
      if (y < 0) y += worldSize.y
      if (y > worldSize.y) y -= worldSize.y
      Body.setPosition(box, { x, y })
    }
  }
}
