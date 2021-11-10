import { Bodies, Body, Composite, Engine, Runner, Vector } from "matter-js"
import { worldSize } from "./constants"
import { Player } from "./player"

const boxSize = 100
const grabDistance = boxSize * 1.5
const blockThrowSpeed = 12

export class Game {
  readonly engine = Engine.create({
    gravity: { x: 0, y: 0 },
  })

  readonly player = new Player()

  private boxes = this.createBoxes()

  constructor() {
    Composite.add(this.engine.world, [
      this.player.body,
      ...this.boxes,
      this.player.cursor,
    ])

    this.randomizeBoxVelocities()

    this.player.onGrab = (position) => {
      const closestBox = [...this.boxes]
        .map((box) => {
          const distance = Vector.magnitude(Vector.sub(box.position, position))
          return { box, distance }
        })
        .sort((a, b) => a.distance - b.distance)[0]

      const hasGrabbed = closestBox && closestBox.distance < grabDistance
      if (!hasGrabbed) return

      Composite.remove(this.engine.world, closestBox.box)
      this.boxes.delete(closestBox.box)

      const fakeBox = Bodies.rectangle(
        position.x,
        position.y,
        boxSize,
        boxSize,
        {
          isSensor: true,
        },
      )

      Composite.add(this.engine.world, [fakeBox])

      return fakeBox
    }

    this.player.onRelease = (oldBox, angle) => {
      Composite.remove(this.engine.world, oldBox)

      const box = Bodies.rectangle(
        oldBox.position.x,
        oldBox.position.y,
        boxSize,
        boxSize,
        {
          friction: 0,
          frictionAir: 0,
        },
      )

      Composite.add(this.engine.world, [box])
      this.boxes.add(box)

      Body.setVelocity(
        box,
        Vector.neg({
          x: Math.cos(angle) * blockThrowSpeed,
          y: Math.sin(angle) * blockThrowSpeed,
        }),
      )

      Body.setAngle(box, angle)
    }
  }

  run() {
    const runner = Runner.create()
    Runner.run(runner, this.engine)
    return () => Runner.stop(runner)
  }

  update(delta: number) {
    this.player.update(delta)
    this.clampBoxesToWorld()
  }

  private createBoxes() {
    const boxes = new Set<Body>()
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * worldSize.x
      const y = Math.random() * worldSize.y
      boxes.add(
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
