"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, X, AlertCircle, Eye, RotateCcw, FileImage, Cloud, Loader2 } from "lucide-react"
import {
  SupabaseImageService,
  ImageCompressionService,
  type SupabaseImageFile,
  type BatchUploadResult,
} from "@/lib/supabase-image-utils"
import { soundManager } from "@/lib/sound-effects"

interface SupabaseImageUploadProps {
  images: SupabaseImageFile[]
  onImagesChange: (images: SupabaseImageFile[]) => void
  disabled?: boolean
  className?: string
  maxFiles?: number
}

export default function SupabaseImageUpload({
  images,
  onImagesChange,
  disabled = false,
  className = "",
  maxFiles = 10,
}: SupabaseImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [uploadStats, setUploadStats] = useState<{ total: 0; completed: 0; failed: 0 }>({
    total: 0,
    completed: 0,
    failed: 0,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (disabled) return

      setUploading(true)
      setErrors([])
      setUploadProgress(0)

      const fileArray = Array.from(files)
      const remainingSlots = maxFiles - images.length

      if (fileArray.length > remainingSlots) {
        setErrors([`最多只能再上傳 ${remainingSlots} 張圖片`])
        setUploading(false)
        return
      }

      try {
        // 初始化統計
        setUploadStats({ total: fileArray.length, completed: 0, failed: 0 })

        // 先壓縮圖片
        setUploadProgress(10)
        const compressedFiles = await ImageCompressionService.compressImages(fileArray)
        setUploadProgress(20)

        // 批量上傳到 Supabase Storage
        const uploadResult: BatchUploadResult = await SupabaseImageService.uploadImages(compressedFiles)

        // 更新統計
        setUploadStats({
          total: uploadResult.total,
          completed: uploadResult.successful.length,
          failed: uploadResult.failed.length,
        })

        // 處理上傳結果
        if (uploadResult.successful.length > 0) {
          onImagesChange([...images, ...uploadResult.successful])
          await soundManager.play("success")
        }

        // 處理錯誤
        if (uploadResult.failed.length > 0) {
          const errorMessages = uploadResult.failed.map((failure) => `${failure.file.name}: ${failure.error}`)
          setErrors(errorMessages)
        }

        setUploadProgress(100)
      } catch (error) {
        console.error("Upload process error:", error)
        setErrors([`上傳過程中發生錯誤: ${error}`])
      } finally {
        setTimeout(() => {
          setUploading(false)
          setUploadProgress(0)
          setUploadStats({ total: 0, completed: 0, failed: 0 })
        }, 2000)
      }
    },
    [images, onImagesChange, disabled, maxFiles],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
      e.target.value = ""
    },
    [handleFiles],
  )

  const removeImage = useCallback(
    async (imageId: string) => {
      const imageToRemove = images.find((img) => img.id === imageId)
      if (imageToRemove) {
        // 從 Supabase Storage 刪除圖片
        const deleteResult = await SupabaseImageService.deleteImage(imageToRemove.storage_path)
        if (!deleteResult.success) {
          console.warn("Failed to delete image from storage:", deleteResult.error)
          // 即使刪除失敗，也從列表中移除（避免阻塞用戶操作）
        }

        onImagesChange(images.filter((img) => img.id !== imageId))
        await soundManager.play("click")
      }
    },
    [images, onImagesChange],
  )

  const clearAllImages = useCallback(async () => {
    if (images.length === 0) return

    const storagePaths = images.map((img) => img.storage_path)
    const deleteResult = await SupabaseImageService.deleteImages(storagePaths)

    if (!deleteResult.success) {
      console.warn("Failed to delete some images from storage:", deleteResult.error)
    }

    onImagesChange([])
    setErrors([])
    await soundManager.play("click")
  }, [images, onImagesChange])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上傳區域 */}
      <Card
        className={`
          relative overflow-hidden transition-all duration-200 cursor-pointer
          ${
            dragActive
              ? "border-cyan-400 bg-cyan-500/10 scale-[1.02]"
              : "border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/40"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <CardContent className="p-6 md:p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className={`
              w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
              ${dragActive ? "bg-cyan-500/20 text-cyan-300 scale-110" : "bg-slate-600/50 text-slate-300"}
            `}
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <div className="relative">
                  <Upload className="w-8 h-8" />
                  <Cloud className="w-4 h-4 absolute -bottom-1 -right-1 text-blue-400" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {uploading ? "正在上傳到雲端..." : dragActive ? "放開以上傳圖片" : "上傳相關圖片到雲端"}
              </h3>
              <p className="text-sm text-slate-300">
                {uploading ? "圖片將安全存儲在 Supabase 雲端" : "拖拽圖片到此處或點擊選擇檔案"}
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                  <Cloud className="w-3 h-3 mr-1" />
                  雲端存儲
                </Badge>
                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                  支援 JPG、PNG、WebP、GIF
                </Badge>
                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                  單檔最大 5MB
                </Badge>
                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                  最多 {maxFiles} 張
                </Badge>
              </div>
            </div>
          </div>

          {/* 上傳進度 */}
          {uploading && (
            <div className="mt-6 space-y-3">
              <Progress value={uploadProgress} className="w-full" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>
                  {uploadStats.completed}/{uploadStats.total} 完成
                </span>
                <span>{uploadProgress}%</span>
              </div>
              {uploadStats.failed > 0 && (
                <div className="text-xs text-red-400">{uploadStats.failed} 個檔案上傳失敗</div>
              )}
            </div>
          )}
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || uploading}
        />
      </Card>

      {/* 錯誤訊息 */}
      {errors.length > 0 && (
        <Alert className="border-red-500/50 bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-100">
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="text-sm">
                  • {error}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 已上傳的圖片 */}
      {images.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-white">
                  雲端圖片 ({images.length}/{maxFiles})
                </h4>
                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs px-2 py-1">
                  <Cloud className="w-3 h-3 mr-1" />
                  Supabase
                </Badge>
              </div>
              {images.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllImages}
                  disabled={uploading}
                  className="text-red-300 hover:text-red-200 hover:bg-red-900/20"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  清空全部
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/50">
                    <img
                      src={image.public_url || "/placeholder.svg"}
                      alt={image.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=200&text=圖片載入失敗"
                      }}
                    />

                    {/* 懸停覆蓋層 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 p-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(image.public_url, "_blank")
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-300 hover:text-red-200 hover:bg-red-900/20 p-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(image.id)
                        }}
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 雲端標識 */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Badge className="bg-blue-500/80 text-white text-xs px-1.5 py-0.5">
                        <Cloud className="w-3 h-3" />
                      </Badge>
                    </div>
                  </div>

                  {/* 檔案資訊 */}
                  <div className="mt-2 text-xs text-slate-400 truncate">
                    <div className="font-medium text-slate-300 truncate" title={image.name}>
                      {image.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{formatFileSize(image.size)}</span>
                      <span className="text-blue-400">雲端</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
