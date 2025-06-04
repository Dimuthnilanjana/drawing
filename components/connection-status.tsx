"use client"

import { Wifi, WifiOff, Loader2 } from "lucide-react"

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected"
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Wifi className="w-3 h-3" />,
          color: "bg-green-400",
          text: "Connected",
          animate: "animate-pulse",
        }
      case "connecting":
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          color: "bg-yellow-400",
          text: "Connecting",
          animate: "animate-pulse",
        }
      case "disconnected":
        return {
          icon: <WifiOff className="w-3 h-3" />,
          color: "bg-red-400",
          text: "Disconnected",
          animate: "animate-bounce",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 ${config.color} rounded-full ${config.animate}`} />
      <span className="text-xs text-gray-600 hidden sm:inline">{config.text}</span>
    </div>
  )
}
