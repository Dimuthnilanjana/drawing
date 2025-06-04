"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"
import NicknameModal from "@/components/nickname-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check, Wifi } from "lucide-react"

// Dynamic imports to prevent SSR issues
const LiveblocksProvider = dynamic(() => import("@/components/liveblocks-provider"), {
  ssr: false,
})

const DrawingCanvas = dynamic(() => import("@/components/drawing-canvas-liveblocks"), {
  ssr: false,
})

const RoomControls = dynamic(() => import("@/components/room-controls-liveblocks"), {
  ssr: false,
})

const EmojiReactions = dynamic(() => import("@/components/emoji-reactions-liveblocks"), {
  ssr: false,
})

const OnlineUsers = dynamic(() => import("@/components/online-users-liveblocks"), {
  ssr: false,
})

function RoomContent() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [copied, setCopied] = useState(false)

  const copyRoomLink = async () => {
    const url = `${window.location.origin}/room/${roomId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveRoom = () => {
    router.push("/")
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
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Wifi className="w-3 h-3" />
              <span>Live</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="text-sm text-gray-500">Loading users...</div>}>
            <OnlineUsers />
          </Suspense>

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
        <Suspense fallback={<div className="w-full h-full bg-white" />}>
          <DrawingCanvas />
          <EmojiReactions />
          <RoomControls />
        </Suspense>
      </div>
    </div>
  )
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const [isLoading, setIsLoading] = useState(true)
  const [showNicknameModal, setShowNicknameModal] = useState(true)
  const [userInfo, setUserInfo] = useState<{ nickname: string; emoji: string } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleNicknameSubmit = (nickname: string, emoji: string) => {
    const newUserInfo = { nickname, emoji }
    setUserInfo(newUserInfo)
    setShowNicknameModal(false)
  }

  if (isLoading) {
    return <LoadingScreen roomId={roomId} />
  }

  if (showNicknameModal) {
    return <NicknameModal onSubmit={handleNicknameSubmit} roomId={roomId} />
  }

  if (!userInfo) {
    return <LoadingScreen roomId={roomId} />
  }

  return (
    <LiveblocksProvider roomId={roomId} userInfo={userInfo}>
      <RoomContent />
    </LiveblocksProvider>
  )
}
