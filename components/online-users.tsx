"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Crown } from "lucide-react"

interface User {
  id: string
  nickname: string
  emoji: string
  isDrawing?: boolean
  lastSeen?: number
}

interface OnlineUsersProps {
  users: User[]
  currentUser: { nickname: string; emoji: string } | null
}

export default function OnlineUsers({ users, currentUser }: OnlineUsersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const totalUsers = users.length + (currentUser ? 1 : 0)

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm"
        >
          <Users className="w-4 h-4" />
          <span>{totalUsers} online</span>
          <div className="flex -space-x-1">
            {currentUser && (
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs border-2 border-white">
                {currentUser.emoji}
              </div>
            )}
            {users.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs border-2 border-white"
              >
                {user.emoji}
              </div>
            ))}
            {users.length > 3 && (
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs border-2 border-white">
                +{users.length - 3}
              </div>
            )}
          </div>
        </Button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-64 z-50 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Online Users ({totalUsers})
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {/* Current User */}
              {currentUser && (
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xl">{currentUser.emoji}</div>
                  <div className="flex-1">
                    <div className="font-medium text-green-800 flex items-center gap-1">
                      {currentUser.nickname}
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="text-xs text-green-600">You</div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              )}

              {/* Other Users */}
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="text-xl">{user.emoji}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{user.nickname}</div>
                    <div className="text-xs text-gray-500">{user.isDrawing ? "✏️ Drawing..." : "👀 Watching"}</div>
                  </div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Waiting for others to join...</p>
                  <p className="text-xs">Share the room link!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </>
  )
}
