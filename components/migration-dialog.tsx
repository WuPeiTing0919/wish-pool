"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Database, Upload, CheckCircle, XCircle, AlertTriangle, Loader2, Trash2, RefreshCw } from "lucide-react"
import { MigrationService, testSupabaseConnection } from "@/lib/supabase-service"

interface MigrationDialogProps {
  onComplete?: () => void
  onSkip?: () => void
}

export default function MigrationDialog({ onComplete, onSkip }: MigrationDialogProps) {
  const [step, setStep] = useState<"check" | "migrate" | "complete" | "error">("check")
  const [localDataCount, setLocalDataCount] = useState(0)
  const [migrationResult, setMigrationResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    checkLocalData()
    checkConnection()
  }, [])

  const checkLocalData = () => {
    try {
      const wishes = JSON.parse(localStorage.getItem("wishes") || "[]")
      setLocalDataCount(wishes.length)
    } catch (error) {
      console.error("Error checking local data:", error)
      setLocalDataCount(0)
    }
  }

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      const connected = await testSupabaseConnection()
      setIsConnected(connected)
    } catch (error) {
      console.error("Connection check failed:", error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const startMigration = async () => {
    if (!isConnected) {
      alert("請先確保 Supabase 連接正常")
      return
    }

    setStep("migrate")
    setIsLoading(true)
    setProgress(0)

    try {
      // 模擬進度更新
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await MigrationService.migrateWishesFromLocalStorage()

      clearInterval(progressInterval)
      setProgress(100)

      setMigrationResult(result)

      if (result.success > 0) {
        setStep("complete")
      } else {
        setStep("error")
      }
    } catch (error) {
      console.error("Migration failed:", error)
      setMigrationResult({
        success: 0,
        failed: localDataCount,
        errors: [`遷移過程失敗: ${error}`],
      })
      setStep("error")
    } finally {
      setIsLoading(false)
    }
  }

  const clearLocalData = () => {
    if (confirm("確定要清除本地數據嗎？此操作無法復原。")) {
      MigrationService.clearLocalStorageData()
      setLocalDataCount(0)
      onComplete?.()
    }
  }

  const skipMigration = () => {
    if (confirm("跳過遷移將繼續使用本地存儲。確定要跳過嗎？")) {
      onSkip?.()
    }
  }

  if (localDataCount === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-green-600/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            準備就緒
          </CardTitle>
          <CardDescription className="text-green-200">沒有發現本地數據，可以直接開始使用 Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            開始使用
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-600/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-400" />
          數據遷移到 Supabase
        </CardTitle>
        <CardDescription className="text-blue-200">
          發現 {localDataCount} 個本地困擾案例，建議遷移到雲端數據庫
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 連接狀態 */}
        <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
            <span className="text-white text-sm">Supabase 連接狀態</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={isConnected ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}>
              {isConnected ? "已連接" : "未連接"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkConnection}
              disabled={isLoading}
              className="text-blue-200 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {step === "check" && (
          <div className="space-y-4">
            <Alert className="border-blue-500/50 bg-blue-900/20">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-100">
                <div className="space-y-2">
                  <p>
                    <strong>遷移優勢：</strong>
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• 數據永久保存，不會因清除瀏覽器而丟失</li>
                    <li>• 支援多設備同步訪問</li>
                    <li>• 更好的性能和穩定性</li>
                    <li>• 支援更多用戶同時使用</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={startMigration}
                disabled={!isConnected || isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                開始遷移
              </Button>
              <Button
                variant="outline"
                onClick={skipMigration}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                暫時跳過
              </Button>
            </div>
          </div>
        )}

        {step === "migrate" && (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
              <p className="text-white">正在遷移數據...</p>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-slate-300 text-center">請稍候，正在將 {localDataCount} 個案例遷移到雲端</p>
          </div>
        )}

        {step === "complete" && migrationResult && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">遷移完成！</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                <div className="text-2xl font-bold text-green-400">{migrationResult.success}</div>
                <div className="text-sm text-green-200">成功遷移</div>
              </div>
              <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                <div className="text-2xl font-bold text-red-400">{migrationResult.failed}</div>
                <div className="text-sm text-red-200">遷移失敗</div>
              </div>
            </div>

            {migrationResult.errors.length > 0 && (
              <Alert className="border-yellow-500/50 bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-100">
                  <details>
                    <summary className="cursor-pointer">查看錯誤詳情</summary>
                    <div className="mt-2 text-xs space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  </details>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={clearLocalData}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除本地數據並完成
              </Button>
              <Button
                variant="outline"
                onClick={onComplete}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                保留本地數據
              </Button>
            </div>
          </div>
        )}

        {step === "error" && migrationResult && (
          <div className="space-y-4">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">遷移失敗</h3>
            </div>

            <Alert className="border-red-500/50 bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-100">
                <div className="space-y-2">
                  <p>遷移過程中遇到問題：</p>
                  <div className="text-xs space-y-1 ml-4">
                    {migrationResult.errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={startMigration}
                disabled={!isConnected}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重試遷移
              </Button>
              <Button
                variant="outline"
                onClick={skipMigration}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                跳過遷移
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
