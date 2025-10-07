"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Database, Settings, TestTube, Trash2 } from "lucide-react"
import HeaderMusicControl from "@/components/header-music-control"
import MigrationDialog from "@/components/migration-dialog"
import { testDatabaseConnection, MigrationService } from "@/lib/database-service"

export default function SettingsPage() {
  const [showMigration, setShowMigration] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [localDataCount, setLocalDataCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkLocalData()
    checkConnection()
  }, [])

  const checkLocalData = () => {
    try {
      const wishes = JSON.parse(localStorage.getItem("wishes") || "[]")
      setLocalDataCount(wishes.length)
    } catch (error) {
      setLocalDataCount(0)
    }
  }

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      const connected = await testDatabaseConnection()
      setIsConnected(connected)
    } catch (error) {
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllData = () => {
    if (confirm("確定要清除所有本地數據嗎？此操作無法復原。")) {
      MigrationService.clearLocalStorageData()
      // 也清除其他設定
      localStorage.removeItem("backgroundMusicState")
      localStorage.removeItem("user_session")
      setLocalDataCount(0)
      alert("本地數據已清除")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 星空背景 */}
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
        <div className="absolute top-1/4 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-purple-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white whitespace-nowrap">資訊部．心願星河</h1>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
              <div className="hidden sm:block">
                <HeaderMusicControl />
              </div>
              <div className="sm:hidden">
                <HeaderMusicControl mobileSimplified />
              </div>

              <Link href="/">
                <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-blue-800/50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Settings className="w-8 h-8 text-cyan-400" />
              系統設定
            </h2>
            <p className="text-blue-200 text-sm md:text-base">管理數據存儲和系統配置</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Supabase 連接狀態 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Database className="w-6 h-6 text-blue-400" />
                  Supabase 數據庫狀態
                </CardTitle>
                <CardDescription className="text-blue-200">雲端數據庫連接和配置狀態</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
                    <span className="text-white">連接狀態</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={isConnected ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}>
                      {isLoading ? "檢查中..." : isConnected ? "已連接" : "未連接"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={checkConnection}
                      disabled={isLoading}
                      className="text-blue-200 hover:text-white"
                    >
                      <TestTube className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {!isConnected && (
                  <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                    <p className="text-red-200 text-sm">無法連接到 Supabase。請檢查：</p>
                    <ul className="text-red-200 text-xs mt-2 ml-4 space-y-1">
                      <li>• 環境變數 NEXT_PUBLIC_SUPABASE_URL 是否正確</li>
                      <li>• 環境變數 NEXT_PUBLIC_SUPABASE_ANON_KEY 是否正確</li>
                      <li>• Supabase 項目是否正常運行</li>
                      <li>• 網路連接是否正常</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 數據遷移 */}
            {localDataCount > 0 && (
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-400" />
                    數據遷移
                    <Badge className="bg-orange-500/20 text-orange-200 border border-orange-400/30">需要處理</Badge>
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    發現 {localDataCount} 個本地困擾案例，建議遷移到雲端數據庫
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowMigration(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                  >
                    開始數據遷移
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 數據管理 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Trash2 className="w-6 h-6 text-red-400" />
                  數據管理
                </CardTitle>
                <CardDescription className="text-blue-200">清除本地存儲的數據</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">本地困擾案例</span>
                    <Badge variant="secondary">{localDataCount} 個</Badge>
                  </div>
                  <p className="text-slate-300 text-sm">存儲在瀏覽器本地的困擾案例數據</p>
                </div>

                <Button onClick={clearAllData} disabled={localDataCount === 0} variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除所有本地數據
                </Button>
              </CardContent>
            </Card>

            {/* 系統資訊 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white">系統資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">版本</span>
                    <div className="text-white">v1.0.0</div>
                  </div>
                  <div>
                    <span className="text-slate-400">數據庫</span>
                    <div className="text-white">{isConnected ? "Supabase" : "LocalStorage"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">用戶會話</span>
                    <div className="text-white text-xs truncate">
                      {typeof window !== "undefined"
                        ? localStorage.getItem("user_session")?.slice(-8) || "未設定"
                        : "載入中..."}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">瀏覽器</span>
                    <div className="text-white">
                      {typeof window !== "undefined" ? navigator.userAgent.split(" ").pop() : "未知"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 遷移對話框 */}
      {showMigration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <MigrationDialog
              onComplete={() => {
                setShowMigration(false)
                checkLocalData()
              }}
              onSkip={() => setShowMigration(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
