"use client"

import type { ReactNode } from "react"
import { RoomProvider } from "@/lib/liveblocks"

interface LiveblocksProviderProps {
  children: ReactNode
  roomId: string
  userInfo: { nickname: string; emoji: string }
}

export default function LiveblocksProvider({ children, roomId, userInfo }: LiveblocksProviderProps) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        nickname: userInfo.nickname,
        emoji: userInfo.emoji,
        isDrawing: false,
      }}
      initialStorage={{
        lines: [],
        emojiReactions: [],
      }}
    >
      <div className="h-screen">{children}</div>
    </RoomProvider>
  )
}
