"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Heart, Users, ArrowRight, Home, MessageCircle, BarChart3, Eye, EyeOff } from "lucide-react"
import HeaderMusicControl from "@/components/header-music-control"
import { WishService } from "@/lib/supabase-service"

export default function ThankYouPage() {
  const [wishes, setWishes] = useState<any[]>([])
  const [showContent, setShowContent] = useState(false)
  const [lastWishIsPublic, setLastWishIsPublic] = useState(true)

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        // 獲取所有困擾案例
        const allWishesData = await WishService.getAllWishes()
        
        // 轉換數據格式
        const convertWish = (wish: any) => ({
          id: wish.id,
          title: wish.title,
          currentPain: wish.current_pain,
          expectedSolution: wish.expected_solution,
          expectedEffect: wish.expected_effect || "",
          createdAt: wish.created_at,
          isPublic: wish.is_public,
          email: wish.email,
          images: wish.images,
          like_count: wish.like_count || 0, // 包含點讚數
        })
        
        const allWishes = allWishesData.map(convertWish)
        setWishes(allWishes)

        // 檢查最後一個提交的願望是否為公開
        if (allWishes.length > 0) {
          const lastWish = allWishes[allWishes.length - 1]
          setLastWishIsPublic(lastWish.isPublic !== false)
        }
      } catch (error) {
        console.error("獲取統計數據失敗:", error)
        // 如果 Supabase 連接失敗，回退到 localStorage
        const savedWishes = JSON.parse(localStorage.getItem("wishes") || "[]")
        setWishes(savedWishes)

        if (savedWishes.length > 0) {
          const lastWish = savedWishes[savedWishes.length - 1]
          setLastWishIsPublic(lastWish.isPublic !== false)
        }
      }
    }

    fetchWishes()

    // 延遲顯示內容，創造進入效果
    setTimeout(() => setShowContent(true), 300)
  }, [])

  const totalWishes = wishes.length
  const publicWishes = wishes.filter((wish) => wish.isPublic !== false).length
  const privateWishes = wishes.filter((wish) => wish.isPublic === false).length
  const thisWeek = wishes.filter((wish) => {
    const wishDate = new Date(wish.createdAt)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return wishDate >= oneWeekAgo
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 增強的星空背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 更多的星星 */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* 特殊的感謝星星 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`special-${i}`}
            className="absolute w-1 h-1 md:w-2 md:h-2 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full animate-pulse opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* 光芒效果 */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-radial from-pink-400/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header - 修復跑版問題 */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo 區域 - 防止文字換行 */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white whitespace-nowrap">資訊部．心願星河</h1>
            </Link>

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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-4"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    問題洞察
                  </Button>
                </Link>
                <Link href="/wishes">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 bg-slate-800/50 text-blue-100 hover:bg-slate-700/50 px-4"
                  >
                    聆聽心聲
                  </Button>
                </Link>
              </div>

              {/* 平板版導航 */}
              <div className="hidden sm:flex md:hidden items-center gap-1">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-2"
                  >
                    <Home className="w-4 h-4" />
                  </Button>
                </Link>
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
                    variant="outline"
                    size="sm"
                    className="border-blue-400 bg-slate-800/50 text-blue-100 hover:bg-slate-700/50 px-2 text-xs"
                  >
                    心聲
                  </Button>
                </Link>
              </div>

              {/* 手機版導航 - 移除首頁按鈕，避免與 logo 功能重疊 */}
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
                    variant="outline"
                    size="sm"
                    className="border-blue-400 bg-slate-800/50 text-blue-100 hover:bg-slate-700/50 px-2 text-xs"
                  >
                    心聲
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-16 px-1 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <div
            className={`transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* 感謝標題區域 */}
            <div className="text-center mb-12 md:mb-16">
              {/* 感謝圖標 */}
              <div className="mb-6 md:mb-8">
                <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-pulse shadow-2xl shadow-pink-500/50"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 md:w-16 md:h-16 text-white animate-pulse" fill="currentColor" />
                  </div>

                  {/* 周圍的小心心 */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 md:w-4 md:h-4 text-pink-300 animate-bounce"
                      style={{
                        left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                        top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                        animationDelay: `${i * 0.2}s`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Heart className="w-full h-full" fill="currentColor" />
                    </div>
                  ))}
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                感謝你的信任與分享
              </h1>

              <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                  你的困擾已經成功提交，我們會認真分析並提供專業建議
                </p>
                <p className="text-lg md:text-xl text-blue-200 leading-relaxed">
                  每一個真實的工作困擾都是改善的起點，你的分享將幫助我們創造更好的解決方案
                </p>
                <p className="text-base md:text-lg text-blue-300 leading-relaxed">
                  我們的專業團隊會仔細研究你的案例，用科技的力量為你和更多人解決職場挑戰
                </p>
              </div>

              {/* 隱私狀態說明 */}
              <div className="mt-6 md:mt-8">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                    lastWishIsPublic
                      ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                      : "bg-slate-600/20 border-slate-500/50 text-slate-300"
                  }`}
                >
                  {lastWishIsPublic ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm md:text-base">你的分享已公開，其他人可以看到並產生共鳴</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span className="text-sm md:text-base">你的分享保持私密，僅用於問題分析和改善</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 統計卡片 */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
              <Card className="bg-gradient-to-br from-pink-900/60 to-purple-900/60 backdrop-blur-sm border border-pink-700/40 shadow-2xl shadow-pink-500/20 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/30">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{totalWishes}</div>
                  <div className="text-pink-200 text-sm md:text-base">個案例已收集</div>
                  <div className="text-pink-300 text-xs md:text-sm mt-1">包括你剛才分享的經歷</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-900/60 to-blue-900/60 backdrop-blur-sm border border-cyan-700/40 shadow-2xl shadow-cyan-500/20 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{thisWeek}</div>
                  <div className="text-cyan-200 text-sm md:text-base">本週新增案例</div>
                  <div className="text-cyan-300 text-xs md:text-sm mt-1">你不是一個人在面對挑戰</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-sm border border-purple-700/40 shadow-2xl shadow-purple-500/20 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                    <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">∞</div>
                  <div className="text-purple-200 text-sm md:text-base">無限的可能性</div>
                  <div className="text-purple-300 text-xs md:text-sm mt-1">每個問題都能找到解決方案</div>
                </CardContent>
              </Card>
            </div>

            {/* 隱私統計說明 */}
            {privateWishes > 0 && (
              <div className="text-center mb-8 md:mb-12">
                <div className="inline-flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 md:px-6 py-3 md:py-4 border border-slate-600/50">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm md:text-base font-medium">{publicWishes} 個公開案例</span>
                  </div>
                  <div className="w-px h-6 bg-slate-600"></div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm md:text-base font-medium">{privateWishes} 個私密案例</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-400 mt-2 px-4">
                  所有案例都會用於問題分析，幫助改善整體工作環境
                </p>
              </div>
            )}

            {/* 激勵訊息卡片 */}
            <Card className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-600/50 shadow-2xl mb-12 md:mb-16">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">你的分享推動了積極的改變</h2>

                  <div className="grid md:grid-cols-2 gap-6 md:gap-8 text-left">
                    <div className="space-y-4">
                      <h3 className="text-lg md:text-xl font-semibold text-blue-200 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        勇於面對挑戰
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        願意分享工作困擾需要勇氣。你的坦誠讓我們能夠深入了解職場的真實挑戰，這是解決問題的重要第一步。
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg md:text-xl font-semibold text-purple-200 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" fill="currentColor" />
                        共同的使命
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        在這個平台上，有許多和你面臨相似挑戰的人。你的經驗分享讓大家知道，我們都在為更好的工作環境而努力。
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg md:text-xl font-semibold text-green-200 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-green-400" />
                        推動實際改變
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        每一個案例都是我們開發解決方案的重要依據。你的困擾將幫助我們創造更智能、更實用的工作工具。
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg md:text-xl font-semibold text-yellow-200 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        創造更好未來
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        我們相信科技能夠讓工作變得更有效率、更有意義。你的分享是實現這個目標的重要推動力。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 行動按鈕 */}
            <div className="text-center space-y-6 md:space-y-8">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-6">接下來你可以...</h3>

              <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center max-w-2xl mx-auto">
                {lastWishIsPublic ? (
                  <Link href="/wishes" className="flex-1">
                    <Button
                      size="lg"
                      className="w-full text-base md:text-lg px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                      查看你的公開分享
                    </Button>
                  </Link>
                ) : (
                  <Link href="/wishes" className="flex-1">
                    <Button
                      size="lg"
                      className="w-full text-base md:text-lg px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                      查看其他公開經歷
                    </Button>
                  </Link>
                )}

                <Link href="/analytics" className="flex-1">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-base md:text-lg px-6 md:px-8 py-3 md:py-4 border-2 border-cyan-400 bg-slate-800/50 hover:bg-slate-700/50 text-cyan-100 hover:text-white font-semibold shadow-lg backdrop-blur-sm transform hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                    查看問題分析
                  </Button>
                </Link>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-6 py-2">
                    <Home className="w-4 h-4 mr-2" />
                    回到首頁
                  </Button>
                </Link>
              </div>
            </div>

            {/* 底部激勵訊息 */}
            <div className="text-center mt-16 md:mt-20 p-6 md:p-8 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-600/30 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-pink-400 animate-pulse" fill="currentColor" />
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <Heart className="w-5 h-5 text-purple-400 animate-pulse" fill="currentColor" />
              </div>
              <p className="text-lg md:text-xl text-blue-200 font-medium mb-2">再次感謝你的信任與分享</p>
              <p className="text-sm md:text-base text-blue-300">每一份真實的經歷都是推動職場環境改善的重要力量</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
