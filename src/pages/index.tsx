import {
  Bodies,
  Body,
  Composite,
  Engine,
  Render,
  Runner,
  Vector,
} from "matter-js"
import { useEffect, useRef } from "react"
import { isKeyDown } from "../keyboard"
import { getMousePosition } from "../mouse"
import { raise } from "../raise"
import { useAnimationLoop } from "../useAnimationLoop"
import { clampVector, lerpVectorClamped, originVector } from "../vector"

const worldSize = { x: 5000, y: 5000 }
const boxSize = 100
const playerSpeed = 5
const playerMovementSmoothing = 10
const playerCursorOffset = 70

const playerBody = Bodies.circle(
  Math.random() * worldSize.x,
  Math.random() * worldSize.y,
  30,
)

const playerCursorBody = Bodies.circle(
  playerBody.position.x,
  playerBody.position.y,
  10,
  { isSensor: true },
)

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

const engine = Engine.create({
  gravity: { x: 0, y: 0 },
})

Composite.add(engine.world, [playerBody, ...boxes, playerCursorBody])

// give each box a random velocity
for (const box of boxes) {
  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * 2 + 1
  Body.setVelocity(box, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  })
}

const runner = Runner.create()
Runner.run(runner, engine)

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderRef = useRef<Render>()

  useEffect(() => {
    const render = (renderRef.current = Render.create({
      canvas: canvasRef.current ?? raise("canvasRef not assigned"),
      options: {
        wireframes: false,
      },

      // @ts-expect-error: https://github.com/liabru/matter-js/issues/241#issuecomment-596164871
      engine: undefined,
    }))

    // @ts-expect-error: https://github.com/liabru/matter-js/issues/241#issuecomment-596164871
    render.engine = engine

    Render.run(render)
    return () => Render.stop(render)
  }, [])

  useAnimationLoop((delta) => {
    const canvas = canvasRef.current ?? raise("canvasRef not assigned")
    const canvasSize = { x: canvas.width, y: canvas.height }

    // player movement
    const velocity = { ...originVector }
    if (isKeyDown("KeyA")) velocity.x -= playerSpeed
    if (isKeyDown("KeyD")) velocity.x += playerSpeed
    if (isKeyDown("KeyW")) velocity.y -= playerSpeed
    if (isKeyDown("KeyS")) velocity.y += playerSpeed
    Body.setVelocity(
      playerBody,
      lerpVectorClamped(
        playerBody.velocity,
        velocity,
        delta * playerMovementSmoothing,
      ),
    )

    // get the angle from the player position to the cursor position
    const mouse = Vector.add(
      Vector.sub(getMousePosition(), Vector.div(canvasSize, 2)),
      playerBody.position,
    )
    const mouseAngle = Math.atan2(
      mouse.y - playerBody.position.y,
      mouse.x - playerBody.position.x,
    )

    // move the player cursor body to the player body position,
    // but offset by the angle
    Body.setPosition(playerCursorBody, {
      x: playerBody.position.x + Math.cos(mouseAngle) * playerCursorOffset,
      y: playerBody.position.y + Math.sin(mouseAngle) * playerCursorOffset,
    })

    // keep player in the world bounds
    Body.setPosition(
      playerBody,
      clampVector(playerBody.position, originVector, worldSize),
    )

    // ensure boxes stay in the world
    // by looping to the other side if they go out of bounds
    for (const box of boxes) {
      let { x, y } = box.position
      if (x < 0) x += worldSize.x
      if (x > worldSize.x) x -= worldSize.x
      if (y < 0) y += worldSize.y
      if (y > worldSize.y) y -= worldSize.y
      Body.setPosition(box, { x, y })
    }

    {
      const topLeft = clampVector(
        Vector.sub(playerBody.position, Vector.div(canvasSize, 2)),
        originVector,
        Vector.sub(worldSize, canvasSize),
      )

      Render.lookAt(renderRef.current!, {
        bounds: {
          min: topLeft,
          max: Vector.add(topLeft, canvasSize),
        },
      })
    }
  })

  return <canvas width={800} height={600} ref={canvasRef} />
}
