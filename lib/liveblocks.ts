import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

// Create Liveblocks client with a working demo key
const client = createClient({
  // Demo public key - replace with your own from liveblocks.io
  publicApiKey: "pk_dev_sgWWMObyHy2EZPvjgRRSTvZVH73c0xEXIp0bwAdIRrMBFKxe-12QXikMPIlJK9Rs",

  // Throttle updates for better performance
  throttle: 16,
})

// Room types
export type Presence = {
  cursor: { x: number; y: number } | null
  nickname: string
  emoji: string
  isDrawing: boolean
}

export type Storage = {
  lines: any[]
  emojiReactions: any[]
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
