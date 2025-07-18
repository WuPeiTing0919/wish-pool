"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react"
import { soundManager } from "@/lib/sound-effects"

export default function TestPage() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationPaused, setAnimationPaused] = useState(false)
  const [animationStatus, setAnimationStatus] = useState<string>("檢查中...")

  useEffect(() => {
    // 檢查動畫是否正常運作
    const checkAnimations = () => {
      const testElement = document.createElement("div")
      testElement.className = "animate-pulse"
      testElement.style.position = "absolute"
      testElement.style.top = "-1000px"
      document.body.appendChild(testElement)

      const computedStyle = window.getComputedStyle(testElement)
      const animationName = computedStyle.animationName

      document.body.removeChild(testElement)

      if (animationName && animationName !== "none") {
        setAnimationStatus("✅ 動畫系統正常")
      } else {
        setAnimationStatus("❌ 動畫系統異常")
      }
    }

    setTimeout(checkAnimations, 1000)
  }, [])

  useEffect(() => {
    // 初始化音效系統
    const initSound = async () => {
      const handleFirstInteraction = async () => {
        await soundManager.play("hover")
        document.removeEventListener("click", handleFirstInteraction)
      }
      document.addEventListener("click", handleFirstInteraction)
    }
    initSound()
  }, [])

  const playSound = async (soundName: string) => {
    if (soundEnabled) {
      await soundManager.play(soundName)
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    soundManager.toggle()
  }

  const toggleAnimation = () => {
    setAnimationPaused(!animationPaused)
    const style = document.createElement("style")
    style.textContent = animationPaused
      ? ""
      : `
      * {
        animation-play-state: paused !important;
      }
    `
    style.id = "animation-control"

    const existing = document.getElementById("animation-control")
    if (existing) {
      existing.remove()
    }

    if (!animationPaused) {
      document.head.appendChild(style)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">音效動畫測試中心</h1>
              <Badge className="bg-red-500/20 text-red-200 border border-red-400/30">隱藏頁面</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="text-blue-200 hover:text-white hover:bg-blue-800/50"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                {soundEnabled ? "音效開啟" : "音效關閉"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAnimation}
                className="text-blue-200 hover:text-white hover:bg-blue-800/50"
              >
                {animationPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {animationPaused ? "恢復動畫" : "暫停動畫"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 音效測試區 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Volume2 className="w-6 h-6 text-cyan-400" />
                  音效測試區
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => playSound("click")}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                  >
                    🔘 點擊音效
                  </Button>

                  <Button
                    onClick={() => playSound("hover")}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    ✨ 懸停音效
                  </Button>

                  <Button
                    onClick={() => playSound("submit")}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    📤 提交音效
                  </Button>

                  <Button
                    onClick={() => playSound("success")}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                  >
                    🎉 成功音效
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">音效說明：</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>
                      • <strong>點擊音效</strong>：溫柔的水滴聲，用於按鈕點擊
                    </li>
                    <li>
                      • <strong>懸停音效</strong>：輕柔的鈴聲，用於滑鼠懸停
                    </li>
                    <li>
                      • <strong>提交音效</strong>：和諧的三音和弦，用於表單提交
                    </li>
                    <li>
                      • <strong>成功音效</strong>：豐富的四音和弦，用於操作成功
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 動畫測試區 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  動畫測試區
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 許願瓶動畫展示 - 使用內聯樣式確保動畫運作 */}
                <div className="text-center mb-8">
                  <h4 className="text-white font-semibold mb-4">許願瓶呼吸動畫</h4>
                  <div className="relative mx-auto w-24 h-32 mb-6">
                    <div
                      className="absolute bottom-0 left-1/2 w-16 h-24 bg-gradient-to-b from-cyan-100/30 to-blue-200/40 rounded-t-xl rounded-b-lg shadow-xl shadow-cyan-500/20 backdrop-blur-sm border border-cyan-300/30"
                      style={{
                        transform: "translateX(-50%)",
                        animation: "bottleBreathe 6s ease-in-out infinite",
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-slate-700 rounded-t-md"></div>
                      <div
                        className="absolute inset-2 bg-gradient-radial from-yellow-300/40 via-cyan-300/20 to-transparent rounded-t-lg rounded-b-md"
                        style={{
                          animation: "glowPulse 4s ease-in-out infinite",
                        }}
                      ></div>
                      <div className="absolute top-1 left-1 w-1 h-16 bg-white/20 rounded-full"></div>

                      {/* 星光粒子 - 使用內聯動畫 */}
                      <div
                        className="absolute top-3 right-3 w-1 h-1 bg-cyan-300 rounded-full"
                        style={{
                          animation: "sparkleFloat 8s ease-in-out infinite",
                        }}
                      ></div>
                      <div
                        className="absolute bottom-4 left-3 w-1 h-1 bg-yellow-300 rounded-full"
                        style={{
                          animation: "sparkleDrift 10s ease-in-out infinite",
                        }}
                      ></div>
                      <div
                        className="absolute top-8 left-4 w-1 h-1 bg-pink-300 rounded-full"
                        style={{
                          animation: "sparkleTwinkle 5s ease-in-out infinite",
                        }}
                      ></div>
                      <div
                        className="absolute bottom-6 right-4 w-1 h-1 bg-purple-300 rounded-full"
                        style={{
                          animation: "sparkleGentle 12s ease-in-out infinite",
                        }}
                      ></div>
                    </div>

                    {/* 呼吸光暈 */}
                    <div
                      className="absolute bottom-0 left-1/2 w-28 h-28 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-xl -z-10"
                      style={{
                        transform: "translateX(-50%)",
                        animation: "auraBreathe 6s ease-in-out infinite",
                      }}
                    ></div>
                  </div>
                </div>

                {/* 動畫說明 */}
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">動畫說明：</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>
                      • <strong>瓶身呼吸</strong>：6秒週期的上下浮動 + 亮度變化
                    </li>
                    <li>
                      • <strong>內部發光</strong>：4秒週期的脈動效果
                    </li>
                    <li>
                      • <strong>光暈呼吸</strong>：6秒週期的透明度和縮放變化
                    </li>
                    <li>
                      • <strong>星光粒子</strong>：4種不同的飄散動畫
                    </li>
                  </ul>
                </div>
                {/* 動畫狀態顯示 */}
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">動畫系統狀態：</span>
                    <Badge
                      className={
                        animationStatus.includes("✅") ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"
                      }
                    >
                      {animationStatus}
                    </Badge>
                  </div>
                </div>

                {/* 內聯 CSS 動畫定義 */}
                <style jsx>{`
                  @keyframes bottleBreathe {
                    0%, 100% {
                      transform: translateX(-50%) translateY(0px);
                      filter: brightness(1);
                    }
                    50% {
                      transform: translateX(-50%) translateY(-3px);
                      filter: brightness(1.1);
                    }
                  }
                  
                  @keyframes auraBreathe {
                    0%, 100% {
                      opacity: 0.2;
                      transform: translateX(-50%) scale(1);
                    }
                    50% {
                      opacity: 0.4;
                      transform: translateX(-50%) scale(1.05);
                    }
                  }
                  
                  @keyframes glowPulse {
                    0%, 100% {
                      opacity: 0.3;
                      filter: brightness(1);
                    }
                    50% {
                      opacity: 0.6;
                      filter: brightness(1.2);
                    }
                  }
                  
                  @keyframes sparkleFloat {
                    0%, 100% {
                      transform: translateY(0px) scale(1);
                      opacity: 0.4;
                    }
                    50% {
                      transform: translateY(-2px) scale(1.1);
                      opacity: 0.8;
                    }
                  }
                  
                  @keyframes sparkleDrift {
                    0%, 100% {
                      transform: translateX(0px) translateY(0px) scale(1);
                      opacity: 0.3;
                    }
                    50% {
                      transform: translateX(1px) translateY(-1px) scale(1.2);
                      opacity: 0.7;
                    }
                  }
                  
                  @keyframes sparkleTwinkle {
                    0%, 100% {
                      opacity: 0.2;
                      transform: scale(0.8);
                    }
                    50% {
                      opacity: 0.6;
                      transform: scale(1.1);
                    }
                  }
                  
                  @keyframes sparkleGentle {
                    0%, 100% {
                      opacity: 0.3;
                      transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                      opacity: 0.6;
                      transform: translateY(-1px) rotate(180deg);
                    }
                  }
                `}</style>
              </CardContent>
            </Card>
          </div>

          {/* 星光粒子測試區 */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-700/50 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">✨ 星光粒子動畫測試</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-8 text-center">
                <div>
                  <h4 className="text-white font-semibold mb-4">Float 飄浮</h4>
                  <div className="relative h-16 flex items-center justify-center">
                    <div
                      className="w-3 h-3 bg-cyan-300 rounded-full"
                      style={{ animation: "sparkleFloat 8s ease-in-out infinite" }}
                    ></div>
                  </div>
                  <p className="text-blue-200 text-xs mt-2">8秒週期上下飄動</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-4">Drift 漂移</h4>
                  <div className="relative h-16 flex items-center justify-center">
                    <div
                      className="w-3 h-3 bg-yellow-300 rounded-full"
                      style={{ animation: "sparkleDrift 10s ease-in-out infinite" }}
                    ></div>
                  </div>
                  <p className="text-blue-200 text-xs mt-2">10秒週期左右漂移</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-4">Twinkle 閃爍</h4>
                  <div className="relative h-16 flex items-center justify-center">
                    <div
                      className="w-3 h-3 bg-pink-300 rounded-full"
                      style={{ animation: "sparkleTwinkle 5s ease-in-out infinite" }}
                    ></div>
                  </div>
                  <p className="text-blue-200 text-xs mt-2">5秒週期透明度變化</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-4">Gentle 溫柔</h4>
                  <div className="relative h-16 flex items-center justify-center">
                    <div
                      className="w-3 h-3 bg-purple-300 rounded-full"
                      style={{ animation: "sparkleGentle 12s ease-in-out infinite" }}
                    ></div>
                  </div>
                  <p className="text-blue-200 text-xs mt-2">12秒週期旋轉飄動</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 測試控制區 */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-700/50 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">🎛️ 測試控制</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重新載入頁面
                </Button>

                <Button
                  onClick={() => {
                    playSound("click")
                    setTimeout(() => playSound("submit"), 500)
                    setTimeout(() => playSound("success"), 1000)
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  🎵 播放音效序列
                </Button>

                <Button
                  onClick={() => window.open("/", "_blank")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  🏠 回到主頁面
                </Button>
              </div>

              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-white font-semibold mb-2">測試說明：</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>
                    • 這是隱藏的測試頁面，訪問路徑：<code className="bg-slate-600 px-1 rounded">/test</code>
                  </li>
                  <li>• 可以單獨測試每個音效和動畫效果</li>
                  <li>• 使用右上角的控制按鈕來開關音效和暫停動畫</li>
                  <li>• 所有效果都會在實際頁面中正常運作</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
