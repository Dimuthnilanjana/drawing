export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function validateRoomId(roomId: string): boolean {
  return /^[A-Z0-9]{6}$/.test(roomId)
}

export function createShareableLink(roomId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/room/${roomId}`
  }
  return `/room/${roomId}`
}

// In a real implementation, these would connect to Socket.IO
export class RoomManager {
  private static instance: RoomManager
  private rooms: Map<string, any> = new Map()

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager()
    }
    return RoomManager.instance
  }

  joinRoom(roomId: string, userId: string) {
    // Simulate joining room
    console.log(`User ${userId} joined room ${roomId}`)

    // In real implementation:
    // socket.emit('join-room', { roomId, userId })
  }

  leaveRoom(roomId: string, userId: string) {
    // Simulate leaving room
    console.log(`User ${userId} left room ${roomId}`)

    // In real implementation:
    // socket.emit('leave-room', { roomId, userId })
  }

  broadcastDrawing(roomId: string, drawingData: any) {
    // Simulate broadcasting drawing data
    console.log(`Broadcasting drawing data to room ${roomId}`, drawingData)

    // In real implementation:
    // socket.to(roomId).emit('drawing-data', drawingData)
  }

  broadcastEmoji(roomId: string, emojiData: any) {
    // Simulate broadcasting emoji reaction
    console.log(`Broadcasting emoji to room ${roomId}`, emojiData)

    // In real implementation:
    // socket.to(roomId).emit('emoji-reaction', emojiData)
  }
}
