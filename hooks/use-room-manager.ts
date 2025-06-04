"use client"

import { useState, useEffect, useCallback } from "react"

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

export function useRoomManager(roomId: string) {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [userCursors, setUserCursors] = useState<UserCursor[]>([])
  const [currentUserId] = useState(() => `user-${Date.now()}-${Math.random()}`)

  // Simulate other users joining/leaving
  useEffect(() => {
    // Simulate some users already in the room
    const simulatedUsers: User[] = [
      {
        id: "user-1",
        nickname: "ArtLover",
        emoji: "🎨",
        isDrawing: false,
        lastSeen: Date.now(),
      },
      {
        id: "user-2",
        nickname: "Sketcher",
        emoji: "🐱",
        isDrawing: true,
        lastSeen: Date.now(),
      },
    ]

    // Randomly add/remove users to simulate real activity
    const interval = setInterval(() => {
      setConnectedUsers((prev) => {
        const shouldAddUser = Math.random() > 0.7 && prev.length < 5
        const shouldRemoveUser = Math.random() > 0.8 && prev.length > 1

        if (shouldAddUser) {
          const newUser: User = {
            id: `user-${Date.now()}`,
            nickname: `User${Math.floor(Math.random() * 100)}`,
            emoji: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊"][Math.floor(Math.random() * 6)],
            isDrawing: Math.random() > 0.5,
            lastSeen: Date.now(),
          }
          return [...prev, newUser]
        }

        if (shouldRemoveUser) {
          return prev.slice(1)
        }

        // Update drawing status randomly
        return prev.map((user) => ({
          ...user,
          isDrawing: Math.random() > 0.6,
          lastSeen: Date.now(),
        }))
      })
    }, 5000)

    // Set initial users
    setTimeout(() => {
      setConnectedUsers(simulatedUsers)
    }, 1000)

    return () => clearInterval(interval)
  }, [roomId])

  // Simulate cursor movements from other users
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCursors((prev) => {
        return connectedUsers.map((user) => {
          const existingCursor = prev.find((c) => c.id === user.id)
          return {
            id: user.id,
            x: existingCursor ? existingCursor.x + (Math.random() - 0.5) * 50 : Math.random() * 800,
            y: existingCursor ? existingCursor.y + (Math.random() - 0.5) * 50 : Math.random() * 600,
            nickname: user.nickname,
            emoji: user.emoji,
            lastSeen: Date.now(),
          }
        })
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [connectedUsers])

  const joinRoom = useCallback(
    (userInfo: { nickname: string; emoji: string }) => {
      console.log(`Joining room ${roomId} as ${userInfo.nickname} ${userInfo.emoji}`)
      // In real implementation: socket.emit('join-room', { roomId, userInfo })
    },
    [roomId],
  )

  const leaveRoom = useCallback(() => {
    console.log(`Leaving room ${roomId}`)
    // In real implementation: socket.emit('leave-room', { roomId })
  }, [roomId])

  const updateUserInfo = useCallback((userInfo: { nickname: string; emoji: string }) => {
    console.log(`Updating user info:`, userInfo)
    // In real implementation: socket.emit('update-user-info', userInfo)
  }, [])

  const broadcastCursor = useCallback((x: number, y: number) => {
    // In real implementation: socket.emit('cursor-move', { x, y, roomId })
    console.log(`Cursor moved to ${x}, ${y}`)
  }, [])

  return {
    connectedUsers,
    userCursors,
    currentUserId,
    joinRoom,
    leaveRoom,
    updateUserInfo,
    broadcastCursor,
  }
}
