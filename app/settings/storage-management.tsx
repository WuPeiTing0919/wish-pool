"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Cloud, Trash2, RefreshCw, CheckCircle, AlertTriangle, HardDrive } from "lucide-react"
import { StorageHealthService } from "@/lib/supabase-service-updated"

export default function StorageManagement() {
  const [storageHealth, setStorageHealth] = useState<{
    healthy: boolean
    stats?: { totalFiles: number; totalSize: number }
    error?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<{ cleaned: number; error?: string } | null>(null)

  useEffect(() => {
    checkStorageHealth()
  }, [])

  const checkStorageHealth = async () => {
    setIsLoading(true)
    try {
      const health = await StorageHealthService.checkStorageHealth()
      setStorageHealth(health)
    } catch (error) {
      setStorageHealth({ healthy: false, error: `檢查失敗: ${error}` })
    } finally {
      setIsLoading(false)
    }
  }

  const cleanupOrphanedImages = async () => {
    if (!confirm("確定要清理孤立的圖片嗎？這將刪除沒有被任何困擾案例引用的圖片。")) {
      return
    }

    setIsLoading(true)
    try {
      const result = await StorageHealthService.cleanupOrphanedImages()
      setCleanupResult(result)
      // 重新檢查存儲狀態
      await checkStorageHealth()
    } catch (error) {
      setCleanupResult({ cleaned: 0, error: `清理失敗: ${error}` })
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* 存儲狀態 */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Cloud className="w-6 h-6 text-blue-400" />
            Supabase Storage 狀態
          </CardTitle>
          <CardDescription className="text-blue-200">雲端圖片存儲服務狀態和使用情況</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  storageHealth?.healthy ? "bg-green-400" : "bg-red-400"
                } ${isLoading ? "animate-pulse" : ""}`}
              ></div>
              <span className="text-white">存儲服務狀態</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={storageHealth?.healthy ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}
              >
                {isLoading ? "檢查中..." : storageHealth?.healthy ? "正常運行" : "服務異常"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkStorageHealth}
                disabled={isLoading}
                className="text-blue-200 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* 存儲統計 */}
          {storageHealth?.stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-white mb-1">{storageHealth.stats.totalFiles}</div>
                <div className="text-sm text-slate-300">圖片檔案</div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatFileSize(storageHealth.stats.totalSize)}
                </div>
                <div className="text-sm text-slate-300">總使用空間</div>
              </div>
            </div>
          )}

          {/* 存儲使用進度條 */}
          {storageHealth?.stats && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">存儲使用量</span>
                <span className="text-slate-400">{formatFileSize(storageHealth.stats.totalSize)} / 1GB (免費額度)</span>
              </div>
              <Progress
                value={Math.min((storageHealth.stats.totalSize / (1024 * 1024 * 1024)) * 100, 100)}
                className="w-full"
              />
            </div>
          )}

          {/* 錯誤訊息 */}
          {storageHealth?.error && (
            <Alert className="border-red-500/50 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-100">
                <div className="space-y-1">
                  <p>存儲服務檢查失敗：</p>
                  <p className="text-sm">{storageHealth.error}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 存儲管理 */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-purple-400" />
            存儲管理
          </CardTitle>
          <CardDescription className="text-blue-200">管理和優化雲端圖片存儲</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-orange-400" />
              清理孤立圖片
            </h4>
            <p className="text-slate-300 text-sm mb-3">清理沒有被任何困擾案例引用的圖片檔案，釋放存儲空間。</p>
            <Button
              onClick={cleanupOrphanedImages}
              disabled={isLoading || !storageHealth?.healthy}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? "清理中..." : "開始清理"}
            </Button>
          </div>

          {/* 清理結果 */}
          {cleanupResult && (
            <Alert
              className={`${
                cleanupResult.error ? "border-red-500/50 bg-red-900/20" : "border-green-500/50 bg-green-900/20"
              }`}
            >
              {cleanupResult.error ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-400" />
              )}
              <AlertDescription className={cleanupResult.error ? "text-red-100" : "text-green-100"}>
                {cleanupResult.error ? (
                  <div>
                    <p>清理過程中發生錯誤：</p>
                    <p className="text-sm mt-1">{cleanupResult.error}</p>
                  </div>
                ) : (
                  <div>
                    <p>清理完成！</p>
                    <p className="text-sm mt-1">
                      {cleanupResult.cleaned > 0
                        ? `成功清理了 ${cleanupResult.cleaned} 個孤立的圖片檔案`
                        : "沒有發現需要清理的孤立圖片"}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 存儲最佳實踐 */}
          <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <h4 className="text-blue-200 font-semibold mb-2">💡 存儲最佳實踐</h4>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• 定期清理孤立圖片以節省存儲空間</li>
              <li>• 上傳前壓縮大圖片以減少存儲使用量</li>
              <li>• 避免上傳重複的圖片內容</li>
              <li>• 使用適當的圖片格式（WebP 通常最優）</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
