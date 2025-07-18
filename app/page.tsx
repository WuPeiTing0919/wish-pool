"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageCircle, Users, BarChart3 } from "lucide-react"
import HeaderMusicControl from "@/components/header-music-control"

interface Star {
  id: number;
  style: {
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  };
}

export default function HomePage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [bigStars, setBigStars] = useState<Star[]>([]);

  useEffect(() => {
    // 生成小星星
    setStars(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        },
      }))
    );

    // 生成大星星
    setBigStars(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        },
      }))
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex flex-col">
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 星星 */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full animate-pulse"
            style={star.style}
          />
        ))}

        {/* 較大的星星 */}
        {bigStars.map((star) => (
          <div
            key={`big-${star.id}`}
            className="absolute w-1 h-1 md:w-2 md:h-2 bg-blue-200 rounded-full animate-pulse opacity-60"
            style={star.style}
          />
        ))}

        {/* 光芒效果 */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header - 手機版優化，修復跑版問題 */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo 區域 - 防止文字換行 */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white whitespace-nowrap">心願星河</h1>
            </div>

            {/* 導航區域 */}
            <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
              {/* 音樂控制 */}
              <div className="hidden sm:block">
                <HeaderMusicControl />
              </div>
              <div className="sm:hidden">
                <HeaderMusicControl mobileSimplified />
              </div>

              {/* 桌面版完整導航 */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/analytics">
                  <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-4">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    問題洞察
                  </Button>
                </Link>
                <Link href="/wishes">
                  <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-4">
                    聆聽心聲
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 px-4">
                    分享困擾
                  </Button>
                </Link>
              </div>

              {/* 平板版導航 */}
              <div className="hidden sm:flex md:hidden items-center gap-2">
                <Link href="/analytics">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/wishes">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-2 text-xs"
                  >
                    心聲
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 px-3"
                  >
                    分享
                  </Button>
                </Link>
              </div>

              {/* 手機版導航 - 使用文字而非圖標 */}
              <div className="flex sm:hidden items-center gap-1">
                <Link href="/analytics">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-2 text-xs"
                  >
                    洞察
                  </Button>
                </Link>
                <Link href="/wishes">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-2 text-xs"
                  >
                    心聲
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 px-3 text-xs"
                  >
                    分享
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - 使用 flex-1 讓內容區域填滿剩餘空間 */}
      <main className="flex-1 flex flex-col justify-center py-12 md:py-20 px-1 sm:px-4 relative">
        <div className="container mx-auto text-center max-w-4xl">
          {/* 主要許願瓶 - 添加呼吸動畫 */}
          <div className="mb-12 md:mb-16 relative">
            <div className="relative mx-auto w-48 h-60 md:w-64 md:h-80 mb-6 md:mb-8">
              {/* 許願瓶主體 - 呼吸動畫 */}
              <div
                className="absolute bottom-0 left-1/2 w-32 h-48 md:w-40 md:h-60 bg-gradient-to-b from-cyan-100/20 to-blue-200/30 rounded-t-2xl md:rounded-t-3xl rounded-b-xl md:rounded-b-2xl shadow-2xl shadow-cyan-500/20 backdrop-blur-sm border border-cyan-300/30"
                style={{
                  transform: "translateX(-50%)",
                  animation: "bottleBreathe 6s ease-in-out infinite",
                }}
              >
                {/* 瓶口 */}
                <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2 w-8 h-6 md:w-12 md:h-8 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-md md:rounded-t-lg shadow-lg"></div>

                {/* 瓶內發光效果 - 脈動動畫 */}
                <div
                  className="absolute inset-3 md:inset-4 bg-gradient-radial from-yellow-300/40 via-cyan-300/20 to-transparent rounded-t-xl md:rounded-t-2xl rounded-b-lg md:rounded-b-xl"
                  style={{
                    animation: "glowPulse 4s ease-in-out infinite",
                  }}
                ></div>

                {/* 瓶內的月亮和人物剪影 */}
                <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2">
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 flex items-center justify-center"
                    style={{
                      animation: "moonGlow 8s ease-in-out infinite",
                    }}
                  >
                    <div className="w-9 h-9 md:w-12 md:h-12 bg-yellow-200 rounded-full relative">
                      <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full"></div>
                      <div className="absolute bottom-0.5 md:bottom-1 right-1.5 md:right-2 w-0.5 h-0.5 md:w-1 md:h-1 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  {/* 小人物剪影 */}
                  <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 w-3 h-4 md:w-4 md:h-6 bg-slate-800 rounded-t-full"></div>
                </div>

                {/* 瓶身光澤 */}
                <div className="absolute top-4 md:top-6 left-2 md:left-3 w-3 h-32 md:w-4 md:h-40 bg-white/20 rounded-full blur-sm"></div>

                {/* 漂浮的光點 - 星光飄散動畫 */}
                <div
                  className="absolute top-8 md:top-12 right-4 md:right-6 w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-300 rounded-full"
                  style={{
                    animation: "sparkleFloat 8s ease-in-out infinite",
                  }}
                ></div>
                <div
                  className="absolute top-14 md:top-20 left-6 md:left-8 w-1 h-1 bg-yellow-300 rounded-full"
                  style={{
                    animation: "sparkleDrift 10s ease-in-out infinite",
                  }}
                ></div>
                <div
                  className="absolute bottom-14 md:bottom-20 right-3 md:right-4 w-1 h-1 bg-blue-300 rounded-full"
                  style={{
                    animation: "sparkleDance 7s ease-in-out infinite",
                  }}
                ></div>

                {/* 額外的星光粒子 */}
                <div
                  className="absolute top-10 md:top-16 left-4 md:left-5 w-0.5 h-0.5 md:w-1 md:h-1 bg-pink-300 rounded-full"
                  style={{
                    animation: "sparkleTwinkle 5s ease-in-out infinite",
                  }}
                ></div>
                <div
                  className="absolute bottom-10 md:bottom-16 left-5 md:left-7 w-0.5 h-0.5 md:w-1 md:h-1 bg-purple-300 rounded-full"
                  style={{
                    animation: "sparkleGentle 12s ease-in-out infinite",
                  }}
                ></div>
              </div>

              {/* 周圍的光芒 - 呼吸光暈 */}
              <div
                className="absolute bottom-0 left-1/2 w-36 h-36 md:w-48 md:h-48 bg-gradient-radial from-cyan-400/30 via-blue-500/20 to-transparent rounded-full blur-2xl -z-10"
                style={{
                  transform: "translateX(-50%)",
                  animation: "auraBreathe 6s ease-in-out infinite",
                }}
              ></div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl">
              心願星河
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto px-4">
              每一個工作困擾都值得被理解和支持
              <br className="hidden md:block" />
              <span className="md:hidden"> </span>
              讓我們用科技的力量，為你的職場挑戰找到解決方案
            </p>
          </div>

          {/* 按鈕 */}
          <div className="flex flex-col gap-4 md:flex-row md:gap-6 justify-center px-4">
            <Link href="/submit" className="w-full md:w-auto">
              <Button
                size="lg"
                className="w-full md:w-auto text-base md:text-lg px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/30 transform hover:scale-105 transition-all"
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                分享工作困擾
              </Button>
            </Link>
            <Link href="/wishes" className="w-full md:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-auto text-base md:text-lg px-8 md:px-10 py-3 md:py-4 border-2 border-blue-400 bg-slate-800/50 hover:bg-slate-700/50 text-blue-100 hover:text-white font-semibold shadow-lg backdrop-blur-sm transform hover:scale-105 transition-all"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                聆聽他人經歷
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer - 固定在底部 */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-blue-800/50 py-6 md:py-8 flex-shrink-0 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-semibold text-white">心願星河</span>
          </div>
          <p className="text-sm md:text-base text-blue-200">理解每一份職場困擾，用科技創造更好的工作環境</p>
        </div>
      </footer>

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
        
        @keyframes moonGlow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
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
        
        @keyframes sparkleDance {
          0%, 100% {
            transform: translateX(0px) translateY(0px) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateX(-1px) translateY(-2px) scale(1.1);
            opacity: 0.8;
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
    </div>
  )
}
