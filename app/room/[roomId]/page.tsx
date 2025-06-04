"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DrawingCanvas from "@/components/drawing-canvas"
import RoomControls from "@/components/room-controls"
import EmojiReactions from "@/components/emoji-reactions"
import LoadingScreen from "@/components/loading-screen"
import OnlineUsers from "@/components/online-users"
import NicknameModal from "@/components/nickname-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { useRealTimeRoom } from "@/hooks/use-realtime-room"

interface LineData {
  id: string
  points: { x: number; y: number }[]
  color: string
  width: number
  effect?: "sparkle" | "rainbow" | "normal"
  userId?: string
  userInfo?: { nickname: string; emoji: string }
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(true)
  const [userInfo, setUserInfo] = useState<{ nickname: string; emoji: string } | null>(null)

  const { connectedUsers, userCursors, remoteLines, joinRoom, leaveRoom, broadcastCursor, broadcastDrawing } =
    useRealTimeRoom(roomId)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleNicknameSubmit = (nickname: string, emoji: string) => {
    const newUserInfo = { nickname, emoji }
    setUserInfo(newUserInfo)
    setShowNicknameModal(false)
    joinRoom(newUserInfo)
  }

  const copyRoomLink = async () => {
    const url = `${window.location.origin}/room/${roomId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    router.push("/")
  }

  const handleCursorMove = (x: number, y: number) => {
    if (userInfo) {
      broadcastCursor(x, y, userInfo)
    }
  }

  const handleDrawingUpdate = (lineData: LineData) => {
    broadcastDrawing(lineData)
  }

  if (isLoading) {
    return <LoadingScreen roomId={roomId} />
  }

  if (showNicknameModal) {
    return <NicknameModal onSubmit={handleNicknameSubmit} roomId={roomId} />
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLeaveRoom} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Leave
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="font-semibold text-gray-800">Room {roomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <OnlineUsers users={connectedUsers} currentUser={userInfo} />

          <Button variant="outline" size="sm" onClick={copyRoomLink} className="text-xs">
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Share
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <DrawingCanvas
          roomId={roomId}
          userCursors={userCursors}
          onCursorMove={handleCursorMove}
          onDrawingUpdate={handleDrawingUpdate}
          currentUser={userInfo}
          remoteLines={remoteLines}
        />
        <EmojiReactions />
        <RoomControls />
      </div>
    </div>
  )
}
