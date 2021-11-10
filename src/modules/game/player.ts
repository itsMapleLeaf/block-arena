import { Bodies, Body, Vector } from "matter-js"
import { isKeyDown } from "../dom/keyboard"
import { getMousePosition } from "../dom/mouse"
import { clampVector, lerpVectorClamped, originVector } from "../matter/vector"
import { worldSize } from "./constants"

const playerSpeed = 5
const playerMovementSmoothing = 10
const playerCursorOffset = 70

export class Player {
  readonly playerBody = Bodies.circle(
    Math.random() * worldSize.x,
    Math.random() * worldSize.y,
    30,
  )

  readonly playerCursorBody = Bodies.circle(
    this.playerBody.position.x,
    this.playerBody.position.y,
    10,
    { isSensor: true },
  )

  get position() {
    return this.playerBody.position
  }

  move(delta: number) {
    const velocity = { ...originVector }
    if (isKeyDown("KeyA")) velocity.x -= playerSpeed
    if (isKeyDown("KeyD")) velocity.x += playerSpeed
    if (isKeyDown("KeyW")) velocity.y -= playerSpeed
    if (isKeyDown("KeyS")) velocity.y += playerSpeed

    Body.setVelocity(
      this.playerBody,
      lerpVectorClamped(
        this.playerBody.velocity,
        velocity,
        delta * playerMovementSmoothing,
      ),
    )

    // keep player in the world bounds
    Body.setPosition(
      this.playerBody,
      clampVector(this.playerBody.position, originVector, worldSize),
    )
  }

  updateCursorPosition(canvasSize: Vector) {
    // get the angle from the player position to the cursor position
    const mouse = Vector.add(
      Vector.sub(getMousePosition(), Vector.div(canvasSize, 2)),
      this.playerBody.position,
    )

    const mouseAngle = Math.atan2(
      mouse.y - this.playerBody.position.y,
      mouse.x - this.playerBody.position.x,
    )

    // move the player cursor body to the player body position,
    // but offset by the angle
    Body.setPosition(this.playerCursorBody, {
      x: this.playerBody.position.x + Math.cos(mouseAngle) * playerCursorOffset,
      y: this.playerBody.position.y + Math.sin(mouseAngle) * playerCursorOffset,
    })
  }
}
