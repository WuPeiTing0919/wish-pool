"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Music, MicOffIcon as MusicOff, Volume2, VolumeX, ChevronDown } from "lucide-react"
import { backgroundMusicManager } from "@/lib/background-music"

interface HeaderMusicControlProps {
  mobileSimplified?: boolean
}

export default function HeaderMusicControl({ mobileSimplified = false }: HeaderMusicControlProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(30)
  const [showControls, setShowControls] = useState(false)
  const [musicInfo, setMusicInfo] = useState<any>(null)

  useEffect(() => {
    // 同步全局音樂管理器的狀態
    const syncState = () => {
      const state = backgroundMusicManager.getState()
      const info = backgroundMusicManager.getMusicInfo()
      setIsPlaying(state.isPlaying)
      setVolume(Math.round(state.volume * 100))
      setMusicInfo(info)
    }

    // 初始同步
    syncState()

    // 定期同步狀態
    const stateSync = setInterval(syncState, 1000)

    return () => {
      clearInterval(stateSync)
    }
  }, [])

  const toggleMusic = async () => {
    const currentState = backgroundMusicManager.getState()

    if (currentState.isPlaying) {
      backgroundMusicManager.stop()
      setIsPlaying(false)
    } else {
      await backgroundMusicManager.start()
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)
    backgroundMusicManager.setVolume(vol / 100)
  }

  // 手機版簡化模式 - 只顯示播放/暫停按鈕
  if (mobileSimplified) {
    return (
      <Button
        onClick={toggleMusic}
        variant="ghost"
        size="sm"
        className={`
          text-blue-200 hover:text-white hover:bg-blue-800/50 px-2 transition-all duration-300
          ${isPlaying ? "text-green-300 hover:text-green-200" : ""}
        `}
      >
        {isPlaying ? <Music className="w-4 h-4 animate-pulse" /> : <MusicOff className="w-4 h-4" />}
      </Button>
    )
  }

  return (
    <div className="relative">
      {/* 音量控制下拉面板 */}
      {showControls && (
        <div className="absolute top-full right-0 mt-2 z-50">
          <Card className="bg-slate-800/95 backdrop-blur-sm border border-blue-700/50 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <CardContent className="p-4 space-y-4 min-w-[200px]">
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={5} className="flex-1" />
                <Volume2 className="w-4 h-4 text-blue-300 flex-shrink-0" />
              </div>
              <div className="text-center">
                <div className="text-xs text-blue-200 mb-1">背景音樂音量</div>
                <div className="text-sm font-semibold text-white">{volume}%</div>
              </div>
              {/* 音樂資訊 */}
              {musicInfo && (
                <div className="text-xs text-slate-400 text-center border-t border-slate-600 pt-2">
                  <div>Just Relax</div>
                  <div>放鬆背景音樂</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header 音樂控制按鈕組 */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* 音量控制按鈕 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-1.5 sm:px-2 relative"
        >
          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <ChevronDown
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 sm:ml-1 transition-transform duration-200 ${showControls ? "rotate-180" : ""}`}
          />
        </Button>

        {/* 音樂播放/暫停按鈕 */}
        <Button
          onClick={toggleMusic}
          variant="ghost"
          size="sm"
          className={`
            text-blue-200 hover:text-white hover:bg-blue-800/50 px-1.5 sm:px-2 transition-all duration-300
            ${isPlaying ? "text-green-300 hover:text-green-200" : ""}
          `}
        >
          {isPlaying ? (
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
          ) : (
            <MusicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
