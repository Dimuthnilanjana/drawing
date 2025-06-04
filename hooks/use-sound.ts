"use client"

import { useState, useCallback, useRef } from "react"

type SoundType = "draw" | "emoji" | "click" | "clear" | "undo"

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      if (!soundEnabled) return

      try {
        const audioContext = getAudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = type

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (error) {
        console.warn("Audio playback failed:", error)
      }
    },
    [soundEnabled, getAudioContext],
  )

  const playSound = useCallback(
    (type: SoundType) => {
      switch (type) {
        case "draw":
          playTone(800, 0.1, "sine")
          break
        case "emoji":
          // Happy ascending notes
          playTone(523, 0.1, "sine") // C
          setTimeout(() => playTone(659, 0.1, "sine"), 50) // E
          setTimeout(() => playTone(784, 0.1, "sine"), 100) // G
          break
        case "click":
          playTone(1000, 0.05, "square")
          break
        case "clear":
          // Descending sweep
          playTone(1000, 0.3, "sawtooth")
          setTimeout(() => playTone(500, 0.3, "sawtooth"), 100)
          break
        case "undo":
          playTone(400, 0.2, "triangle")
          break
      }
    },
    [playTone],
  )

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
    if (!soundEnabled) {
      playSound("click")
    }
  }, [soundEnabled, playSound])

  return {
    soundEnabled,
    toggleSound,
    playSound,
  }
}
