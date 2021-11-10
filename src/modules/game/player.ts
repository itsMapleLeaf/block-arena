import { Bodies, Body, Vector } from "matter-js"
import { isKeyDown } from "../dom/keyboard"
import { getMousePosition, isMouseDown } from "../dom/mouse"
import { clampVector, lerpVectorClamped, originVector } from "../matter/vector"
import { worldSize } from "./constants"

const playerSpeed = 5
const playerMovementSmoothing = 10
const playerCursorOffset = 80
const grabbedBlockOffset = 110

export class Player {
  readonly body = Bodies.circle(
    Math.random() * worldSize.x,
    Math.random() * worldSize.y,
    30,
  )

  readonly cursor = Bodies.circle(
    this.body.position.x,
    this.body.position.y,
    10,
    { isSensor: true },
  )

  private grabPressed = false
  private grabbedBlock: Body | undefined

  onGrab = (position: Vector): Body | undefined => undefined
  onRelease = (grabbedBlock: Body) => {}

  get position() {
    return this.body.position
  }

  update(delta: number) {
    this.move(delta)
    this.handleGrab()
    this.cursor.render.visible = this.grabbedBlock === undefined
  }

  updateCursorPosition(canvasSize: Vector) {
    // get the angle from the player position to the cursor position
    const mouseAngle = this.getMouseAngleFromSelf(canvasSize)

    // move the player cursor body to the player body position,
    // but offset by the angle
    Body.setPosition(this.cursor, {
      x: this.body.position.x + Math.cos(mouseAngle) * playerCursorOffset,
      y: this.body.position.y + Math.sin(mouseAngle) * playerCursorOffset,
    })
  }

  updateGrabbedBlockPosition(canvasSize: Vector) {
    if (!this.grabbedBlock) return

    // get the angle from the player position to the cursor position
    const mouseAngle = this.getMouseAngleFromSelf(canvasSize)

    // move the player cursor body to the player body position,
    // but offset by the angle
    Body.setPosition(this.grabbedBlock, {
      x: this.body.position.x + Math.cos(mouseAngle) * grabbedBlockOffset,
      y: this.body.position.y + Math.sin(mouseAngle) * grabbedBlockOffset,
    })
    Body.setAngle(this.grabbedBlock, mouseAngle)
  }

  private getMouseAngleFromSelf(canvasSize: Vector) {
    const mouse = Vector.add(
      Vector.sub(getMousePosition(), Vector.div(canvasSize, 2)),
      this.body.position,
    )

    const mouseAngle = Math.atan2(
      mouse.y - this.body.position.y,
      mouse.x - this.body.position.x,
    )
    return mouseAngle
  }

  private move(delta: number) {
    const velocity = { ...originVector }
    if (isKeyDown("KeyA")) velocity.x -= playerSpeed
    if (isKeyDown("KeyD")) velocity.x += playerSpeed
    if (isKeyDown("KeyW")) velocity.y -= playerSpeed
    if (isKeyDown("KeyS")) velocity.y += playerSpeed

    Body.setVelocity(
      this.body,
      lerpVectorClamped(
        this.body.velocity,
        velocity,
        delta * playerMovementSmoothing,
      ),
    )

    // keep player in the world bounds
    Body.setPosition(
      this.body,
      clampVector(this.body.position, originVector, worldSize),
    )
  }

  private handleGrab() {
    if (!this.grabPressed && isMouseDown()) {
      this.grabPressed = true
      const block = this.onGrab(this.cursor.position)
      if (block) {
        this.grabbedBlock = block
      }
    }

    if (this.grabPressed && !isMouseDown()) {
      this.grabPressed = false
      if (this.grabbedBlock) {
        this.onRelease(this.grabbedBlock)
        this.grabbedBlock = undefined
      }
    }
  }
}
