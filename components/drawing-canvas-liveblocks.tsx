"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useSound } from "@/hooks/use-sound"
import { useLiveblocksDrawing } from "@/hooks/use-liveblocks-drawing"
import { useLiveblocksUsers } from "@/hooks/use-liveblocks-users"

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
  userId?: string
  userInfo?: { nickname: string; emoji: string }
}

interface Sparkle {
  id: string
  x: number
  y: number
  opacity: number
  scale: number
  createdAt: number
}

export default function DrawingCanvasLiveblocks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [localLines, setLocalLines] = useState<LineData[]>([])
  const [currentLine, setCurrentLine] = useState<LineData | null>(null)
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [brushEffect, setBrushEffect] = useState<"normal" | "sparkle" | "rainbow">("normal")
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const { playSound } = useSound()

  // Liveblocks hooks
  const { lines, updateCursor, startDrawing, stopDrawing, updateLine, clearCanvas, undoLast } = useLiveblocksDrawing()
  const { userCursors, currentUser } = useLiveblocksUsers()

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

    // Combine local and remote lines
    const allLines = [...localLines, ...lines]
    if (currentLine) {
      allLines.push(currentLine)
    }

    // Draw all lines
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

    // Draw user cursors
    userCursors.forEach((cursor) => {
      drawUserCursor(ctx, cursor)
    })
  }, [localLines, lines, currentLine, sparkles, userCursors])

  const drawUserCursor = (ctx: CanvasRenderingContext2D, cursor: any) => {
    ctx.save()

    // Draw cursor pointer
    ctx.fillStyle = "#4F46E5"
    ctx.beginPath()
    ctx.moveTo(cursor.x, cursor.y)
    ctx.lineTo(cursor.x + 12, cursor.y + 4)
    ctx.lineTo(cursor.x + 5, cursor.y + 12)
    ctx.closePath()
    ctx.fill()

    // Draw white outline
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw user info bubble
    const text = `${cursor.emoji} ${cursor.nickname}`
    ctx.font = "12px Inter, sans-serif"
    const textWidth = ctx.measureText(text).width

    // Background bubble
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    const bubbleX = cursor.x + 15
    const bubbleY = cursor.y - 25
    const bubbleWidth = textWidth + 12
    const bubbleHeight = 20

    ctx.beginPath()
    ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10)
    ctx.fill()

    // Text
    ctx.fillStyle = "white"
    ctx.fillText(text, bubbleX + 6, bubbleY + 14)

    ctx.restore()
  }

  // Redraw when data changes
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // Get position from mouse or touch event
  const getEventPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
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

  const handleStartDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const pos = getEventPos(e)
      setIsDrawing(true)
      startDrawing()

      const newLine: LineData = {
        id: `${Date.now()}-${Math.random()}`,
        points: [pos],
        color: brushColor,
        width: brushSize,
        effect: brushEffect,
        userId: "current-user",
        userInfo: currentUser,
      }

      setCurrentLine(newLine)
      playSound("draw")

      if (brushEffect === "sparkle") {
        addSparkles(pos.x, pos.y)
      }
    },
    [brushColor, brushSize, brushEffect, getEventPos, playSound, addSparkles, currentUser, startDrawing],
  )

  const handleContinueDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const pos = getEventPos(e)

      // Always update cursor position
      updateCursor(pos.x, pos.y)

      if (!isDrawing || !currentLine) return

      setCurrentLine((prev) => {
        if (!prev) return null
        const updatedLine = {
          ...prev,
          points: [...prev.points, pos],
        }

        // Update line in Liveblocks
        updateLine(updatedLine)

        return updatedLine
      })

      if (brushEffect === "sparkle" && Math.random() > 0.7) {
        addSparkles(pos.x, pos.y)
      }
    },
    [isDrawing, currentLine, getEventPos, brushEffect, addSparkles, updateCursor, updateLine],
  )

  const handleStopDrawing = useCallback(() => {
    if (currentLine && currentLine.points.length > 0) {
      setLocalLines((prev) => [...prev, currentLine])
      updateLine(currentLine)
    }
    setCurrentLine(null)
    setIsDrawing(false)
    stopDrawing()
  }, [currentLine, updateLine, stopDrawing])

  const handleClearCanvas = useCallback(() => {
    setLocalLines([])
    setCurrentLine(null)
    setSparkles([])
    clearCanvas()
    playSound("clear")
  }, [clearCanvas, playSound])

  const handleUndoLast = useCallback(() => {
    if (localLines.length > 0) {
      setLocalLines((prev) => prev.slice(0, -1))
    } else {
      undoLast()
    }
    playSound("undo")
  }, [localLines, undoLast, playSound])

  // Expose functions to parent component
  useEffect(() => {
    window.drawingCanvasControls = {
      clearCanvas: handleClearCanvas,
      undoLast: handleUndoLast,
      setBrushColor,
      setBrushSize,
      setBrushEffect,
    }
  }, [handleClearCanvas, handleUndoLast])

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        // Mouse events
        onMouseDown={handleStartDrawing}
        onMouseMove={handleContinueDrawing}
        onMouseUp={handleStopDrawing}
        onMouseLeave={handleStopDrawing}
        // Touch events for mobile
        onTouchStart={handleStartDrawing}
        onTouchMove={handleContinueDrawing}
        onTouchEnd={handleStopDrawing}
        className="cursor-crosshair bg-white touch-none"
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

      {/* Current user info */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">{currentUser.emoji}</span>
          <span className="font-semibold">{currentUser.nickname}</span>
        </div>
      </div>
    </div>
  )
}
