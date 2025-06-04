"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { io, type Socket } from "socket.io-client"

interface User {
  id: string
  nickname: string
  emoji: string
  isDrawing?: boolean
  lastSeen?: number
}

interface UserCursor {
  id: string
  x: number
  y: number
  nickname: string
  emoji: string
  lastSeen: number
}

interface LineData {
  id: string
  points: { x: number; y: number }[]
  color: string
  width: number
  effect?: "sparkle" | "rainbow" | "normal"
  userId?: string
  userInfo?: { nickname: string; emoji: string }
}

interface EmojiReaction {
  id: string
  emoji: string
  x: number
  y: number
  userId: string
  userInfo: { nickname: string; emoji: string }
}

// Use your deployed server URL or localhost for development
const SERVER_URL = "https://silly-arithmetic-4e444b.netlify.app"

export function useRealTimeRoom(roomId: string) {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [userCursors, setUserCursors] = useState<UserCursor[]>([])
  const [remoteLines, setRemoteLines] = useState<LineData[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const socketRef = useRef<Socket | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  // Initialize socket connection
  useEffect(() => {
    console.log("🔌 Connecting to server:", SERVER_URL)

    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket.id)
      setConnectionStatus("connected")
      setCurrentUserId(socket.id)
    })

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server")
      setConnectionStatus("disconnected")
    })

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error)
      setConnectionStatus("disconnected")
    })

    // Room state when joining
    socket.on("room-state", (data) => {
      console.log("📦 Received room state:", data)
      setConnectedUsers(data.users || [])
      setRemoteLines(data.lines || [])
      setUserCursors(data.cursors || [])
    })

    // User joined
    socket.on("user-joined", (data) => {
      console.log("👋 User joined:", data.user)
      setConnectedUsers(data.users || [])
    })

    // User left
    socket.on("user-left", (data) => {
      console.log("👋 User left:", data.userId)
      setConnectedUsers(data.users || [])
      setUserCursors((prev) => prev.filter((cursor) => cursor.id !== data.userId))
    })

    // Drawing updates
    socket.on("drawing-update", (lineData) => {
      console.log("🎨 Received drawing update:", lineData.id)
      setRemoteLines((prev) => {
        const existingIndex = prev.findIndex((line) => line.id === lineData.id)
        if (existingIndex >= 0) {
          const newLines = [...prev]
          newLines[existingIndex] = lineData
          return newLines
        } else {
          return [...prev, lineData]
        }
      })
    })

    // Cursor updates
    socket.on("cursor-update", (cursor) => {
      setUserCursors((prev) => {
        const filtered = prev.filter((c) => c.id !== cursor.id)
        return [...filtered, cursor]
      })
    })

    // Canvas cleared
    socket.on("canvas-cleared", () => {
      console.log("🧹 Canvas cleared by another user")
      setRemoteLines([])
    })

    // Emoji reactions
    socket.on("emoji-reaction", (reaction) => {
      console.log("😊 Emoji reaction:", reaction)
      // Handle emoji reactions in parent component
      window.dispatchEvent(
        new CustomEvent("emoji-reaction", {
          detail: reaction,
        }),
      )
    })

    return () => {
      console.log("🔌 Disconnecting socket")
      socket.disconnect()
    }
  }, [roomId])

  const joinRoom = useCallback(
    (userInfo: { nickname: string; emoji: string }) => {
      if (socketRef.current?.connected) {
        console.log("🚪 Joining room:", roomId, "as:", userInfo)
        socketRef.current.emit("join-room", { roomId, userInfo })
      } else {
        console.error("❌ Socket not connected, cannot join room")
      }
    },
    [roomId],
  )

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      console.log("🚪 Leaving room:", roomId)
      socketRef.current.disconnect()
    }
  }, [roomId])

  const broadcastCursor = useCallback((x: number, y: number, userInfo: { nickname: string; emoji: string }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("cursor-move", { x, y, userInfo })
    }
  }, [])

  const broadcastDrawing = useCallback((lineData: LineData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("drawing-update", lineData)
    }
  }, [])

  const broadcastEmojiReaction = useCallback((emoji: string, x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("emoji-reaction", { emoji, x, y })
    }
  }, [])

  const clearCanvas = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear-canvas")
      setRemoteLines([])
    }
  }, [])

  return {
    connectedUsers: connectedUsers.filter((user) => user.id !== currentUserId),
    userCursors: userCursors.filter((cursor) => cursor.id !== currentUserId),
    remoteLines,
    connectionStatus,
    currentUserId,
    joinRoom,
    leaveRoom,
    broadcastCursor,
    broadcastDrawing,
    broadcastEmojiReaction,
    clearCanvas,
  }
}
