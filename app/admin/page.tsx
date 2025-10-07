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
  ChevronRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import HeaderMusicControl from "@/components/header-music-control"
import IpDisplay from "@/components/ip-display"

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

interface AdminStats {
  totalWishes: number
  publicWishes: number
  privateWishes: number
  totalLikes: number
  categories: { [key: string]: number }
  recentWishes: number
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
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 獲取所有數據
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 獲取困擾案例數據
      const wishesResponse = await fetch('/api/admin/wishes')
      const wishesResult = await wishesResponse.json()
      
      if (wishesResult.success) {
        setWishes(wishesResult.data)
        setFilteredWishes(wishesResult.data)
      }
      
      // 獲取統計數據
      const statsResponse = await fetch('/api/admin/stats')
      const statsResult = await statsResponse.json()
      
      if (statsResult.success) {
        setStats(statsResult.data)
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
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    數據分析
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    困擾案例統計與分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 類別分布 */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-400" />
                        問題類別分布
                      </h3>
                      <div className="space-y-3">
                        {stats && Object.entries(stats.categories).map(([category, count]) => (
                          <div key={category} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                            <span className="text-white">{category}</span>
                            <Badge 
                              variant="outline" 
                              className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30"
                            >
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 時間分布 */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-yellow-400" />
                        創建時間分布
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-2xl font-bold text-white mb-1">{stats?.recentWishes}</div>
                          <div className="text-blue-300 text-sm">最近7天新增</div>
                        </div>
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-2xl font-bold text-white mb-1">{stats?.totalWishes}</div>
                          <div className="text-blue-300 text-sm">總案例數</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
