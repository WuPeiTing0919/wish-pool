"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, ArrowLeft, Send, BarChart3, Eye, EyeOff, Shield, Info, Mail, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { soundManager } from "@/lib/sound-effects"
import HeaderMusicControl from "@/components/header-music-control"
import { moderateWishForm, type ModerationResult } from "@/lib/content-moderation"
import ContentModerationFeedback from "@/components/content-moderation-feedback"
import ImageUpload from "@/components/image-upload"
import type { ImageFile } from "@/lib/image-utils"
import { WishService } from "@/lib/supabase-service"

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    title: "",
    currentPain: "",
    expectedSolution: "",
    expectedEffect: "",
    isPublic: true,
    email: "",
  })
  const [images, setImages] = useState<ImageFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null)
  const [showModerationFeedback, setShowModerationFeedback] = useState(false)

  // 初始化音效系統
  useEffect(() => {
    const initSound = async () => {
      // 用戶首次點擊時啟動音頻上下文
      const handleFirstInteraction = async () => {
        await soundManager.play("hover") // 測試音效
        document.removeEventListener("click", handleFirstInteraction)
      }
      document.addEventListener("click", handleFirstInteraction)
    }
    initSound()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 先進行內容審核
    const moderation = moderateWishForm(formData)
    setModerationResult(moderation)

    if (!moderation.isAppropriate) {
      setShowModerationFeedback(true)
      await soundManager.play("click") // 播放提示音效
      toast({
        title: "內容需要修改",
        description: "請根據建議修改內容後再次提交",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setShowModerationFeedback(false)

    // 播放提交音效
    await soundManager.play("submit")

    try {
      // 創建困擾案例到 Supabase 數據庫
      await WishService.createWish({
        title: formData.title,
        currentPain: formData.currentPain,
        expectedSolution: formData.expectedSolution,
        expectedEffect: formData.expectedEffect,
        isPublic: formData.isPublic,
        email: formData.email,
        images: images, // 直接傳遞 ImageFile 數組
      })

      // 播放成功音效
      await soundManager.play("success")

      toast({
        title: "你的困擾已成功提交",
        description: formData.isPublic
          ? "正在為你準備專業的回饋，其他人也能看到你的分享..."
          : "正在為你準備專業的回饋，你的分享將保持私密...",
      })
    } catch (error) {
      console.error("提交困擾失敗:", error)
      
      // 播放錯誤音效
      await soundManager.play("click")
      
      toast({
        title: "提交失敗",
        description: "請稍後再試或檢查網路連接",
        variant: "destructive",
      })
      
      setIsSubmitting(false)
      return
    }

    setFormData({
      title: "",
      currentPain: "",
      expectedSolution: "",
      expectedEffect: "",
      isPublic: true,
      email: "",
    })
    setImages([])
    setIsSubmitting(false)
    setModerationResult(null)

    // 跳轉到感謝頁面
    setTimeout(() => {
      router.push("/thank-you")
    }, 1000)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleButtonClick = async () => {
    await soundManager.play("click")
  }

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
        <div className="absolute top-1/3 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
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
                    onClick={handleButtonClick}
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
                    onClick={handleButtonClick}
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

      {/* Main Content - 手機優化 */}
      <main className="py-12 md:py-12 px-1 sm:px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8 md:mb-10">
            {/* 小許願瓶 - 添加呼吸動畫 */}
            <div className="mb-10 md:mb-12">
              <div className="relative mx-auto w-16 h-22 md:w-20 md:h-28 mb-8 md:mb-10">
                <div
                  className="absolute bottom-0 left-1/2 w-10 h-16 md:w-12 md:h-20 bg-gradient-to-b from-cyan-100/30 to-blue-200/40 rounded-t-lg md:rounded-t-xl rounded-b-md md:rounded-b-lg shadow-xl shadow-cyan-500/20 backdrop-blur-sm border border-cyan-300/30"
                  style={{
                    transform: "translateX(-50%)",
                    animation: "bottleBreathe 6s ease-in-out infinite",
                  }}
                >
                  <div className="absolute -top-1.5 md:-top-2 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-slate-700 rounded-t-sm md:rounded-t-md"></div>
                  <div
                    className="absolute inset-1.5 md:inset-2 bg-gradient-radial from-yellow-300/40 via-cyan-300/20 to-transparent rounded-t-md md:rounded-t-lg rounded-b-sm md:rounded-b-md"
                    style={{
                      animation: "glowPulse 4s ease-in-out infinite",
                    }}
                  ></div>
                  <div className="absolute top-0.5 md:top-1 left-0.5 md:left-1 w-0.5 h-10 md:w-1 md:h-12 bg-white/20 rounded-full"></div>

                  {/* 小星光粒子 */}
                  <div
                    className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full"
                    style={{
                      animation: "sparkleFloat 8s ease-in-out infinite",
                    }}
                  ></div>
                  <div
                    className="absolute bottom-3 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full"
                    style={{
                      animation: "sparkleDrift 10s ease-in-out infinite",
                    }}
                  ></div>
                  <div
                    className="absolute top-6 left-3 w-0.5 h-0.5 bg-pink-300 rounded-full"
                    style={{
                      animation: "sparkleTwinkle 5s ease-in-out infinite",
                    }}
                  ></div>
                  <div
                    className="absolute bottom-5 right-3 w-0.5 h-0.5 bg-purple-300 rounded-full"
                    style={{
                      animation: "sparkleGentle 12s ease-in-out infinite",
                    }}
                  ></div>
                </div>

                {/* 呼吸光暈 */}
                <div
                  className="absolute bottom-0 left-1/2 w-20 h-20 md:w-24 md:h-24 bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-xl -z-10"
                  style={{
                    transform: "translateX(-50%)",
                    animation: "auraBreathe 6s ease-in-out infinite",
                  }}
                ></div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">分享你的工作困擾</h2>
            <p className="text-blue-200 text-sm sm:text-base px-2 sm:px-4 leading-relaxed">
              每一個困擾都是改善的起點，我們會用專業的角度為你分析和建議
            </p>
          </div>

          <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-sm border border-blue-700/50 mx-2 sm:mx-4 md:mx-0">
            <CardHeader className="px-3 sm:px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
              <CardTitle className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl text-white">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Send className="w-3 h-3 md:w-5 md:h-5 text-white" />
                </div>
                困擾分享
              </CardTitle>
              <CardDescription className="text-blue-200 text-sm md:text-base">
                請詳細描述你的工作困擾，我們會認真分析並提供專業建議
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-4 md:pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-blue-100 font-semibold text-sm md:text-base">
                    困擾標題 *
                  </Label>
                  <Input
                    id="title"
                    placeholder="簡潔描述你遇到的主要問題..."
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    className="bg-slate-700/50 border-blue-600/50 text-white placeholder:text-blue-300 focus:border-cyan-400 text-sm md:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPain" className="text-blue-100 font-semibold text-sm md:text-base">
                    具體困擾描述 *
                  </Label>
                  <Textarea
                    id="currentPain"
                    placeholder="詳細說明你在工作中遇到的困難，包括具體情況、影響程度等..."
                    value={formData.currentPain}
                    onChange={(e) => handleChange("currentPain", e.target.value)}
                    rows={3}
                    required
                    className="bg-slate-700/50 border-blue-600/50 text-white placeholder:text-blue-300 focus:border-cyan-400 text-sm md:text-base resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedSolution" className="text-blue-100 font-semibold text-sm md:text-base">
                    期望的解決方式 *
                  </Label>
                  <Textarea
                    id="expectedSolution"
                    placeholder="你希望這個問題能夠如何被解決？有什麼想法或建議嗎？"
                    value={formData.expectedSolution}
                    onChange={(e) => handleChange("expectedSolution", e.target.value)}
                    rows={3}
                    required
                    className="bg-slate-700/50 border-blue-600/50 text-white placeholder:text-blue-300 focus:border-cyan-400 text-sm md:text-base resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedEffect" className="text-blue-100 font-semibold text-sm md:text-base">
                    預期改善效果
                  </Label>
                  <Textarea
                    id="expectedEffect"
                    placeholder="如果問題解決了，你期望工作效率或環境會有什麼具體改善？"
                    value={formData.expectedEffect}
                    onChange={(e) => handleChange("expectedEffect", e.target.value)}
                    rows={2}
                    className="bg-slate-700/50 border-blue-600/50 text-white placeholder:text-blue-300 focus:border-cyan-400 text-sm md:text-base resize-none"
                  />
                </div>

                {/* 圖片上傳區域 */}
                <div className="space-y-2">
                  <Label className="text-blue-100 font-semibold text-sm md:text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    相關圖片 (可選)
                  </Label>
                  <div className="text-xs md:text-sm text-slate-400 mb-3">
                    上傳與困擾相關的截圖、照片或文件圖片，幫助我們更好地理解問題
                  </div>
                  <ImageUpload images={images} onImagesChange={setImages} disabled={isSubmitting} />
                </div>

                {/* Email 聯絡資訊 - 可選 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-blue-100 font-semibold text-sm md:text-base flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    聯絡信箱 (可選)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-slate-700/50 border-blue-600/50 text-white placeholder:text-blue-300 focus:border-cyan-400 text-sm md:text-base"
                  />
                  <div className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-300 mb-1">完全匿名且可選</p>
                        <ul className="space-y-1 text-slate-400">
                          <li>• 你的身份將完全保持匿名，我們不會公開任何個人資訊</li>
                          <li>• 提供 Email 僅用於我們主動聯繫你，提供個人化的解決方案建議</li>
                          <li>• 如果不想被聯繫，完全可以留空，不影響困擾的提交和分析</li>
                          <li>• 我們承諾不會將你的 Email 用於任何行銷或其他用途</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 內容審核回饋 */}
                {showModerationFeedback && moderationResult && (
                  <ContentModerationFeedback
                    result={moderationResult}
                    onRetry={() => {
                      const newModeration = moderateWishForm(formData)
                      setModerationResult(newModeration)
                      if (newModeration.isAppropriate) {
                        setShowModerationFeedback(false)
                        toast({
                          title: "內容檢查通過",
                          description: "現在可以提交你的困擾了！",
                        })
                      }
                    }}
                    className="animate-in slide-in-from-top-2 duration-300"
                  />
                )}

                {/* 隱私設定區塊 */}
                <div className="space-y-4 p-4 md:p-5 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-lg border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <Label className="text-white font-semibold text-sm md:text-base">隱私設定</Label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => handleChange("isPublic", checked as boolean)}
                        className="mt-1 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                      />
                      <div className="space-y-2 flex-1">
                        <Label
                          htmlFor="isPublic"
                          className="text-blue-100 font-medium text-sm md:text-base cursor-pointer flex items-center gap-2"
                        >
                          {formData.isPublic ? (
                            <>
                              <Eye className="w-4 h-4 text-cyan-400" />
                              公開分享到「聆聽心聲」頁面
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-slate-400" />
                              保持私密，不公開分享
                            </>
                          )}
                        </Label>
                        <div className="text-xs md:text-sm text-slate-300 leading-relaxed">
                          {formData.isPublic ? (
                            <span>
                              ✅ 你的困擾和圖片將會出現在「聆聽心聲」頁面，讓其他人看到並產生共鳴
                              <br />✅ 同時納入「問題洞察」分析，幫助改善整體工作環境
                            </span>
                          ) : (
                            <span>
                              🔒 你的困擾和圖片將保持私密，不會出現在「聆聽心聲」頁面
                              <br />✅ 仍會納入「問題洞察」分析，幫助開發者和管理者了解問題趨勢
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 說明區塊 */}
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs md:text-sm text-slate-300 leading-relaxed">
                          <p className="font-medium text-blue-200 mb-1">隱私保護說明：</p>
                          <ul className="space-y-1 text-slate-400">
                            <li>• 無論選擇公開或私密，你的個人身份都會保持匿名</li>
                            <li>• 私密分享只用於統計分析，幫助了解整體問題狀況</li>
                            <li>• 上傳的圖片會與文字內容一起受到相同的隱私保護</li>
                            <li>• 你可以隨時改變想法，但提交後無法修改此設定</li>
                            <li>• 所有數據都會安全保存，僅用於改善工作環境</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 md:pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.currentPain || !formData.expectedSolution}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 text-sm md:text-base py-2.5 md:py-3 transform hover:scale-105 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {formData.isPublic ? "公開提交困擾" : "私密提交困擾"}
                        {images.length > 0 && <span className="ml-1 text-xs opacity-75">({images.length} 張圖片)</span>}
                      </>
                    )}
                  </Button>
                  <Link href="/wishes" className="md:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleButtonClick}
                      className="w-full md:w-auto border-blue-400 bg-slate-800/50 text-blue-100 hover:bg-slate-700/50 text-sm md:text-base py-2.5 md:py-3 transform hover:scale-105 transition-all"
                    >
                      查看其他經歷
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

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
    </div>
  )
}
