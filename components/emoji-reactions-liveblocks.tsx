"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSound } from "@/hooks/use-sound"
import { useLiveblocksDrawing } from "@/hooks/use-liveblocks-drawing"
import { useEventListener } from "@/lib/liveblocks"

interface FloatingEmoji {
  id: string
  emoji: string
  x: number
  y: number
  opacity: number
  scale: number
}

const emojis = ["😀", "😍", "🎉", "👏", "❤️", "🔥", "✨", "🎨", "🌈", "⭐"]

export default function EmojiReactionsLiveblocks() {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { playSound } = useSound()
  const { broadcastEmoji } = useLiveblocksDrawing()

  // Listen for emoji reactions from other users
  useEventListener(({ event }) => {
    if (event.type === "EMOJI_REACTION") {
      addFloatingEmoji(event.emoji, event.x, event.y)
    }
  })

  // Animation loop for floating emojis
  useEffect(() => {
    const animate = () => {
      setFloatingEmojis((prev) =>
        prev
          .map((emoji) => ({
            ...emoji,
            y: emoji.y - 2,
            opacity: emoji.opacity - 0.01,
            scale: emoji.scale + 0.005,
          }))
          .filter((emoji) => emoji.opacity > 0),
      )
      requestAnimationFrame(animate)
    }
    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const addFloatingEmoji = (selectedEmoji: string, x?: number, y?: number) => {
    const newEmoji: FloatingEmoji = {
      id: `${Date.now()}-${Math.random()}`,
      emoji: selectedEmoji,
      x: x ?? Math.random() * (window.innerWidth - 100) + 50,
      y: y ?? window.innerHeight - 100,
      opacity: 1,
      scale: 1,
    }

    setFloatingEmojis((prev) => [...prev, newEmoji])
    playSound("emoji")
  }

  const handleEmojiClick = (selectedEmoji: string) => {
    const x = Math.random() * (window.innerWidth - 100) + 50
    const y = window.innerHeight - 100

    // Add local emoji
    addFloatingEmoji(selectedEmoji, x, y)

    // Broadcast to other users via Liveblocks
    broadcastEmoji(selectedEmoji, x, y)

    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Emojis */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {floatingEmojis.map((emoji) => (
          <div
            key={emoji.id}
            className="absolute text-4xl transition-all duration-100"
            style={{
              left: emoji.x,
              top: emoji.y,
              opacity: emoji.opacity,
              transform: `scale(${emoji.scale})`,
            }}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>

      {/* Emoji Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 shadow-lg text-2xl touch-manipulation"
        >
          😊
        </Button>
      </div>

      {/* Emoji Picker */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 z-40 border border-gray-200">
          <div className="grid grid-cols-5 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="w-12 h-12 text-2xl hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 touch-manipulation"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
