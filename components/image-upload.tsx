"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, AlertCircle, Eye, RotateCcw, FileImage } from "lucide-react"
import {
  validateImageFile,
  createImageFile,
  revokeImageUrl,
  formatFileSize,
  compressImage,
  MAX_FILES_PER_UPLOAD,
  MAX_TOTAL_FILES,
  MAX_FILE_SIZE,
  type ImageFile,
} from "@/lib/image-utils"
import { soundManager } from "@/lib/sound-effects"

interface ImageUploadProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  disabled?: boolean
  className?: string
}

export default function ImageUpload({ images, onImagesChange, disabled = false, className = "" }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (disabled) return

      setUploading(true)
      setErrors([])

      const newErrors: string[] = []
      const validFiles: File[] = []

      // 檢查總數量限制
      if (images.length + files.length > MAX_TOTAL_FILES) {
        newErrors.push(`最多只能上傳 ${MAX_TOTAL_FILES} 張圖片`)
        setErrors(newErrors)
        setUploading(false)
        return
      }

      // 檢查單次上傳數量
      if (files.length > MAX_FILES_PER_UPLOAD) {
        newErrors.push(`單次最多只能上傳 ${MAX_FILES_PER_UPLOAD} 張圖片`)
      }

      // 驗證每個檔案
      const filesToProcess = Array.from(files).slice(0, MAX_FILES_PER_UPLOAD)

      for (const file of filesToProcess) {
        const validation = validateImageFile(file)
        if (validation.isValid) {
          validFiles.push(file)
        } else {
          newErrors.push(`${file.name}: ${validation.error}`)
        }
      }

      if (newErrors.length > 0) {
        setErrors(newErrors)
      }

      if (validFiles.length > 0) {
        try {
          // 壓縮並創建圖片物件
          const newImageFiles: ImageFile[] = []

          for (const file of validFiles) {
            let processedFile = file

            // 如果檔案過大，嘗試壓縮
            if (file.size > MAX_FILE_SIZE * 0.8) {
              try {
                processedFile = await compressImage(file, 1920, 0.8)
              } catch (error) {
                console.warn("圖片壓縮失敗，使用原檔案:", error)
              }
            }

            // 轉換為 base64 格式
            const imageFile = await createImageFile(processedFile)
            newImageFiles.push(imageFile)
          }

          onImagesChange([...images, ...newImageFiles])
          await soundManager.play("success")
        } catch (error) {
          newErrors.push("圖片處理失敗，請重試")
          setErrors(newErrors)
        }
      }

      setUploading(false)
    },
    [images, onImagesChange, disabled],
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
      // 清空 input 值，允許重複選擇相同檔案
      e.target.value = ""
    },
    [handleFiles],
  )

  const removeImage = useCallback(
    async (imageId: string) => {
      const imageToRemove = images.find((img) => img.id === imageId)
      if (imageToRemove) {
        revokeImageUrl(imageToRemove)
        onImagesChange(images.filter((img) => img.id !== imageId))
        await soundManager.play("click")
      }
    },
    [images, onImagesChange],
  )

  const clearAllImages = useCallback(async () => {
    images.forEach(revokeImageUrl)
    onImagesChange([])
    setErrors([])
    await soundManager.play("click")
  }, [images, onImagesChange])

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
        onClick={() => !disabled && fileInputRef.current?.click()}
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
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">{dragActive ? "放開以上傳圖片" : "上傳相關圖片"}</h3>
              <p className="text-sm text-slate-300">{uploading ? "正在處理圖片..." : "拖拽圖片到此處或點擊選擇檔案"}</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                  支援 JPG、PNG、WebP、GIF
                </Badge>
                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                  單檔最大 5MB
                </Badge>
                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                  最多 {MAX_TOTAL_FILES} 張
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
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
                  已上傳圖片 ({images.length}/{MAX_TOTAL_FILES})
                </h4>
              </div>
              {images.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllImages}
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
                      src={image.url || "/placeholder.svg"}
                      alt={image.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        // 如果圖片載入失敗，顯示預設圖片
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
                          // 在新視窗中開啟圖片
                          window.open(image.url, "_blank")
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
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 檔案資訊 */}
                  <div className="mt-2 text-xs text-slate-400 truncate">
                    <div className="font-medium text-slate-300 truncate" title={image.name}>
                      {image.name}
                    </div>
                    <div>{formatFileSize(image.size)}</div>
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
