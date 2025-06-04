"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Palette, Eraser, Undo, Volume2, VolumeX, Sparkles, Brush } from "lucide-react"
import { useSound } from "@/hooks/use-sound"

const colors = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
]

export default function RoomControls() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [brushEffect, setBrushEffect] = useState<"normal" | "sparkle" | "rainbow">("normal")
  const { soundEnabled, toggleSound, playSound } = useSound()

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    if (window.drawingCanvasControls) {
      window.drawingCanvasControls.setBrushColor(color)
    }
    playSound("click")
  }

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0])
    if (window.drawingCanvasControls) {
      window.drawingCanvasControls.setBrushSize(value[0])
    }
  }

  const handleBrushEffectChange = (effect: "normal" | "sparkle" | "rainbow") => {
    setBrushEffect(effect)
    if (window.drawingCanvasControls) {
      window.drawingCanvasControls.setBrushEffect(effect)
    }
    playSound("click")
  }

  const handleClear = () => {
    if (window.drawingCanvasControls) {
      window.drawingCanvasControls.clearCanvas()
    }
  }

  const handleUndo = () => {
    if (window.drawingCanvasControls) {
      window.drawingCanvasControls.undoLast()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          <Palette className="w-6 h-6" />
        </Button>
      </div>

      {/* Controls Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-80 z-40 border border-gray-200">
          <div className="space-y-6">
            {/* Colors */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Colors
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      selectedColor === color ? "border-gray-800 scale-110" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Effects */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Brush Effects</h3>
              <div className="flex gap-2">
                <Button
                  variant={brushEffect === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBrushEffectChange("normal")}
                  className="flex-1"
                >
                  <Brush className="w-4 h-4 mr-1" />
                  Normal
                </Button>
                <Button
                  variant={brushEffect === "sparkle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBrushEffectChange("sparkle")}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Sparkle
                </Button>
                <Button
                  variant={brushEffect === "rainbow" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBrushEffectChange("rainbow")}
                  className="flex-1"
                >
                  🌈 Rainbow
                </Button>
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Brush Size: {brushSize}px</h3>
              <Slider
                value={[brushSize]}
                onValueChange={handleBrushSizeChange}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleUndo} className="flex-1">
                <Undo className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
                <Eraser className="w-4 h-4 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={toggleSound} className="px-3">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
