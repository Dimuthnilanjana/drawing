"use client"

import { useCallback } from "react"
import { useMyPresence, useMutation, useStorage, useBroadcastEvent } from "@/lib/liveblocks"

interface LineData {
  id: string
  points: { x: number; y: number }[]
  color: string
  width: number
  effect: "normal" | "sparkle" | "rainbow"
  userId: string
  userInfo: { nickname: string; emoji: string }
}

export function useLiveblocksDrawing() {
  const [myPresence, updateMyPresence] = useMyPresence()
  const lines = useStorage((root) => root.lines)
  const broadcastEvent = useBroadcastEvent()

  // Update cursor position
  const updateCursor = useCallback(
    (x: number, y: number) => {
      updateMyPresence({
        cursor: { x, y },
      })
    },
    [updateMyPresence],
  )

  // Start drawing
  const startDrawing = useCallback(() => {
    updateMyPresence({
      isDrawing: true,
    })
  }, [updateMyPresence])

  // Stop drawing
  const stopDrawing = useCallback(() => {
    updateMyPresence({
      isDrawing: false,
    })
  }, [updateMyPresence])

  // Add or update line
  const updateLine = useMutation(({ storage }, lineData: LineData) => {
    const lines = storage.get("lines")
    const existingIndex = lines.findIndex((line) => line.get("id") === lineData.id)

    if (existingIndex >= 0) {
      // Update existing line
      const existingLine = lines.get(existingIndex)
      existingLine?.set("points", lineData.points)
    } else {
      // Add new line
      lines.push({
        id: lineData.id,
        points: lineData.points,
        color: lineData.color,
        width: lineData.width,
        effect: lineData.effect,
        userId: lineData.userId,
        userInfo: lineData.userInfo,
      })
    }
  }, [])

  // Clear canvas
  const clearCanvas = useMutation(({ storage }) => {
    const lines = storage.get("lines")
    lines.clear()
  }, [])

  // Undo last line
  const undoLast = useMutation(({ storage }) => {
    const lines = storage.get("lines")
    if (lines.length > 0) {
      lines.delete(lines.length - 1)
    }
  }, [])

  // Broadcast emoji reaction
  const broadcastEmoji = useCallback(
    (emoji: string, x: number, y: number) => {
      broadcastEvent({
        type: "EMOJI_REACTION",
        emoji,
        x,
        y,
        userId: "current-user",
        userInfo: {
          nickname: myPresence.nickname,
          emoji: myPresence.emoji,
        },
      })
    },
    [broadcastEvent, myPresence],
  )

  return {
    lines: lines ? Array.from(lines) : [],
    updateCursor,
    startDrawing,
    stopDrawing,
    updateLine,
    clearCanvas,
    undoLast,
    broadcastEmoji,
  }
}
