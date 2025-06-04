"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { useSound } from "@/hooks/use-sound"

interface DrawingCanvasProps {
  roomId: string
}

interface Point {
  x: number
  y: number
}

interface LineData {
  id: string
  points: Point[]
  color: string
  width: number
  effect?: "sparkle" | "rainbow" | "normal"
}

interface Sparkle {
  id: string
  x: number
  y: number
  opacity: number
  scale: number
  createdAt: number
}

export default function DrawingCanvas({ roomId }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lines, setLines] = useState<LineData[]>([])
  const [currentLine, setCurrentLine] = useState<LineData | null>(null)
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [brushEffect, setBrushEffect] = useState<"normal" | "sparkle" | "rainbow">("normal")
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const { playSound } = useSound()

  // Handle window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 60,
      })
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  // Animation frame for sparkles
  useEffect(() => {
    let animationId: number

    const animate = () => {
      setSparkles((prev) => {
        const now = Date.now()
        return prev
          .map((sparkle) => ({
            ...sparkle,
            opacity: Math.max(0, sparkle.opacity - 0.02),
            scale: sparkle.scale + 0.01,
          }))
          .filter((sparkle) => sparkle.opacity > 0 && now - sparkle.createdAt < 2000)
      })
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Draw on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all lines
    const allLines = currentLine ? [...lines, currentLine] : lines

    allLines.forEach((line) => {
      if (line.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = line.color
      ctx.lineWidth = line.width
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Draw the line
      ctx.moveTo(line.points[0].x, line.points[0].y)
      for (let i = 1; i < line.points.length; i++) {
        if (line.effect === "rainbow") {
          // Change color for rainbow effect
          const colors = [
            "#ff0000",
            "#ff8000",
            "#ffff00",
            "#80ff00",
            "#00ff00",
            "#00ff80",
            "#00ffff",
            "#0080ff",
            "#0000ff",
            "#8000ff",
            "#ff00ff",
            "#ff0080",
          ]
          ctx.strokeStyle = colors[i % colors.length]
        }
        ctx.lineTo(line.points[i].x, line.points[i].y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(line.points[i].x, line.points[i].y)
      }
    })

    // Draw sparkles
    sparkles.forEach((sparkle) => {
      ctx.save()
      ctx.globalAlpha = sparkle.opacity
      ctx.fillStyle = "#FFD700"
      ctx.beginPath()
      ctx.arc(sparkle.x, sparkle.y, 2 * sparkle.scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
  }, [lines, currentLine, sparkles])

  // Redraw when data changes
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const addSparkles = useCallback((x: number, y: number) => {
    const newSparkles = Array.from({ length: 3 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      opacity: 1,
      scale: 0.5,
      createdAt: Date.now(),
    }))
    setSparkles((prev) => [...prev, ...newSparkles])
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e)
      setIsDrawing(true)

      const newLine: LineData = {
        id: `${Date.now()}`,
        points: [pos],
        color: brushColor,
        width: brushSize,
        effect: brushEffect,
      }

      setCurrentLine(newLine)
      playSound("draw")

      if (brushEffect === "sparkle") {
        addSparkles(pos.x, pos.y)
      }
    },
    [brushColor, brushSize, brushEffect, getMousePos, playSound, addSparkles],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentLine) return

      const pos = getMousePos(e)

      setCurrentLine((prev) => {
        if (!prev) return null
        return {
          ...prev,
          points: [...prev.points, pos],
        }
      })

      if (brushEffect === "sparkle" && Math.random() > 0.7) {
        addSparkles(pos.x, pos.y)
      }
    },
    [isDrawing, currentLine, getMousePos, brushEffect, addSparkles],
  )

  const handleMouseUp = useCallback(() => {
    if (currentLine && currentLine.points.length > 0) {
      setLines((prev) => [...prev, currentLine])
    }
    setCurrentLine(null)
    setIsDrawing(false)
  }, [currentLine])

  const clearCanvas = useCallback(() => {
    setLines([])
    setCurrentLine(null)
    setSparkles([])
    playSound("clear")
  }, [playSound])

  const undoLast = useCallback(() => {
    setLines((prev) => prev.slice(0, -1))
    playSound("undo")
  }, [playSound])

  // Expose functions to parent component
  useEffect(() => {
    window.drawingCanvasControls = {
      clearCanvas,
      undoLast,
      setBrushColor,
      setBrushSize,
      setBrushEffect,
    }
  }, [clearCanvas, undoLast])

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair bg-white"
        style={{ display: "block" }}
      />

      {/* Brush preview */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full border-2 border-gray-300"
            style={{
              width: Math.max(brushSize, 8),
              height: Math.max(brushSize, 8),
              backgroundColor: brushColor,
            }}
          />
          <div className="text-sm">
            <div className="font-semibold">
              {brushEffect === "normal" ? "Normal" : brushEffect === "sparkle" ? "✨ Sparkle" : "🌈 Rainbow"}
            </div>
            <div className="text-gray-500">Size: {brushSize}px</div>
          </div>
        </div>
      </div>
    </div>
  )
}
