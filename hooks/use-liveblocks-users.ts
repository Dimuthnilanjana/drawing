"use client"

import { useOthers, useMyPresence } from "@/lib/liveblocks"

export function useLiveblocksUsers() {
  const others = useOthers()
  const [myPresence] = useMyPresence()

  // Get all connected users
  const connectedUsers = others.map((user) => ({
    id: user.connectionId.toString(),
    nickname: user.presence.nickname,
    emoji: user.presence.emoji,
    isDrawing: user.presence.isDrawing,
    lastSeen: Date.now(),
  }))

  // Get user cursors
  const userCursors = others
    .filter((user) => user.presence.cursor)
    .map((user) => ({
      id: user.connectionId.toString(),
      x: user.presence.cursor!.x,
      y: user.presence.cursor!.y,
      nickname: user.presence.nickname,
      emoji: user.presence.emoji,
      lastSeen: Date.now(),
    }))

  // Current user info
  const currentUser = {
    nickname: myPresence.nickname,
    emoji: myPresence.emoji,
  }

  return {
    connectedUsers,
    userCursors,
    currentUser,
    totalUsers: connectedUsers.length + 1,
  }
}
