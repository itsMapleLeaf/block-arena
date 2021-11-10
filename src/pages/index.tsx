import { useRef } from "react"
import { raise } from "../raise"
import { useAnimationLoop } from "../useAnimationLoop"

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const playerRef = useRef({
    x: 100,
    y: 100,
  })

  function update(delta: number) {
    playerRef.current.x += delta * 10
  }

  function draw() {
    const canvas = canvasRef.current ?? raise("Canvas ref not assigned")
    const ctx = canvas.getContext("2d") ?? raise("Canvas context not found")

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"

    ctx.beginPath()
    ctx.arc(playerRef.current.x, playerRef.current.y, 25, 0, Math.PI * 2)
    ctx.fill()
  }

  useAnimationLoop((delta) => {
    update(delta)
    draw()
  })

  return (
    <canvas
      width={800}
      height={600}
      ref={canvasRef}
      style={{
        backgroundColor: "black",
      }}
    />
  )
}
