"use client"

import { useEffect, useState } from "react"
import { Palette, Users, Wifi } from "lucide-react"

interface LoadingScreenProps {
  roomId: string
}

export default function LoadingScreen({ roomId }: LoadingScreenProps) {
  const [dots, setDots] = useState("")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2))
    }, 40)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Animated Logo */}
        <div className="mb-8 relative">
          <div className="flex justify-center items-center gap-4">
            <div className="relative">
              <Palette className="w-16 h-16 animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full animate-ping" />
            </div>
            <Users className="w-12 h-12 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <Wifi className="w-10 h-10 animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* Loading Text */}
        <h1 className="text-4xl font-bold mb-4">Joining Room {roomId}</h1>

        <p className="text-xl mb-8 opacity-90">Connecting to your creative space{dots}</p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-8">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm mt-2 opacity-75">{progress}%</p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-2 text-sm opacity-75">
          <div className={`transition-opacity duration-500 ${progress > 20 ? "opacity-100" : "opacity-50"}`}>
            ✓ Preparing canvas
          </div>
          <div className={`transition-opacity duration-500 ${progress > 50 ? "opacity-100" : "opacity-50"}`}>
            ✓ Loading brushes
          </div>
          <div className={`transition-opacity duration-500 ${progress > 80 ? "opacity-100" : "opacity-50"}`}>
            ✓ Syncing with room
          </div>
        </div>
      </div>
    </div>
  )
}
