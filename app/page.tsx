"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Users, Sparkles } from "lucide-react"

export default function HomePage() {
  const [roomKey, setRoomKey] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const generateRoomKey = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = async () => {
    setIsCreating(true)
    const newRoomKey = generateRoomKey()
    // Simulate room creation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/room/${newRoomKey}`)
  }

  const joinRoom = () => {
    if (roomKey.trim()) {
      router.push(`/room/${roomKey.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating decorative elements */}
        <div
          className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-32 w-6 h-6 bg-white/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-40 w-3 h-3 bg-white/20 rounded-full animate-bounce"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 right-20 w-5 h-5 bg-white/20 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Palette className="w-12 h-12 text-purple-600" />
              <Sparkles className="w-6 h-6 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            DrawTogether
          </CardTitle>
          <p className="text-gray-600 text-sm">Create art with friends in real-time!</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={createRoom}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Room...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create New Room
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Enter room key (e.g., ABC123)"
                value={roomKey}
                onChange={(e) => setRoomKey(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && joinRoom()}
                className="text-center font-mono text-lg tracking-wider border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                maxLength={6}
              />
              <Button
                onClick={joinRoom}
                disabled={!roomKey.trim()}
                variant="outline"
                className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold py-3 rounded-xl transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🎨 Draw together in real-time</p>
            <p>😊 React with emojis</p>
            <p>✨ Magical brush effects</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
