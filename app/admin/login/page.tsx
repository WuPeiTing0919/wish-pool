"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles, Settings, Eye, EyeOff, AlertCircle } from "lucide-react"
import HeaderMusicControl from "@/components/header-music-control"
import IpDisplay from "@/components/ip-display"

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 模擬登入驗證
      if (formData.email === "admin@panjit.com.tw" && formData.password === "Aa123456") {
        // 登入成功，設置 session 並跳轉到後台
        sessionStorage.setItem("adminLoggedIn", "true")
        router.push("/admin")
      } else {
        setError("帳號或密碼錯誤")
      }
    } catch (error) {
      setError("登入失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="border-b border-blue-800/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-[9999] shadow-lg shadow-slate-900/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo 區域 */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white whitespace-nowrap">資訊部．心願星河</h1>
            </Link>

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
            </nav>
          </div>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="flex-1 flex items-center justify-center py-8 relative z-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-md mx-auto">
            {/* 標題區域 */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Settings className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl md:text-4xl font-bold text-white">後台管理登入</h2>
              </div>
              <p className="text-blue-200 text-lg">
                請輸入管理員帳號密碼以進入後台管理系統
              </p>
            </div>

            {/* 登入表單 */}
            <Card className="bg-slate-800/50 border-slate-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center">管理員登入</CardTitle>
                <CardDescription className="text-blue-200 text-center">
                  輸入您的管理員憑證
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 錯誤訊息 */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-red-300 text-sm">{error}</span>
                    </div>
                  )}

                  {/* 帳號輸入 */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-200">帳號</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="請輸入管理員帳號"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    />
                  </div>

                  {/* 密碼輸入 */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-blue-200">密碼</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="請輸入管理員密碼"
                        required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 登入按鈕 */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        登入中...
                      </>
                    ) : (
                      "登入後台"
                    )}
                  </Button>

                  {/* 返回首頁 */}
                  <div className="text-center">
                    <Link 
                      href="/" 
                      className="text-blue-300 hover:text-white transition-colors text-sm"
                    >
                      ← 返回首頁
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 提示資訊 */}
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                忘記密碼？請聯繫系統管理員
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
