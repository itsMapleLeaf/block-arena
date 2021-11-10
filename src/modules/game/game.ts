import { Bodies, Body, Composite, Engine, Runner, Vector } from "matter-js"
import { nanoid } from "nanoid"
import { lerpVectorClamped, vectorFromAngle } from "../matter/vector"
import { worldSize } from "./constants"

const boxSize = 100
const grabDistance = boxSize * 1.5
const blockThrowSpeed = 12

export type Player = {
  id: string
  body: Body
  cursor: Body
  movement: Readonly<Vector>
  pointerPosition: Readonly<Vector>
  grabbedBlock?: Body
}

type GameInput =
  | { type: "movement"; movement: Vector }
  | { type: "pointer"; position: Vector }
  | { type: "grab" }
  | { type: "release" }

export class Game {
  readonly engine = Engine.create({
    gravity: { x: 0, y: 0 },
  })

  readonly playerGroup = Composite.create()
  readonly players = new WeakMap<Composite, Player>()

  readonly boxGroup = this.createBoxesComposite()

  constructor() {
    Composite.add(this.engine.world, this.playerGroup)
  }

  addPlayer() {
    const id = nanoid()

    const body = Bodies.circle(
      Math.random() * worldSize.x,
      Math.random() * worldSize.y,
      30,
    )

    const cursor = Bodies.circle(body.position.x, body.position.y, 10, {
      isSensor: true,
    })

    const composite = Composite.create({
      bodies: [body, cursor],
    })

    Composite.add(this.playerGroup, composite)

    this.players.set(composite, {
      id,
      body,
      cursor,
      movement: { x: 0, y: 0 },
      pointerPosition: body.position,
    })

    console.log(this.players)

    return id
  }

  getPlayer(id: string): Player | undefined {
    for (const composite of this.playerGroup.composites) {
      const meta = this.players.get(composite)
      if (meta?.id === id) return meta
    }
  }

  run() {
    const runner = Runner.create()
    Runner.run(runner, this.engine)
    return () => Runner.stop(runner)
  }

  update(delta: number) {
    this.updatePlayers(delta)
    this.clampBoxesToWorld()
  }

  handleInput(playerId: string, input: GameInput) {
    const player = this.getPlayer(playerId)
    if (!player) return

    if (input.type === "movement") {
      player.movement = input.movement
    }

    if (input.type === "pointer") {
      player.pointerPosition = input.position
    }

    if (input.type === "grab") {
      this.tryGrab(player)
    }

    if (input.type === "release") {
      this.tryRelease(player)
    }
  }

  private createBoxesComposite() {
    const boxes = Composite.create()

    for (let i = 0; i < 150; i++) {
      const x = Math.random() * worldSize.x
      const y = Math.random() * worldSize.y
      Composite.add(
        boxes,
        Bodies.rectangle(x, y, boxSize, boxSize, {
          friction: 0,
          frictionAir: 0,
        }),
      )
    }

    Composite.add(this.engine.world, boxes)

    for (const box of boxes.bodies) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 2 + 1
      Body.setVelocity(box, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      })
      Body.setAngle(box, angle)
    }

    return boxes
  }

  private clampBoxesToWorld() {
    for (const box of this.boxGroup.bodies) {
      let { x, y } = box.position
      if (x < 0) x += worldSize.x
      if (x > worldSize.x) x -= worldSize.x
      if (y < 0) y += worldSize.y
      if (y > worldSize.y) y -= worldSize.y
      Body.setPosition(box, { x, y })
    }
  }

  private updatePlayers(delta: number) {
    for (const composite of this.playerGroup.composites) {
      const player = this.players.get(composite)
      if (!player) continue

      const angleToPointer = Vector.angle(
        player.body.position,
        player.pointerPosition,
      )

      const getHoldingPosition = (distance: number) =>
        Vector.add(
          player.body.position,
          Vector.mult(vectorFromAngle(angleToPointer), distance),
        )

      Body.setVelocity(
        player.body,
        lerpVectorClamped(
          player.body.velocity,
          Vector.mult(player.movement, 5),
          delta * 10,
        ),
      )

      player.cursor.render.visible = !player.grabbedBlock

      Body.setPosition(player.cursor, getHoldingPosition(80))

      if (player.grabbedBlock) {
        Body.setPosition(player.grabbedBlock, getHoldingPosition(120))
        Body.setAngle(player.grabbedBlock, angleToPointer)
      }
    }
  }

  private tryGrab(player: Player) {
    const closestBox = [...this.boxGroup.bodies]
      .map((body) => {
        const distance = Vector.magnitude(
          Vector.sub(body.position, player.cursor.position),
        )
        return { body, distance }
      })
      .sort((a, b) => a.distance - b.distance)[0]

    if (!closestBox) return

    const hasGrabbed = closestBox.distance < grabDistance
    if (!hasGrabbed) return

    player.grabbedBlock = Bodies.rectangle(
      closestBox.body.position.x,
      closestBox.body.position.y,
      boxSize,
      boxSize,
      {
        velocity: { x: 0, y: 0 },
        isSensor: true,
      },
    )

    Composite.remove(this.boxGroup, closestBox.body)
    Composite.add(this.engine.world, player.grabbedBlock)
  }

  private tryRelease(player: Player) {
    if (!player.grabbedBlock) return

    const direction = vectorFromAngle(
      Vector.angle(player.body.position, player.grabbedBlock.position),
    )

    const block = Bodies.rectangle(
      player.grabbedBlock.position.x,
      player.grabbedBlock.position.y,
      boxSize,
      boxSize,
      {
        friction: 0,
        frictionAir: 0,
        angle: player.grabbedBlock.angle,
      },
    )

    Composite.remove(this.engine.world, player.grabbedBlock)
    player.grabbedBlock = undefined

    Composite.add(this.boxGroup, block)
    Body.setVelocity(block, Vector.mult(direction, blockThrowSpeed))
  }
}
