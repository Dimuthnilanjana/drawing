"use client"

import { useState, useEffect, useCallback, useRef } from "react"

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

// Simulate a real-time room with localStorage for persistence
export function useRealTimeRoom(roomId: string) {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [userCursors, setUserCursors] = useState<UserCursor[]>([])
  const [remoteLines, setRemoteLines] = useState<LineData[]>([])
  const [currentUserId] = useState(() => `user-${Date.now()}-${Math.random()}`)
  const intervalRef = useRef<NodeJS.Timeout>()

  // Load existing room data
  useEffect(() => {
    const roomData = localStorage.getItem(`room-${roomId}`)
    if (roomData) {
      try {
        const parsed = JSON.parse(roomData)
        setRemoteLines(parsed.lines || [])
        setConnectedUsers(parsed.users || [])
      } catch (e) {
        console.error("Failed to parse room data:", e)
      }
    }
  }, [roomId])

  // Save room data periodically
  useEffect(() => {
    const saveRoomData = () => {
      const roomData = {
        lines: remoteLines,
        users: connectedUsers,
        lastUpdated: Date.now(),
      }
      localStorage.setItem(`room-${roomId}`, JSON.stringify(roomData))
    }

    const interval = setInterval(saveRoomData, 1000)
    return () => clearInterval(interval)
  }, [roomId, remoteLines, connectedUsers])

  // Simulate real-time updates by polling localStorage
  useEffect(() => {
    const pollForUpdates = () => {
      const roomData = localStorage.getItem(`room-${roomId}`)
      if (roomData) {
        try {
          const parsed = JSON.parse(roomData)
          if (parsed.lines) {
            setRemoteLines(parsed.lines)
          }
          if (parsed.users) {
            setConnectedUsers(parsed.users.filter((u: User) => u.id !== currentUserId))
          }
          if (parsed.cursors) {
            setUserCursors(parsed.cursors.filter((c: UserCursor) => c.id !== currentUserId))
          }
        } catch (e) {
          console.error("Failed to parse room updates:", e)
        }
      }
    }

    intervalRef.current = setInterval(pollForUpdates, 500)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [roomId, currentUserId])

  const joinRoom = useCallback(
    (userInfo: { nickname: string; emoji: string }) => {
      const newUser: User = {
        id: currentUserId,
        nickname: userInfo.nickname,
        emoji: userInfo.emoji,
        isDrawing: false,
        lastSeen: Date.now(),
      }

      // Add user to room
      const roomData = localStorage.getItem(`room-${roomId}`)
      const parsed = roomData ? JSON.parse(roomData) : {}

      parsed.users = parsed.users || []
      parsed.users = parsed.users.filter((u: User) => u.id !== currentUserId)
      parsed.users.push(newUser)

      localStorage.setItem(`room-${roomId}`, JSON.stringify(parsed))

      console.log(`${userInfo.nickname} ${userInfo.emoji} joined room ${roomId}`)
    },
    [roomId, currentUserId],
  )

  const leaveRoom = useCallback(() => {
    const roomData = localStorage.getItem(`room-${roomId}`)
    if (roomData) {
      try {
        const parsed = JSON.parse(roomData)
        parsed.users = (parsed.users || []).filter((u: User) => u.id !== currentUserId)
        parsed.cursors = (parsed.cursors || []).filter((c: UserCursor) => c.id !== currentUserId)
        localStorage.setItem(`room-${roomId}`, JSON.stringify(parsed))
      } catch (e) {
        console.error("Failed to leave room:", e)
      }
    }
  }, [roomId, currentUserId])

  const broadcastCursor = useCallback(
    (x: number, y: number, userInfo: { nickname: string; emoji: string }) => {
      const roomData = localStorage.getItem(`room-${roomId}`)
      const parsed = roomData ? JSON.parse(roomData) : {}

      parsed.cursors = parsed.cursors || []
      parsed.cursors = parsed.cursors.filter((c: UserCursor) => c.id !== currentUserId)

      parsed.cursors.push({
        id: currentUserId,
        x,
        y,
        nickname: userInfo.nickname,
        emoji: userInfo.emoji,
        lastSeen: Date.now(),
      })

      localStorage.setItem(`room-${roomId}`, JSON.stringify(parsed))
    },
    [roomId, currentUserId],
  )

  const broadcastDrawing = useCallback(
    (lineData: LineData) => {
      const roomData = localStorage.getItem(`room-${roomId}`)
      const parsed = roomData ? JSON.parse(roomData) : {}

      parsed.lines = parsed.lines || []

      // Update existing line or add new one
      const existingIndex = parsed.lines.findIndex((l: LineData) => l.id === lineData.id)
      if (existingIndex >= 0) {
        parsed.lines[existingIndex] = lineData
      } else {
        parsed.lines.push(lineData)
      }

      localStorage.setItem(`room-${roomId}`, JSON.stringify(parsed))
    },
    [roomId],
  )

  return {
    connectedUsers,
    userCursors,
    remoteLines,
    currentUserId,
    joinRoom,
    leaveRoom,
    broadcastCursor,
    broadcastDrawing,
  }
}
