import { Vector } from "matter-js"
import { clamp } from "../helpers/clamp"

export const originVector: Vector = { x: 0, y: 0 }

export function clampVector(vector: Vector, min: Vector, max: Vector): Vector {
  return {
    x: clamp(vector.x, min.x, max.x),
    y: clamp(vector.y, min.y, max.y),
  }
}

export function lerpVector(
  vector: Vector,
  target: Vector,
  amount: number,
): Vector {
  return Vector.add(vector, Vector.mult(Vector.sub(target, vector), amount))
}

export function lerpVectorClamped(
  vector: Vector,
  target: Vector,
  amount: number,
): Vector {
  return lerpVector(vector, target, clamp(amount, 0, 1))
}
