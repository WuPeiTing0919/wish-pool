"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Minus,
  Shield,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react"
import RadarChart from "@/components/radar-chart"
import HeaderMusicControl from "@/components/header-music-control"
import { categories, categorizeWishMultiple, type Wish } from "@/lib/categorization"
// 使用 API 路由，不需要直接導入 WishService
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

interface CategoryData {
  name: string
  count: number
  percentage: number
  color: string
  keywords: string[]
  description?: string
  difficulty?: {
    level: number
    stars: string
    label: string
    estimatedTime: string
    techStack: string[]
    solutionType: string
    complexity: string
  }
}

interface AnalyticsData {
  totalWishes: number
  publicWishes: number
  privateWishes: number
  categories: CategoryData[]
  recentTrends: {
    thisWeek: number
    lastWeek: number
    growth: number
    growthLabel: string
    growthIcon: "up" | "down" | "flat"
    growthColor: string
  }
  topKeywords: { word: string; count: number }[]
}

export default function AnalyticsPage() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [showCategoryGuide, setShowCategoryGuide] = useState(false)
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false) // 新增：隱私說明收放狀態

  // 教學功能
  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      progressText: "步驟 {{current}} / {{total}}",
      nextBtnText: "下一步",
      prevBtnText: "上一步",
      doneBtnText: "完成教學",
      steps: [
        {
          element: "#analytics-title",
          popover: {
            title: "🔍 洞察分析首頁",
            description: "這裡提供職場困擾的完整數據分析，包含公開和私密案例，幫助管理者了解真實狀況並制定改善策略。",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#privacy-section",
          popover: {
            title: "🔒 數據隱私說明",
            description: "點擊展開查看分析數據的隱私政策。分析包含所有案例（公開+私密），但保護個人身份資訊。",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#stats-overview",
          popover: {
            title: "📊 統計概覽",
            description: "快速查看總案例數、本週新增、問題領域數量和成長趨勢。這些數字幫助您掌握整體狀況。",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#category-guide",
          popover: {
            title: "📖 分類指南",
            description: "點擊「展開」按鈕可查看各問題分類的詳細說明和關鍵字示例，了解分析系統如何歸類不同困擾。",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#radar-chart",
          popover: {
            title: "🎯 問題分布圖譜",
            description: "雷達圖直觀顯示各類問題的分布情況。面積越大表示該類問題越多，幫助識別重點改善領域。",
            side: "left",
            align: "center"
          }
        },
        {
          element: "#category-stats",
          popover: {
            title: "📈 詳細統計",
            description: "列出所有問題分類的具體案例數和百分比，並標示TOP排名，方便優先處理高頻問題。",
            side: "right",
            align: "center"
          }
        },
        {
          element: "#keyword-section",
          popover: {
            title: "🔖 熱門關鍵字",
            description: "顯示在所有案例中最常出現的詞彙，反映團隊面臨的核心挑戰，有助於深入理解問題本質。",
            side: "top",
            align: "center"
          }
        }
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  // 分析許願內容（包含所有數據，包括私密的）
  const analyzeWishes = (wishList: (Wish & { isPublic?: boolean })[]): AnalyticsData => {
    const totalWishes = wishList.length
    const publicWishes = wishList.filter((wish) => wish.isPublic !== false).length
    const privateWishes = wishList.filter((wish) => wish.isPublic === false).length

    const categoryStats: { [key: string]: number } = {}
    const keywordCount: { [key: string]: number } = {}

    // 初始化分類統計
    categories.forEach((cat) => {
      categoryStats[cat.name] = 0
    })
    categoryStats["其他問題"] = 0

    // 分析每個許願（多標籤統計）- 包含所有數據
    wishList.forEach((wish) => {
      const wishCategories = categorizeWishMultiple(wish)

      wishCategories.forEach((category) => {
        categoryStats[category.name]++

        // 統計關鍵字
        if (category.keywords) {
          const fullText =
            `${wish.title} ${wish.currentPain} ${wish.expectedSolution} ${wish.expectedEffect}`.toLowerCase()
          category.keywords.forEach((keyword: string) => {
            if (fullText.includes(keyword.toLowerCase())) {
              keywordCount[keyword] = (keywordCount[keyword] || 0) + 1
            }
          })
        }
      })
    })

    // 計算百分比和準備數據
    const categoriesData: CategoryData[] = categories.map((cat) => ({
      name: cat.name,
      count: categoryStats[cat.name] || 0,
      percentage: totalWishes > 0 ? Math.round(((categoryStats[cat.name] || 0) / totalWishes) * 100) : 0,
      color: cat.color,
      keywords: cat.keywords,
      description: cat.description,
    }))

    // 改進的趨勢計算
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const thisWeek = wishList.filter((wish) => new Date(wish.createdAt) >= oneWeekAgo).length
    const lastWeek = wishList.filter((wish) => {
      const date = new Date(wish.createdAt)
      return date >= twoWeeksAgo && date < oneWeekAgo
    }).length

    // 改進的成長趨勢計算
    let growth = 0
    let growthLabel = "持平"
    let growthIcon: "up" | "down" | "flat" = "flat"
    let growthColor = "#6B7280"

    if (lastWeek === 0 && thisWeek > 0) {
      // 上週沒有，本週有 → 全新開始
      growth = 100
      growthLabel = "開始增長"
      growthIcon = "up"
      growthColor = "#10B981"
    } else if (lastWeek === 0 && thisWeek === 0) {
      // 兩週都沒有
      growth = 0
      growthLabel = "尚無數據"
      growthIcon = "flat"
      growthColor = "#6B7280"
    } else if (lastWeek > 0) {
      // 正常計算成長率
      growth = Math.round(((thisWeek - lastWeek) / lastWeek) * 100)

      if (growth > 0) {
        growthLabel = "持續增長"
        growthIcon = "up"
        growthColor = "#10B981"
      } else if (growth < 0) {
        growthLabel = "有所下降"
        growthIcon = "down"
        growthColor = "#EF4444"
      } else {
        growthLabel = "保持穩定"
        growthIcon = "flat"
        growthColor = "#6B7280"
      }
    }

    // 取得熱門關鍵字
    const topKeywords = Object.entries(keywordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }))

    return {
      totalWishes,
      publicWishes,
      privateWishes,
      categories: categoriesData,
      recentTrends: {
        thisWeek,
        lastWeek,
        growth,
        growthLabel,
        growthIcon,
        growthColor,
      },
      topKeywords,
    }
  }

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        // 使用 API 路由獲取所有困擾案例（包含私密的，用於完整分析）
        const response = await fetch('/api/wishes/real-json?type=all')
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch wishes')
        }
        
        const allWishesData = result.data
        
        // 轉換數據格式以匹配 categorization.ts 的 Wish 接口
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
        setAnalytics(analyzeWishes(allWishes))
      } catch (error) {
        console.error("獲取分析數據失敗:", error)
        // 如果 API 連接失敗，回退到 localStorage
        const savedWishes = JSON.parse(localStorage.getItem("wishes") || "[]")
        setWishes(savedWishes)
        setAnalytics(analyzeWishes(savedWishes))
      }
    }

    fetchWishes()
  }, [])

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">正在分析數據...</div>
      </div>
    )
  }

  // 根據成長趨勢選擇圖標
  const GrowthIcon =
    analytics.recentTrends.growthIcon === "up"
      ? TrendingUp
      : analytics.recentTrends.growthIcon === "down"
        ? TrendingDown
        : Minus

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-[9999] flex-shrink-0 shadow-lg shadow-slate-900/50">
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
                <Link href="/wishes">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 bg-slate-800/50 text-blue-100 hover:bg-slate-700/50 px-4"
                  >
                    聆聽心聲
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 px-4"
                  >
                    分享困擾
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
                    <ArrowLeft className="w-4 h-4" />
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
                <Link href="/submit">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 px-3"
                  >
                    分享
                  </Button>
                </Link>
              </div>

              {/* 手機版導航 - 移除首頁按鈕，避免與 logo 功能重疊 */}
              <div className="flex sm:hidden items-center gap-1">
                <Link href="/wishes">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 bg-slate-800/50 text-blue-100 hover:bg-slate-700/50 px-2 text-xs"
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

      {/* Main Content */}
      <main className="py-6 md:py-12 px-1 sm:px-3 md:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* 頁面標題 - 手機優化 */}
          <div id="analytics-title" className="text-center mb-6 md:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white text-center sm:text-left">問題洞察分析</h2>
              <Badge className="bg-gradient-to-r from-pink-700/60 to-purple-700/60 text-white border border-pink-400/50 px-2 md:px-3 py-1 text-xs md:text-sm">
                完整數據分析
              </Badge>
            </div>
            <p className="text-blue-200 text-base md:text-lg px-2">深入分析職場困擾的分布和趨勢</p>
            <p className="text-blue-300 text-xs md:text-sm mt-1 px-2">包含所有提交的案例數據，協助管理者了解真實狀況</p>
          </div>

          {/* 隱私說明卡片 - 手機版可收放 */}
          <Card id="privacy-section" className="bg-gradient-to-r from-blue-900/80 to-indigo-800/80 backdrop-blur-sm border border-blue-500/50 mb-6 md:mb-12">
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base md:text-xl lg:text-2xl text-white truncate">數據隱私說明</CardTitle>
                    <CardDescription className="text-white/90 text-xs md:text-sm lg:text-base">
                      本分析包含所有提交的案例，包括選擇保持私密的困擾
                    </CardDescription>
                  </div>
                </div>
                {/* 手機版收放按鈕 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                  className="text-indigo-200 hover:text-white hover:bg-indigo-700/50 px-2 md:px-3 flex-shrink-0 md:hidden"
                >
                  {showPrivacyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>

            {/* 桌面版始終顯示，手機版可收放 */}
            <div className={`${showPrivacyDetails ? "block" : "hidden"} md:block`}>
              <CardContent className="pt-0">
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-indigo-200 flex items-center gap-2">
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      公開案例 ({analytics.publicWishes} 個)
                    </h4>
                    <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
                      這些案例會顯示在「聆聽心聲」頁面，供其他人查看和產生共鳴
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-indigo-200 flex items-center gap-2">
                      <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
                      私密案例 ({analytics.privateWishes} 個)
                    </h4>
                    <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
                      這些案例保持匿名且私密，僅用於統計分析，幫助了解整體趨勢
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 p-2 md:p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    <strong className="text-blue-200">給管理者的說明：</strong>
                    此分析包含完整的問題數據，能幫助您了解團隊面臨的真實挑戰。私密案例雖然不會公開顯示，
                    但其數據對於制定改善策略同樣重要。所有個人身份資訊都已匿名化處理。
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* 統計概覽 - 手機優化 */}
          <div id="stats-overview" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-12">
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardContent className="p-3 md:p-6 text-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-xl md:text-3xl font-bold text-white mb-1">{analytics.totalWishes}</div>
                <div className="text-xs md:text-sm text-blue-200">總案例數</div>
                <div className="text-xs text-slate-400 mt-1">
                  公開 {analytics.publicWishes} + 私密 {analytics.privateWishes}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardContent className="p-3 md:p-6 text-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-xl md:text-3xl font-bold text-white mb-1">{analytics.recentTrends.thisWeek}</div>
                <div className="text-xs md:text-sm text-blue-200">本週新增</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardContent className="p-3 md:p-6 text-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Target className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-xl md:text-3xl font-bold text-white mb-1">
                  {analytics.categories.filter((c) => c.count > 0).length}
                </div>
                <div className="text-xs md:text-sm text-blue-200">問題領域</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardContent className="p-3 md:p-6 text-center">
                <div
                  className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${analytics.recentTrends.growthColor}80, ${analytics.recentTrends.growthColor}60)`,
                  }}
                >
                  <GrowthIcon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-xl md:text-3xl font-bold text-white mb-1">
                  {analytics.recentTrends.growth > 0 ? "+" : ""}
                  {analytics.recentTrends.growth}%
                </div>
                <div className="text-xs md:text-sm" style={{ color: analytics.recentTrends.growthColor }}>
                  {analytics.recentTrends.growthLabel}
                </div>
                {/* 詳細說明 */}
                <div className="text-xs text-slate-400 mt-1">上週: {analytics.recentTrends.lastWeek} 個</div>
              </CardContent>
            </Card>
          </div>

          {/* 分類指南 - 手機優化 */}
          <Card id="category-guide" className="bg-gradient-to-r from-blue-900/80 to-indigo-800/80 backdrop-blur-sm border border-blue-500/50 mb-6 md:mb-12">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base md:text-xl lg:text-2xl text-white">問題分類說明</CardTitle>
                    <CardDescription className="text-white/90 text-xs md:text-sm lg:text-base">
                      了解我們如何分類和分析各種職場困擾
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryGuide(!showCategoryGuide)}
                  className="text-indigo-200 hover:text-white hover:bg-indigo-800/50 self-start sm:self-auto flex-shrink-0"
                >
                  {showCategoryGuide ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      收起
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      展開
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            {showCategoryGuide && (
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  {categories.map((category, index) => (
                    <div
                      key={category.name}
                      className="p-3 md:p-4 rounded-lg bg-slate-800/50 border border-slate-600/30 hover:bg-slate-700/60 transition-all duration-200"
                    >
                      <div className="flex items-start gap-2 md:gap-3 mb-2">
                        <div className="text-lg md:text-2xl">{category.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white text-sm md:text-base">{category.name}</h4>
                            <div
                              className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            ></div>
                          </div>
                          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{category.description}</p>
                        </div>
                      </div>

                      {/* 關鍵字示例 */}
                      <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-600/30">
                        <div className="text-xs text-slate-400 mb-2">常見關鍵字：</div>
                        <div className="flex flex-wrap gap-1">
                          {category.keywords.slice(0, 6).map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs px-1.5 md:px-2 py-0.5 bg-slate-600/50 text-slate-300 border-slate-500/50"
                            >
                              {keyword}
                            </Badge>
                          ))}
                          {category.keywords.length > 6 && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 md:px-2 py-0.5 bg-slate-600/30 text-slate-400 border-slate-500/30"
                            >
                              +{category.keywords.length - 6}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* 手機版：垂直佈局，桌面版：並排佈局 */}
          <div className="space-y-6 md:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 md:gap-12">
            {/* 雷達圖 - 手機版給予更多高度 */}
            <Card id="radar-chart" className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl lg:text-2xl text-white flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  問題分布圖譜
                </CardTitle>
                <CardDescription className="text-white/90 text-xs md:text-sm">
                  各類職場困擾的完整案例分布（包含私密數據）
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 手機版使用更大的高度，桌面版保持原有高度 */}
                <div className="h-64 sm:h-80 md:h-64 lg:h-80 xl:h-96">
                  <RadarChart data={analytics.categories} />
                </div>
              </CardContent>
            </Card>

            {/* 分類詳細統計 */}
            <Card id="category-stats" className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl lg:text-2xl text-white flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full flex items-center justify-center">
                    <Target className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  完整案例統計
                  <Badge className="bg-gradient-to-r from-pink-700/60 to-purple-700/60 text-white border border-pink-400/50 text-xs px-2 py-1">
                    含私密數據
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/90 text-xs md:text-sm">
                  每個領域的所有案例數量（包含公開和私密案例）
                  {analytics.categories.filter((cat) => cat.count > 0).length > 0 && (
                    <span className="block text-xs text-slate-400 mt-1">
                      共 {analytics.categories.filter((cat) => cat.count > 0).length} 個活躍分類
                      {analytics.categories.filter((cat) => cat.count > 0).length > 4 && "，可滾動查看全部"}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {/* 設定固定高度並添加滾動 */}
                <div className="max-h-64 md:max-h-80 overflow-y-auto pr-2 space-y-3 md:space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {analytics.categories
                    .filter((cat) => cat.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .map((category, index) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-slate-600/40 transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          <div className="text-base md:text-xl">
                            {categories.find((cat) => cat.name === category.name)?.icon || "❓"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white flex items-center gap-2 mb-1">
                              <span className="truncate">{category.name}</span>
                              <div
                                className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              {/* 添加排名標示 */}
                              {index < 3 && (
                                <span className="text-xs bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 px-1.5 md:px-2 py-0.5 rounded-full border border-cyan-500/30 flex-shrink-0">
                                  TOP {index + 1}
                                </span>
                              )}
                            </div>
                            <div className="text-xs md:text-sm text-slate-300">{category.count} 個案例</div>
                            {category.description && (
                              <div className="text-xs text-slate-400 mt-1 line-clamp-2">{category.description}</div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-slate-600/50 text-slate-200 flex-shrink-0 ml-2">
                          {category.percentage}%
                        </Badge>
                      </div>
                    ))}
                </div>

                {/* 滾動提示 */}
                {analytics.categories.filter((cat) => cat.count > 0).length > 4 && (
                  <div className="text-center pt-2 border-t border-slate-600/30">
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                      <span>向下滾動查看更多分類</span>
                      <div
                        className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 多維度分析說明 */}
          <Card className="bg-gradient-to-r from-blue-900/80 to-indigo-800/80 backdrop-blur-sm border border-blue-500/50 mt-6 md:mt-12">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl lg:text-2xl text-white flex items-center gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                完整數據分析優勢
              </CardTitle>
              <CardDescription className="text-white/90 text-xs md:text-sm">
                包含私密案例的全面分析，提供更準確的洞察
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-200">🔍 真實全貌</h4>
                  <p className="text-purple-100 leading-relaxed">
                    包含所有案例數據，不受公開意願影響，呈現最真實的問題狀況
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-200">📊 精準決策</h4>
                  <p className="text-purple-100 leading-relaxed">
                    基於完整數據制定改善策略，避免因樣本偏差導致的決策失誤
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-200">🎯 隱藏問題</h4>
                  <p className="text-purple-100 leading-relaxed">
                    發現那些員工不願公開但確實存在的問題，提前預防和解決
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-200">🔒 隱私保護</h4>
                  <p className="text-purple-100 leading-relaxed">在保護個人隱私的前提下，最大化數據的分析價值</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 熱門關鍵字 */}
          {analytics.topKeywords.length > 0 && (
            <Card id="keyword-section" className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 mt-6 md:mt-12">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl lg:text-2xl text-white flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  最常見的問題關鍵字
                </CardTitle>
                <CardDescription className="text-white/90 text-xs md:text-sm">
                  在所有案例中最常出現的詞彙，反映團隊面臨的核心挑戰
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {analytics.topKeywords.map((keyword, index) => (
                    <Badge
                      key={keyword.word}
                      variant="secondary"
                      className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-500/30 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm"
                    >
                      {keyword.word} ({keyword.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* 固定在右下角的教学按钮 */}
      <Button
        onClick={startTutorial}
        className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-0.5 px-2.5 py-2 h-auto min-h-[48px] rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 border border-cyan-400/30"
        title="點擊開始使用教學"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-[10px] font-medium leading-tight">使用教學</span>
      </Button>

      {/* Driver.js 自定义样式 */}
      <style jsx global>{`
        .driver-popover {
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(16px);
          border: 2px solid rgba(59, 130, 246, 0.6) !important;
          border-radius: 12px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
        }
        
        .driver-popover-title {
          color: white !important;
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
        }
        
        .driver-popover-description {
          color: rgba(226, 232, 240, 0.95) !important;
          font-size: 0.95rem !important;
          line-height: 1.6 !important;
          margin-bottom: 16px !important;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3) !important;
        }
        
        .driver-popover-progress-text {
          color: rgba(147, 197, 253, 0.9) !important;
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3) !important;
        }
        
        .driver-popover-navigation-btns {
          gap: 8px !important;
        }
        
        .driver-popover-next-btn, .driver-popover-done-btn {
          background: linear-gradient(to right, #06b6d4, #3b82f6) !important;
          color: white !important;
          border: 2px solid rgba(59, 130, 246, 0.3) !important;
          padding: 10px 18px !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          font-size: 0.9rem !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
          text-shadow: none !important;
          letter-spacing: 0.02em !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
        
        .driver-popover-next-btn:hover, .driver-popover-done-btn:hover {
          background: linear-gradient(to right, #0891b2, #2563eb) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5) !important;
          color: white !important;
          text-shadow: none !important;
        }
        
        .driver-popover-prev-btn, .driver-popover-close-btn {
          background: rgba(51, 65, 85, 0.95) !important;
          color: rgba(255, 255, 255, 0.95) !important;
          border: 2px solid rgba(71, 85, 105, 0.7) !important;
          padding: 10px 18px !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          font-size: 0.9rem !important;
          transition: all 0.2s ease !important;
          text-shadow: none !important;
          letter-spacing: 0.02em !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
        
        .driver-popover-prev-btn:hover, .driver-popover-close-btn:hover {
          background: rgba(71, 85, 105, 0.95) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
          color: white !important;
          text-shadow: none !important;
        }
        
        /* 调整关闭按钮大小 */
        .driver-popover-close-btn {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          width: 28px !important;
          height: 28px !important;
          padding: 0 !important;
          border-radius: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 16px !important;
          line-height: 1 !important;
          background: rgba(71, 85, 105, 0.7) !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
          color: rgba(156, 163, 175, 0.8) !important;
          z-index: 10 !important;
        }
        
        .driver-popover-close-btn:hover {
          background: rgba(239, 68, 68, 0.8) !important;
          border-color: rgba(239, 68, 68, 0.6) !important;
          color: white !important;
          transform: none !important;
        }
        
        .driver-overlay {
          background: transparent !important;
          backdrop-filter: none !important;
        }
        
        .driver-highlighted-element {
          box-shadow: 
            0 0 0 2px rgba(59, 130, 246, 0.8) !important,
            0 0 0 4px rgba(59, 130, 246, 0.3) !important;
          border-radius: 6px !important;
          position: relative !important;
          z-index: 9999 !important;
          background: transparent !important;
        }
        
        .driver-highlighted-element::before {
          content: '' !important;
          position: absolute !important;
          top: -3px !important;
          left: -3px !important;
          right: -3px !important;
          bottom: -3px !important;
          border: 2px solid rgba(59, 130, 246, 0.7) !important;
          border-radius: 8px !important;
          z-index: -1 !important;
          background: transparent !important;
          animation: driver-gentle-pulse 3s ease-in-out infinite !important;
        }
        
        .driver-highlighted-element::after {
          display: none !important;
        }
        
        /* 确保内部内容完全不受影响 */
        .driver-highlighted-element * {
          position: relative !important;
          z-index: 1 !important;
          background: inherit !important;
          opacity: inherit !important;
          filter: none !important;
          color: inherit !important;
        }
        
        /* 完全移除对输入框的任何样式修改 */
        .driver-highlighted-element input,
        .driver-highlighted-element textarea,
        .driver-highlighted-element label,
        .driver-highlighted-element div,
        .driver-highlighted-element span {
          background: inherit !important;
          opacity: inherit !important;
          filter: none !important;
          box-shadow: inherit !important;
          color: inherit !important;
        }
        
        @keyframes driver-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        
        @keyframes driver-gentle-pulse {
          0%, 100% {
            border-color: rgba(59, 130, 246, 0.5);
          }
          50% {
            border-color: rgba(59, 130, 246, 0.9);
          }
        }
      `}</style>
    </div>
  )
}
