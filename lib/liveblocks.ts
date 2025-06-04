import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

// Create Liveblocks client
const client = createClient({
  // Use public key for demo - in production, use your own Liveblocks key
  publicApiKey: "pk_dev_sgWWMObyHy2EZPvjgRRSTvZVH73c0xEXIp0bwAdIRrMBFKxe-12QXikMPIlJK9Rs",

  // For demo purposes, we'll use a mock authentication
  // In production, you'd implement proper authentication
  resolveUsers: async ({ userIds }) => {
    return userIds.map((userId) => ({
      name: userId,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    }))
  },

  resolveMentionSuggestions: async ({ text }) => {
    return []
  },
})

// Room types
export type Presence = {
  cursor: { x: number; y: number } | null
  nickname: string
  emoji: string
  isDrawing: boolean
}

export type Storage = {
  lines: LiveList<{
    id: string
    points: { x: number; y: number }[]
    color: string
    width: number
    effect: "normal" | "sparkle" | "rainbow"
    userId: string
    userInfo: { nickname: string; emoji: string }
  }>
  emojiReactions: LiveList<{
    id: string
    emoji: string
    x: number
    y: number
    timestamp: number
    userId: string
    userInfo: { nickname: string; emoji: string }
  }>
}

export type UserMeta = {
  id: string
  info: {
    name: string
    nickname: string
    emoji: string
  }
}

export type RoomEvent = {
  type: "EMOJI_REACTION"
  emoji: string
  x: number
  y: number
  userId: string
  userInfo: { nickname: string; emoji: string }
}

// Create room context
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useMutation,
  useStorage,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)

// Import LiveList type
import type { LiveList } from "@liveblocks/client"
