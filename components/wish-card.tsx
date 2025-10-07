"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Target,
  Lightbulb,
  Calendar,
  Sparkles,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Heart,
  Users,
} from "lucide-react"
import { categorizeWishMultiple, type Wish } from "@/lib/categorization"
import { generateSolutionRecommendations, type SolutionCategory } from "@/lib/solution-recommendations"
import { useState, useEffect } from "react"
import { soundManager } from "@/lib/sound-effects"
import ImageGallery from "@/components/image-gallery"
import { restoreImageFile, type ImageFile } from "@/lib/image-utils"
// 使用 API 路由，不需要直接導入 LikeService

interface WishCardProps {
  wish: Wish & { images?: any[]; like_count?: number } // 添加圖片支援和點讚數
}

export default function WishCard({ wish }: WishCardProps) {
  const [showSolutions, setShowSolutions] = useState(false)
  const [selectedSolution, setSelectedSolution] = useState<SolutionCategory | null>(null)
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  // 獲取或創建用戶會話 ID
  const getUserSession = (): string => {
    if (typeof window === 'undefined') return ''
    
    let userSession = localStorage.getItem('user_session')
    if (!userSession) {
      userSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('user_session', userSession)
    }
    return userSession
  }

  // 載入點讚數據
  useEffect(() => {
    const loadLikeData = async () => {
      try {
        const userSession = getUserSession()
        // 使用 API 路由獲取用戶已點讚的困擾列表
        const response = await fetch(`/api/wishes/like?wishId=${wish.id}`, {
          headers: {
            'x-user-session': userSession
          }
        })
        const result = await response.json()
        
        if (result.success) {
          // 設置點讚狀態
          setHasLiked(result.data.liked)
        } else {
          throw new Error(result.error || 'Failed to check like status')
        }
        
        // 點讚數從 wish 的 like_count 字段獲取，如果沒有則默認為 0
        setLikeCount(wish.like_count || 0)
      } catch (error) {
        console.error("載入點讚數據失敗:", error)
        // 如果 API 連接失敗，回退到 localStorage
        const likes = JSON.parse(localStorage.getItem("wishLikes") || "{}")
        const likedWishes = JSON.parse(localStorage.getItem("userLikedWishes") || "[]")

        setLikeCount(likes[wish.id] || 0)
        setHasLiked(likedWishes.includes(wish.id))
      }
    }

    loadLikeData()
  }, [wish.id, wish.like_count])

  const handleLike = async () => {
    if (hasLiked || isLiking) return

    setIsLiking(true)

    // 播放點讚音效
    await soundManager.play("click")

    try {
      const userSession = getUserSession()
      // 使用 API 路由點讚服務
      const response = await fetch('/api/wishes/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-session': userSession
        },
        body: JSON.stringify({ wishId: wish.id })
      })
      
      const result = await response.json()
      
      if (result.success && result.data.liked) {
        // 更新本地狀態
        setHasLiked(true)
        
        // 即時獲取最新的點讚數
        try {
          const countResponse = await fetch(`/api/wishes/like-count?wishId=${wish.id}`)
          const countResult = await countResponse.json()
          if (countResult.success) {
            setLikeCount(countResult.data.likeCount)
          } else {
            // 如果獲取失敗，使用本地計算
            setLikeCount(prev => prev + 1)
          }
        } catch (countError) {
          console.warn('獲取點讚數失敗，使用本地計算:', countError)
          setLikeCount(prev => prev + 1)
        }
        
        // 播放成功音效
        setTimeout(async () => {
          await soundManager.play("success")
        }, 300)
      } else {
        // 已經點讚過
        console.log("已經點讚過此困擾")
      }
    } catch (error) {
      console.error("點讚失敗:", error)
      
      // 如果 Supabase 失敗，回退到 localStorage
      const likes = JSON.parse(localStorage.getItem("wishLikes") || "{}")
      const likedWishes = JSON.parse(localStorage.getItem("userLikedWishes") || "[]")

      likes[wish.id] = (likes[wish.id] || 0) + 1
      likedWishes.push(wish.id)

      localStorage.setItem("wishLikes", JSON.stringify(likes))
      localStorage.setItem("userLikedWishes", JSON.stringify(likedWishes))

      setLikeCount(likes[wish.id])
      setHasLiked(true)
      
      // 播放成功音效
      setTimeout(async () => {
        await soundManager.play("success")
      }, 300)
    } finally {
      setIsLiking(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 多標籤自動分類，最多3個
  const categories = categorizeWishMultiple(wish).slice(0, 3)

  // 生成解決方案建議
  const solutionRecommendation = generateSolutionRecommendations(wish)

  // 轉換圖片數據格式 - 使用 restoreImageFile 恢復圖片
  const images: ImageFile[] = (wish.images || []).map((img) => restoreImageFile(img))

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-300 border-green-400/40"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
      case "hard":
        return "bg-orange-500/20 text-orange-300 border-orange-400/40"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/40"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "容易實現"
      case "medium":
        return "中等難度"
      case "hard":
        return "需要投入"
      default:
        return "未知"
    }
  }

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 transform hover:scale-[1.01] mx-2 md:mx-0">
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>

      <CardHeader className="relative pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
        <div className="flex items-start justify-between gap-3 md:gap-4 mb-3">
          <CardTitle className="text-xl md:text-2xl font-bold text-white group-hover:text-cyan-100 transition-colors duration-300 leading-tight flex-1">
            {wish.title}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className="bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 border border-slate-500/50 px-2 md:px-3 py-1 text-xs md:text-sm">
              <Calendar className="w-3 h-3 mr-1 md:mr-1.5" />
              <span className="hidden sm:inline">{formatDate(wish.createdAt)}</span>
              <span className="sm:hidden">
                {new Date(wish.createdAt).toLocaleDateString("zh-TW", { month: "short", day: "numeric" })}
              </span>
            </Badge>
          </div>
        </div>

        {/* 最多3個問題領域標籤 */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((category, index) => (
            <Badge
              key={`${category.name}-${index}`}
              className={`bg-gradient-to-r ${category.bgColor} ${category.borderColor} ${category.textColor} border backdrop-blur-sm px-3 py-1.5 text-xs md:text-sm font-medium shadow-lg ${
                index === 0 ? "ring-2 ring-white/20" : ""
              }`}
            >
              <div className="w-2 h-2 rounded-full mr-2 shadow-sm" style={{ backgroundColor: category.color }}></div>
              {category.name}
              {index === 0 && categories.length > 1 && <span className="ml-1 text-xs opacity-75">主要</span>}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 md:space-y-5 px-4 md:px-6 pb-4 md:pb-6">
        {/* 目前困擾 - 手機優化 */}
        <div className="group/section relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-slate-700/60 to-slate-800/60 border border-slate-600/40 hover:border-purple-400/30 p-4 md:p-5 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/8 to-indigo-500/8 group-hover/section:from-purple-500/15 group-hover/section:to-indigo-500/15 transition-all duration-300"></div>

          {/* 懸停時的光暈效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 opacity-0 group-hover/section:opacity-100 transition-opacity duration-500"></div>

          <div className="relative">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-400/80 to-indigo-500/80 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover/section:shadow-purple-500/30 group-hover/section:scale-110 transition-all duration-300">
                <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-white group-hover/section:rotate-12 transition-transform duration-300" />
              </div>
              <h4 className="font-semibold text-purple-200 group-hover/section:text-purple-100 text-base md:text-lg transition-colors duration-300">
                遇到的困擾
              </h4>
            </div>
            <CardDescription className="text-slate-200 group-hover/section:text-slate-100 text-sm md:text-base leading-relaxed font-medium transition-colors duration-300">
              {wish.currentPain}
            </CardDescription>
          </div>
        </div>

        {/* 期望解決方式 - 手機優化 */}
        <div className="group/section relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-slate-700/60 to-slate-800/60 border border-slate-600/40 hover:border-cyan-400/30 p-4 md:p-5 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 group-hover/section:from-cyan-500/15 group-hover/section:to-blue-500/15 transition-all duration-300"></div>

          {/* 懸停時的光暈效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover/section:opacity-100 transition-opacity duration-500"></div>

          <div className="relative">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-cyan-400/80 to-blue-500/80 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover/section:shadow-cyan-500/30 group-hover/section:scale-110 transition-all duration-300">
                <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 text-white group-hover/section:rotate-12 transition-transform duration-300" />
              </div>
              <h4 className="font-semibold text-cyan-200 group-hover/section:text-cyan-100 text-base md:text-lg transition-colors duration-300">
                期望的解決方式
              </h4>
            </div>
            <CardDescription className="text-slate-200 group-hover/section:text-slate-100 text-sm md:text-base leading-relaxed font-medium transition-colors duration-300">
              {wish.expectedSolution}
            </CardDescription>
          </div>
        </div>

        {/* 預期效果 - 手機優化 */}
        {wish.expectedEffect && (
          <div className="group/section relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-slate-700/60 to-slate-800/60 border border-slate-600/40 hover:border-indigo-400/30 p-4 md:p-5 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/8 to-purple-500/8 group-hover/section:from-indigo-500/15 group-hover/section:to-purple-500/15 transition-all duration-300"></div>

            {/* 懸停時的光暈效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/5 to-indigo-400/0 opacity-0 group-hover/section:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-400/80 to-purple-500/80 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover/section:shadow-indigo-500/30 group-hover/section:scale-110 transition-all duration-300">
                  <Target className="w-3.5 h-3.5 md:w-4 md:h-4 text-white group-hover/section:rotate-12 transition-transform duration-300" />
                </div>
                <h4 className="font-semibold text-indigo-200 group-hover/section:text-indigo-100 text-base md:text-lg transition-colors duration-300">
                  預期改善效果
                </h4>
              </div>
              <CardDescription className="text-slate-200 group-hover/section:text-slate-100 text-sm md:text-base leading-relaxed font-medium transition-colors duration-300">
                {wish.expectedEffect}
              </CardDescription>
            </div>
          </div>
        )}

        {/* 圖片展示區域 */}
        {images.length > 0 && (
          <div className="relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-slate-700/60 to-slate-800/60 border border-slate-600/40 hover:border-green-400/30 p-4 md:p-5 backdrop-blur-sm transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/8 to-emerald-500/8"></div>
            <div className="relative">
              <ImageGallery images={images} />
            </div>
          </div>
        )}

        {/* 共鳴支持區塊 - 新增 */}
        <div className="relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-pink-800/30 to-rose-800/30 border border-pink-600/40 p-3 md:p-4 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10"></div>

          {/* 手機端優化：改為上下布局避免擠壓 */}
          <div className="relative">
            {/* 第一行：支持數量和愛心顯示 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Users className="w-4 h-4 text-pink-300 flex-shrink-0" />
                <span className="text-sm md:text-base text-pink-200 font-medium truncate">
                  {likeCount > 0 ? (
                    <span className="sm:hidden">{likeCount} 人也遇到</span>
                  ) : (
                    <span className="sm:hidden">成為第一個支持者</span>
                  )}
                  <span className="hidden sm:inline">
                    {likeCount > 0 ? `${likeCount} 人也遇到相同問題` : "成為第一個表達支持的人"}
                  </span>
                </span>
              </div>
              
              {/* 愛心動畫區域 - 手機端縮小 */}
              {likeCount > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  {[...Array(Math.min(likeCount, 5))].map((_, i) => (
                    <Heart
                      key={i}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-400 animate-pulse"
                      fill="currentColor"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                  {likeCount > 5 && <span className="text-xs text-pink-300 ml-1">+{likeCount - 5}</span>}
                </div>
              )}
            </div>

            {/* 第二行：按讚按鈕 - 手機端更緊湊 */}
            <div className="flex justify-center sm:justify-end">
              <Button
                onClick={handleLike}
                disabled={hasLiked || isLiking}
                size="sm"
                className={`
                  transition-all duration-300 transform hover:scale-105 px-3 sm:px-4 py-2
                  w-full sm:w-auto
                  ${
                    hasLiked
                      ? "bg-pink-600/50 text-pink-200 border border-pink-500/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500/80 to-rose-600/80 hover:from-pink-600/90 hover:to-rose-700/90 text-white shadow-lg shadow-pink-500/25"
                  }
                  ${isLiking ? "animate-pulse" : ""}
                `}
              >
                <Heart
                  className={`w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-all duration-300 ${
                    hasLiked ? "text-pink-300" : "text-white"
                  } ${isLiking ? "animate-bounce" : ""}`}
                  fill={hasLiked ? "currentColor" : "none"}
                />
                <span className="text-xs md:text-sm font-medium">
                  {isLiking ? "支持中..." : hasLiked ? "已支持" : "我也是"}
                </span>
              </Button>
            </div>
          </div>

          {hasLiked && (
            <div className="mt-2 pt-2 border-t border-pink-600/30">
              <p className="text-xs text-pink-300 text-center animate-in fade-in duration-500">
                感謝你的支持！讓這個問題得到更多關注 💝
              </p>
            </div>
          )}
        </div>

        {/* AI 解決方案建議區塊 - 改用藍紫色系 */}
        {solutionRecommendation.recommendations.length > 0 && (
          <div className="relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-indigo-800/50 to-purple-800/50 border border-indigo-500/60 p-4 md:p-5 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-indigo-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 to-purple-500/15"></div>

            <div className="relative">
              {/* 手機端優化：標題和按鈕分開布局 */}
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-white text-sm md:text-lg leading-tight">AI 解決方案建議</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSolutions(!showSolutions)}
                        className="text-indigo-200 hover:text-white hover:bg-indigo-700/50 px-1.5 sm:px-2 py-1 transition-all duration-200 flex-shrink-0"
                      >
                        <span className="text-xs mr-0.5 sm:mr-1">
                          {showSolutions ? "收起" : "展開"}
                        </span>
                        {showSolutions ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                      <Badge className="bg-indigo-500/30 text-indigo-100 border border-indigo-400/50 text-xs px-1.5 md:px-2 py-0.5 font-medium whitespace-nowrap">
                        信心度 {solutionRecommendation.confidence}%
                      </Badge>
                      <Badge className="bg-purple-500/30 text-purple-100 border border-purple-400/50 text-xs px-1.5 md:px-2 py-0.5 font-medium whitespace-nowrap">
                        智能分析
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* 個人化訊息 */}
              <div className="mb-4 p-3 bg-slate-800/60 rounded-lg border border-slate-600/50">
                <p className="text-slate-100 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {solutionRecommendation.personalizedMessage}
                </p>
              </div>

              {/* 解決方案建議 */}
              {showSolutions && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {solutionRecommendation.recommendations.map((solution, index) => (
                    <div
                      key={solution.id}
                      className="p-3 md:p-4 bg-slate-800/60 rounded-lg border border-slate-600/50 hover:bg-slate-700/60 hover:border-slate-500/70 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedSolution(selectedSolution?.id === solution.id ? null : solution)}
                    >
                      {/* 手機端優化：重新設計布局結構 */}
                      <div className="flex items-start gap-3">
                        <div className="text-xl md:text-2xl flex-shrink-0 mt-0.5">{solution.icon}</div>
                        <div className="flex-1 min-w-0">
                          {/* 標題行：標題和時間 */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h5 className="font-semibold text-white text-sm md:text-base leading-tight flex-1 min-w-0">
                              {solution.name}
                            </h5>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              <span className="font-medium whitespace-nowrap">{solution.timeframe}</span>
                            </div>
                          </div>
                          
                          {/* 標籤和描述 */}
                          <div className="space-y-2">
                            <Badge
                              className={`text-xs px-2 py-0.5 border ${getDifficultyColor(solution.difficulty)} inline-block`}
                            >
                              {getDifficultyLabel(solution.difficulty)}
                            </Badge>
                            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                              {solution.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 展開的詳細資訊 - 手機端優化 */}
                      {selectedSolution?.id === solution.id && (
                        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-600/40 space-y-3 md:space-y-4 animate-in slide-in-from-top-1 duration-200">
                          <div>
                            <h6 className="text-xs md:text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-1">
                              ✨ 主要效益
                            </h6>
                            <div className="space-y-1.5 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
                              {solution.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0 mt-1.5"></div>
                                  <span>{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h6 className="text-xs md:text-sm font-semibold text-blue-300 mb-2 flex items-center gap-1">
                              🛠️ 技術方案
                            </h6>
                            <div className="flex flex-wrap gap-1.5">
                              {solution.techStack.map((tech, idx) => (
                                <Badge
                                  key={idx}
                                  className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-200 border border-blue-400/30 whitespace-nowrap"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h6 className="text-xs md:text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-1">
                              💡 應用實例
                            </h6>
                            <div className="space-y-1.5">
                              {solution.examples.map((example, idx) => (
                                <div key={idx} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                                  <div className="w-1 h-1 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5"></div>
                                  <span>{example}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 專業團隊協助訊息 - 手機端優化 */}
                  <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-cyan-800/40 to-blue-800/40 rounded-lg border border-cyan-500/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-300 flex-shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-cyan-200">專業團隊支援</span>
                    </div>
                    <p className="text-xs md:text-sm text-cyan-100 leading-relaxed">
                      我們的 AI 團隊和技術專家會根據這些建議，為你制定具體的實施方案。團隊將主動與你聯繫，協助你逐步改善工作流程！
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* 底部裝飾 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
    </Card>
  )
}
