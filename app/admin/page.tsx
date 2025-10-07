"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  Eye, 
  Users, 
  Heart, 
  FileText, 
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Shield,
  EyeOff,
  HelpCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import HeaderMusicControl from "@/components/header-music-control"
import IpDisplay from "@/components/ip-display"
import RadarChart from "@/components/radar-chart"
import { categories, categorizeWishMultiple, type Wish } from "@/lib/categorization"

interface WishData {
  id: number
  title: string
  current_pain: string
  expected_solution: string
  expected_effect: string
  is_public: boolean
  email: string
  images: any[]
  user_session: string
  status: string
  category: string
  priority: number
  like_count: number
  created_at: string
  updated_at: string
}

interface CategoryData {
  name: string
  count: number
  percentage: number
  color: string
  keywords: string[]
  description?: string
}

interface AdminStats {
  totalWishes: number
  publicWishes: number
  privateWishes: number
  totalLikes: number
  categories: { [key: string]: number }
  recentWishes: number
  categoryDetails: CategoryData[]
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

export default function AdminPage() {
  const [wishes, setWishes] = useState<WishData[]>([])
  const [filteredWishes, setFilteredWishes] = useState<WishData[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [showCategoryGuide, setShowCategoryGuide] = useState(false)
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false)
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 分析許願內容（包含所有數據，包括私密的）
  const analyzeWishes = (wishList: WishData[]): AdminStats => {
    const totalWishes = wishList.length
    const publicWishes = wishList.filter((wish) => wish.is_public !== false).length
    const privateWishes = wishList.filter((wish) => wish.is_public === false).length
    const totalLikes = wishList.reduce((sum, wish) => sum + wish.like_count, 0)

    const categoryStats: { [key: string]: number } = {}
    const keywordCount: { [key: string]: number } = {}

    // 初始化分類統計
    categories.forEach((cat) => {
      categoryStats[cat.name] = 0
    })
    categoryStats["其他問題"] = 0

    // 分析每個許願（多標籤統計）- 包含所有數據
    wishList.forEach((wish) => {
      // 轉換數據格式以匹配 categorization.ts 的 Wish 接口
      const convertedWish: Wish = {
        id: wish.id.toString(),
        title: wish.title,
        currentPain: wish.current_pain,
        expectedSolution: wish.expected_solution,
        expectedEffect: wish.expected_effect || "",
        createdAt: wish.created_at,
        isPublic: wish.is_public,
        email: wish.email,
        images: wish.images,
        like_count: wish.like_count || 0,
      }

      const wishCategories = categorizeWishMultiple(convertedWish)

      wishCategories.forEach((category) => {
        categoryStats[category.name]++

        // 統計關鍵字
        if (category.keywords) {
          const fullText =
            `${wish.title} ${wish.current_pain} ${wish.expected_solution} ${wish.expected_effect}`.toLowerCase()
          category.keywords.forEach((keyword: string) => {
            if (fullText.includes(keyword.toLowerCase())) {
              keywordCount[keyword] = (keywordCount[keyword] || 0) + 1
            }
          })
        }
      })
    })

    // 計算百分比和準備數據
    const categoryDetails: CategoryData[] = categories.map((cat) => ({
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

    const thisWeek = wishList.filter((wish) => new Date(wish.created_at) >= oneWeekAgo).length
    const lastWeek = wishList.filter((wish) => {
      const date = new Date(wish.created_at)
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
      totalLikes,
      categories: categoryStats,
      recentWishes: thisWeek,
      categoryDetails,
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

  // 獲取所有數據
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 獲取困擾案例數據
      const wishesResponse = await fetch('/api/admin/wishes')
      const wishesResult = await wishesResponse.json()
      
      if (wishesResult.success) {
        const wishesData = wishesResult.data
        setWishes(wishesData)
        setFilteredWishes(wishesData)
        
        // 使用本地分析函數生成詳細統計
        const detailedStats = analyzeWishes(wishesData)
        setStats(detailedStats)
      }
      
    } catch (error) {
      console.error('獲取數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 過濾數據
  const filterData = () => {
    let filtered = wishes

    // 搜索過濾
    if (searchTerm) {
      filtered = filtered.filter(wish => 
        wish.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wish.current_pain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wish.expected_solution.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 狀態過濾
    if (statusFilter !== "all") {
      filtered = filtered.filter(wish => wish.status === statusFilter)
    }

    // 可見性過濾
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(wish => 
        visibilityFilter === "public" ? wish.is_public : !wish.is_public
      )
    }

    setFilteredWishes(filtered)
    setCurrentPage(1) // 重置到第一頁
  }

  // 分頁計算
  const totalPages = Math.ceil(filteredWishes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentWishes = filteredWishes.slice(startIndex, endIndex)

  // 分頁組件
  const PaginationComponent = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-blue-300">
          顯示第 {startIndex + 1} - {Math.min(endIndex, filteredWishes.length)} 筆，共 {filteredWishes.length} 筆
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-blue-200 border-slate-600/50 hover:bg-slate-700/50 hover:text-white hover:border-cyan-400/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={
                page === currentPage
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                  : "text-blue-200 border-slate-600/50 hover:bg-slate-700/50 hover:text-white hover:border-cyan-400/50"
              }
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="text-blue-200 border-slate-600/50 hover:bg-slate-700/50 hover:text-white hover:border-cyan-400/50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // 匯出 CSV
  const exportToCSV = async () => {
    try {
      setIsExporting(true)
      
      const response = await fetch('/api/admin/export-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: filteredWishes,
          filename: `困擾案例數據_${new Date().toISOString().split('T')[0]}.csv`
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `困擾案例數據_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('匯出失敗')
      }
    } catch (error) {
      console.error('匯出 CSV 失敗:', error)
      alert('匯出失敗，請稍後再試')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterData()
  }, [searchTerm, statusFilter, visibilityFilter, wishes])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative">
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-[9999] shadow-lg shadow-slate-900/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo 區域 */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white whitespace-nowrap">資訊部．心願星河</h1>
            </div>

            {/* 導航區域 */}
            <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
              {/* IP顯示 */}
              <div className="hidden sm:block">
                <IpDisplay />
              </div>
              
              {/* 音樂控制 */}
              <div className="hidden sm:block">
                <HeaderMusicControl />
              </div>
              <div className="sm:hidden">
                <HeaderMusicControl mobileSimplified />
              </div>

              {/* 返回按鈕 */}
              <Link href="/">
                <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="relative z-10 py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {/* 標題區域 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-cyan-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">後台管理系統</h2>
            </div>
            <p className="text-blue-200 text-lg">困擾案例數據管理與分析</p>
          </div>

          {/* 統計卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">總案例數</CardTitle>
                  <FileText className="h-4 w-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalWishes}</div>
                  <p className="text-xs text-blue-300">
                    公開 {stats.publicWishes} + 私密 {stats.privateWishes}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">總點讚數</CardTitle>
                  <Heart className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
                  <p className="text-xs text-blue-300">用戶支持總數</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">問題領域</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{Object.keys(stats.categories).length}</div>
                  <p className="text-xs text-blue-300">不同類別</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">本週新增</CardTitle>
                  <Users className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.recentWishes}</div>
                  <p className="text-xs text-blue-300">最近7天</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 主要內容區域 */}
          <Tabs defaultValue="data" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700/50">
              <TabsTrigger value="data" className="text-blue-200 data-[state=active]:text-white data-[state=active]:bg-slate-700/50">數據管理</TabsTrigger>
              <TabsTrigger value="analytics" className="text-blue-200 data-[state=active]:text-white data-[state=active]:bg-slate-700/50">數據分析</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-6">
              {/* 搜索和過濾區域 */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-cyan-400" />
                    數據篩選
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    搜索和過濾困擾案例數據
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="搜索標題或內容..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-blue-300 focus:border-cyan-400/50"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white focus:border-cyan-400/50">
                        <SelectValue placeholder="狀態" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-white">所有狀態</SelectItem>
                        <SelectItem value="active" className="text-white">活躍</SelectItem>
                        <SelectItem value="inactive" className="text-white">非活躍</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white focus:border-cyan-400/50">
                        <SelectValue placeholder="可見性" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-white">全部</SelectItem>
                        <SelectItem value="public" className="text-white">公開</SelectItem>
                        <SelectItem value="private" className="text-white">私密</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      onClick={exportToCSV} 
                      disabled={isExporting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
                    >
                      {isExporting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      匯出 CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 數據表格 */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    困擾案例列表
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    共 {filteredWishes.length} 筆數據
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600/50">
                          <th className="text-left py-3 px-4 text-blue-200 font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-blue-200 font-medium">標題</th>
                          <th className="text-left py-3 px-4 text-blue-200 font-medium">狀態</th>
                          <th className="text-left py-3 px-4 text-blue-200 font-medium">可見性</th>
                          <th className="text-left py-3 px-4 text-blue-200 font-medium">點讚數</th>
                          <th className="text-left py-3 px-4 text-blue-200 font-medium">創建時間</th>
                          <th className="text-left py-3 px-4 text-blue-200 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentWishes.map((wish) => (
                          <tr key={wish.id} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 px-4 text-white font-mono text-xs">{wish.id}</td>
                            <td className="py-3 px-4 text-white max-w-xs truncate" title={wish.title}>
                              {wish.title}
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={wish.status === 'active' ? 'default' : 'secondary'}
                                className={wish.status === 'active' 
                                  ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                                  : 'bg-slate-600/20 text-slate-300 border-slate-500/30'
                                }
                              >
                                {wish.status === 'active' ? '活躍' : '非活躍'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={wish.is_public ? 'default' : 'outline'}
                                className={wish.is_public 
                                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' 
                                  : 'bg-orange-600/20 text-orange-300 border-orange-500/30'
                                }
                              >
                                {wish.is_public ? '公開' : '私密'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-white flex items-center gap-1">
                              <Heart className="w-3 h-3 text-pink-400" />
                              {wish.like_count}
                            </td>
                            <td className="py-3 px-4 text-blue-300 text-xs">
                              {new Date(wish.created_at).toLocaleDateString('zh-TW')}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-200 border-slate-600/50 hover:bg-slate-700/50 hover:text-white hover:border-cyan-400/50"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                查看
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* 分頁組件 */}
                  <PaginationComponent />
                </CardContent>
              </Card>
          </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* 隱私說明卡片 */}
              <Card className="bg-gradient-to-r from-blue-900/80 to-indigo-800/80 backdrop-blur-sm border border-blue-500/50">
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
                <div className={`${showPrivacyDetails ? "block" : "hidden"} md:block`}>
                  <CardContent className="pt-0">
                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-indigo-200 flex items-center gap-2">
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          公開案例 ({stats?.publicWishes || 0} 個)
                        </h4>
                        <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
                          這些案例會顯示在「聆聽心聲」頁面，供其他人查看和產生共鳴
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-indigo-200 flex items-center gap-2">
                          <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
                          私密案例 ({stats?.privateWishes || 0} 個)
                        </h4>
                        <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
                          這些案例保持匿名且私密，僅用於統計分析，幫助了解整體趨勢
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* 統計概覽 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
                  <CardContent className="p-3 md:p-6 text-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                      <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-xl md:text-3xl font-bold text-white mb-1">{stats?.totalWishes || 0}</div>
                    <div className="text-xs md:text-sm text-blue-200">總案例數</div>
                    <div className="text-xs text-slate-400 mt-1">
                      公開 {stats?.publicWishes || 0} + 私密 {stats?.privateWishes || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
                  <CardContent className="p-3 md:p-6 text-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                      <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-xl md:text-3xl font-bold text-white mb-1">{stats?.recentTrends?.thisWeek || 0}</div>
                    <div className="text-xs md:text-sm text-blue-200">本週新增</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
                  <CardContent className="p-3 md:p-6 text-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                      <Target className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-xl md:text-3xl font-bold text-white mb-1">
                      {stats?.categoryDetails?.filter((c) => c.count > 0).length || 0}
                    </div>
                    <div className="text-xs md:text-sm text-blue-200">問題領域</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
                  <CardContent className="p-3 md:p-6 text-center">
                    <div
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${stats?.recentTrends?.growthColor || '#6B7280'}80, ${stats?.recentTrends?.growthColor || '#6B7280'}60)`,
                      }}
                    >
                      {stats?.recentTrends?.growthIcon === "up" ? (
                        <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
                      ) : stats?.recentTrends?.growthIcon === "down" ? (
                        <TrendingDown className="w-4 h-4 md:w-6 md:h-6 text-white" />
                      ) : (
                        <Minus className="w-4 h-4 md:w-6 md:h-6 text-white" />
                      )}
                    </div>
                    <div className="text-xl md:text-3xl font-bold text-white mb-1">
                      {stats?.recentTrends?.growth && stats.recentTrends.growth > 0 ? "+" : ""}
                      {stats?.recentTrends?.growth || 0}%
                    </div>
                    <div className="text-xs md:text-sm" style={{ color: stats?.recentTrends?.growthColor || '#6B7280' }}>
                      {stats?.recentTrends?.growthLabel || "持平"}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">上週: {stats?.recentTrends?.lastWeek || 0} 個</div>
                  </CardContent>
                </Card>
              </div>

              {/* 分類指南 */}
              <Card className="bg-gradient-to-r from-blue-900/80 to-indigo-800/80 backdrop-blur-sm border border-blue-500/50">
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
                {/* 雷達圖 */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
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
                    <div className="h-64 sm:h-80 md:h-64 lg:h-80 xl:h-96">
                      {stats?.categoryDetails && <RadarChart data={stats.categoryDetails} />}
                    </div>
                  </CardContent>
                </Card>

                {/* 分類詳細統計 */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
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
                      {stats?.categoryDetails?.filter((cat) => cat.count > 0).length && (
                        <span className="block text-xs text-slate-400 mt-1">
                          共 {stats.categoryDetails.filter((cat) => cat.count > 0).length} 個活躍分類
                          {stats.categoryDetails.filter((cat) => cat.count > 0).length > 4 && "，可滾動查看全部"}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="max-h-64 md:max-h-80 overflow-y-auto pr-2 space-y-3 md:space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                      {stats?.categoryDetails
                        ?.filter((cat) => cat.count > 0)
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
                    {stats?.categoryDetails?.filter((cat) => cat.count > 0).length && stats.categoryDetails.filter((cat) => cat.count > 0).length > 4 && (
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

              {/* 熱門關鍵字 */}
              {stats?.topKeywords && stats.topKeywords.length > 0 && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
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
                      {stats.topKeywords.map((keyword, index) => (
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
