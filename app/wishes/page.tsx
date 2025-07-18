"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Search, Plus, Filter, X, BarChart3, Eye, Users, ChevronLeft, ChevronRight } from "lucide-react"
import WishCard from "@/components/wish-card"
import HeaderMusicControl from "@/components/header-music-control"
import { categories, categorizeWishMultiple, getCategoryStats, type Wish } from "@/lib/categorization"
import { WishService } from "@/lib/supabase-service"

// 分頁組件
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationComponent({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 根據螢幕尺寸調整顯示策略
  const getMobilePageNumbers = () => {
    const pages = []
    
    if (totalPages <= 3) {
      // 小於等於3頁，全部顯示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 手機端簡化邏輯：只顯示當前頁和相鄰頁
      if (currentPage === 1) {
        pages.push(1, 2, '...', totalPages)
      } else if (currentPage === totalPages) {
        pages.push(1, '...', totalPages - 1, totalPages)
      } else {
        if (currentPage === 2) {
          pages.push(1, 2, 3, '...', totalPages)
        } else if (currentPage === totalPages - 1) {
          pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
        } else {
          pages.push(1, '...', currentPage, '...', totalPages)
        }
      }
    }
    
    return pages
  }

  const getDesktopPageNumbers = () => {
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
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 px-2 sm:px-4">
      {/* 上一頁按鈕 */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative overflow-hidden bg-slate-800/90 hover:bg-slate-700/90 disabled:bg-slate-900/50 disabled:opacity-40 text-slate-200 border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 min-w-[36px] sm:min-w-[44px] h-9 sm:h-11 shrink-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300"></div>
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
      </Button>

      {/* 桌面端頁數按鈕 */}
      <div className="hidden sm:flex items-center gap-1">
        {getDesktopPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-slate-400 text-sm">
                ...
              </span>
            )
          }
          
          const pageNumber = page as number
          const isActive = pageNumber === currentPage
          
          return (
            <Button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`
                relative overflow-hidden min-w-[44px] h-11 text-sm font-medium transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white border border-cyan-400/50 shadow-lg shadow-cyan-500/25 transform scale-105'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-600/50 hover:border-cyan-400/50'
                }
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse"></div>
              )}
              <span className="relative z-10">{pageNumber}</span>
            </Button>
          )
        })}
      </div>

      {/* 手機端頁數按鈕 */}
      <div className="flex sm:hidden items-center gap-0.5">
        {getMobilePageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`mobile-ellipsis-${index}`} className="px-1.5 py-2 text-slate-400 text-xs">
                ...
              </span>
            )
          }
          
          const pageNumber = page as number
          const isActive = pageNumber === currentPage
          
          return (
            <Button
              key={`mobile-${pageNumber}`}
              onClick={() => onPageChange(pageNumber)}
              className={`
                relative overflow-hidden min-w-[32px] h-9 text-xs font-medium transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white border border-cyan-400/50 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-600/50 hover:border-cyan-400/50'
                }
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse"></div>
              )}
              <span className="relative z-10">{pageNumber}</span>
            </Button>
          )
        })}
      </div>

      {/* 下一頁按鈕 */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="relative overflow-hidden bg-slate-800/90 hover:bg-slate-700/90 disabled:bg-slate-900/50 disabled:opacity-40 text-slate-200 border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 min-w-[36px] sm:min-w-[44px] h-9 sm:h-11 shrink-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300"></div>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
      </Button>
    </div>
  )
}

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [publicWishes, setPublicWishes] = useState<Wish[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filteredWishes, setFilteredWishes] = useState<Wish[]>([])
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: number }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [totalWishes, setTotalWishes] = useState(0)
  const [privateCount, setPrivateCount] = useState(0)
  
  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [paginatedWishes, setPaginatedWishes] = useState<Wish[]>([])
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        // 獲取所有困擾（用於統計）
        const allWishesData = await WishService.getAllWishes()
        
        // 獲取公開困擾（用於顯示）
        const publicWishesData = await WishService.getPublicWishes()
        
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
        const publicWishes = publicWishesData.map(convertWish)
        
        // 計算私密困擾數量
        const privateCount = allWishes.length - publicWishes.length

        setWishes(allWishes)
        setPublicWishes(publicWishes)
        setTotalWishes(allWishes.length)
        setPrivateCount(privateCount)
        setCategoryStats(getCategoryStats(publicWishes))
      } catch (error) {
        console.error("獲取困擾數據失敗:", error)
        // 如果 Supabase 連接失敗，回退到 localStorage
        const savedWishes = JSON.parse(localStorage.getItem("wishes") || "[]")
        const publicOnly = savedWishes.filter((wish: Wish & { isPublic?: boolean }) => wish.isPublic !== false)
        const privateOnly = savedWishes.filter((wish: Wish & { isPublic?: boolean }) => wish.isPublic === false)

        setWishes(savedWishes)
        setPublicWishes(publicOnly.reverse())
        setTotalWishes(savedWishes.length)
        setPrivateCount(privateOnly.length)
        setCategoryStats(getCategoryStats(publicOnly))
      }
    }

    fetchWishes()
  }, [])

  useEffect(() => {
    let filtered = publicWishes

    // 按搜尋詞篩選
    if (searchTerm) {
      filtered = filtered.filter(
        (wish) =>
          wish.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wish.currentPain.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wish.expectedSolution.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // 按分類篩選（支持多標籤）
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((wish) => {
        const wishCategories = categorizeWishMultiple(wish)
        return selectedCategories.some((selectedCategory) =>
          wishCategories.some((wishCategory) => wishCategory.name === selectedCategory),
        )
      })
    }

    setFilteredWishes(filtered)
  }, [publicWishes, searchTerm, selectedCategories])

  // 分頁計算 useEffect
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const wishesToPaginate = filteredWishes.length > 0 ? filteredWishes : publicWishes
    
    setPaginatedWishes(wishesToPaginate.slice(startIndex, endIndex))
    setTotalPages(Math.ceil(wishesToPaginate.length / itemsPerPage))
  }, [filteredWishes, publicWishes, currentPage, itemsPerPage])

  // 重置分頁當篩選條件改變時
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategories])

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((cat) => cat !== categoryName) : [...prev, categoryName],
    )
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSearchTerm("")
  }

  const hasActiveFilters = selectedCategories.length > 0 || searchTerm.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 星空背景 - 手機優化 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
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
        <div className="absolute top-1/4 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header - 修復跑版問題 */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo 區域 - 防止文字換行 */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white whitespace-nowrap">心願星河</h1>
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
                <Link href="/analytics">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-2 text-xs"
                  >
                    洞察
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
                <Link href="/analytics">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-2 text-xs"
                  >
                    洞察
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

      {/* Main Content - 手機優化 */}
      <main className="py-8 md:py-12 px-1 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">聆聽每一份真實經歷</h2>
            <p className="text-blue-200 mb-4 md:mb-6 text-sm md:text-base px-1 sm:px-4">
              這裡收集了許多職場工作者願意公開分享的真實困擾和經驗
            </p>

            {/* Search Bar and Filter Button - 並排布局 */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto px-0 sm:px-2 md:px-0 mb-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
                <Input
                  placeholder="搜尋相似的工作困擾..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-blue-600/50 text-white placeholder:text-blue-300 focus:border-cyan-400 text-sm md:text-base"
                />
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  border-blue-400/50 bg-slate-800/50 text-blue-200 hover:bg-slate-700/50 hover:text-white
                  flex-shrink-0 px-4 py-2 h-10
                  ${showFilters ? "bg-slate-700/70 border-cyan-400/70 text-cyan-200" : ""}
                `}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">篩選器</span>
                <span className="sm:hidden">篩選</span>
                {selectedCategories.length > 0 && (
                  <Badge className="ml-2 bg-cyan-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mb-6 md:mb-8 p-3 sm:p-4 md:p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-600/50 animate-in slide-in-from-top-2 duration-200 mx-0 sm:mx-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  按問題類型篩選
                  <Badge className="bg-blue-600/20 text-blue-200 text-xs px-2 py-1">支持多標籤</Badge>
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-blue-300 hover:text-white hover:bg-blue-800/50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    清除篩選
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const count = categoryStats[category.name] || 0
                  const isSelected = selectedCategories.includes(category.name)

                  return (
                    <button
                      key={category.name}
                      onClick={() => toggleCategory(category.name)}
                      disabled={count === 0}
                      className={`
                        relative p-3 rounded-lg border transition-all duration-200 text-left
                        ${
                          isSelected
                            ? `bg-gradient-to-r ${category.bgColor} ${category.borderColor} ${category.textColor} border-2 shadow-lg transform scale-[1.02]`
                            : count > 0
                              ? "bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/40 hover:border-slate-500/70 hover:scale-[1.01]"
                              : "bg-slate-800/20 border-slate-700/30 text-slate-500 cursor-not-allowed opacity-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{category.name}</div>
                            <div className="text-xs opacity-75">{count} 個公開案例</div>
                          </div>
                        </div>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-current opacity-80 animate-pulse"></div>}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Active Filters Display */}
              {selectedCategories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-600/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-blue-200">正在查看：</span>
                    {selectedCategories.map((categoryName) => {
                      const category = categories.find((cat) => cat.name === categoryName)
                      return (
                        <Badge
                          key={categoryName}
                          className={`bg-gradient-to-r ${category?.bgColor} ${category?.borderColor} ${category?.textColor} border cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() => toggleCategory(categoryName)}
                        >
                          <span className="mr-1">{category?.icon}</span>
                          {categoryName}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats - 手機優化，增加隱私說明 */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 text-blue-200 border border-blue-700/50 text-xs md:text-sm">
                <Eye className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                <span className="hidden sm:inline">
                  {hasActiveFilters ? (
                    <>找到 {filteredWishes.length} / {publicWishes.length} 個相關案例</>
                  ) : (
                    <>公開分享 {publicWishes.length} 個案例</>
                  )}
                  {totalPages > 1 && (
                    <> · 第 {currentPage}/{totalPages} 頁</>
                  )}
                </span>
                <span className="sm:hidden">
                  {hasActiveFilters ? `${filteredWishes.length}/${publicWishes.length}` : `${publicWishes.length} 個案例`}
                  {totalPages > 1 && ` (${currentPage}/${totalPages})`}
                </span>
              </div>

              {privateCount > 0 && (
                <div className="inline-flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 text-slate-300 border border-slate-600/50 text-xs md:text-sm">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                  <span className="hidden sm:inline">另有 {privateCount} 個私密案例用於分析</span>
                  <span className="sm:hidden">{privateCount} 個私密案例</span>
                </div>
              )}
            </div>

            {privateCount > 0 && (
              <p className="text-xs md:text-sm text-slate-400 px-2 sm:px-4">
                私密案例不會顯示在此頁面，但會納入問題洞察分析，幫助了解整體趨勢
              </p>
            )}
          </div>

          {/* Wishes Grid - 手機優化 */}
          {paginatedWishes.length > 0 ? (
            <>
              <div className="grid gap-4 md:gap-6 lg:grid-cols-1">
                {paginatedWishes.map((wish) => (
                  <WishCard key={wish.id} wish={wish} />
                ))}
              </div>
              
              {/* 分頁組件 */}
              {totalPages > 1 && (
                <PaginationComponent 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : publicWishes.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16 px-2 sm:px-4">
              <div className="mb-4 sm:mb-6">
                <div className="relative mx-auto w-16 h-20 sm:w-20 sm:h-26 md:w-24 md:h-32">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-20 md:w-16 md:h-24 bg-gradient-to-b from-cyan-100/20 to-blue-200/30 rounded-t-xl md:rounded-t-2xl rounded-b-md md:rounded-b-lg shadow-xl shadow-cyan-500/20 backdrop-blur-sm border border-cyan-300/30 opacity-50">
                    <div className="absolute -top-1.5 md:-top-2 left-1/2 transform -translate-x-1/2 w-3 h-2.5 md:w-4 md:h-3 bg-slate-700 rounded-t-sm md:rounded-t-md"></div>
                    <div className="absolute top-0.5 md:top-1 left-0.5 md:left-1 w-1.5 h-14 md:w-2 md:h-16 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-100 mb-2">
                {totalWishes > 0 ? "還沒有人公開分享經歷" : "還沒有人分享經歷"}
              </h3>
              <p className="text-blue-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed px-1 sm:px-2">
                {totalWishes > 0
                  ? `目前有 ${totalWishes} 個案例，但都選擇保持私密。成為第一個公開分享的人吧！`
                  : "成為第一個分享工作困擾的人，幫助更多人找到解決方案"}
              </p>
              <Link href="/submit">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 text-sm md:text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  {totalWishes > 0 ? "公開分享第一個案例" : "分享第一個案例"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 md:py-16 px-2 sm:px-4">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-400 mx-auto mb-3 sm:mb-4 opacity-50" />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-100 mb-2">沒有找到相關案例</h3>
              <p className="text-blue-300 mb-4 md:mb-6 text-sm md:text-base px-1 sm:px-0">
                {hasActiveFilters ? "試試調整篩選條件，或分享你的獨特經歷" : "試試其他關鍵字，或分享你的困擾"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="border-blue-400 bg-slate-800/50 text-blue-100 hover:bg-slate-700/50 text-sm md:text-base"
                  >
                    查看所有公開案例
                  </Button>
                )}
                <Link href="/submit">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 text-sm md:text-base">
                    <Plus className="w-4 h-4 mr-2" />
                    分享你的經歷
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
