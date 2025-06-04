"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface NicknameModalProps {
  onSubmit: (nickname: string, emoji: string) => void
  roomId: string
}

const petEmojis = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🦄",
  "🐲",
  "🦋",
  "🐝",
  "🐞",
  "🦀",
  "🐙",
  "🦆",
  "🦉",
  "🦅",
  "🐧",
  "🐺",
  "🦘",
  "🦒",
  "🐘",
  "🦏",
]

export default function NicknameModal({ onSubmit, roomId }: NicknameModalProps) {
  const [nickname, setNickname] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("🐶")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!nickname.trim()) {
      setError("Please enter a nickname")
      return
    }
    if (nickname.length > 20) {
      setError("Nickname must be 20 characters or less")
      return
    }
    onSubmit(nickname.trim(), selectedEmoji)
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
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="text-4xl">{selectedEmoji}</div>
              <Sparkles className="w-6 h-6 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join Room {roomId}
          </CardTitle>
          <p className="text-gray-600 text-sm">Choose your nickname and pet emoji!</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Nickname</label>
              <Input
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setError("")
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                className="text-center font-semibold text-lg border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                maxLength={20}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Your Pet Emoji</label>
              <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl bg-gray-50">
                {petEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-8 h-8 text-xl hover:bg-white rounded-lg transition-all duration-200 hover:scale-110 ${
                      selectedEmoji === emoji ? "bg-purple-100 scale-110 ring-2 ring-purple-400" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!nickname.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedEmoji}</span>
                Join Drawing Room
                <Sparkles className="w-4 h-4" />
              </div>
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>🎨 Your cursor will show your name and emoji</p>
            <p>👥 See who else is drawing with you</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
