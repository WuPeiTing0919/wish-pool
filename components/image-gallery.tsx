"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react"
import { formatFileSize, type ImageFile } from "@/lib/image-utils"

interface ImageGalleryProps {
  images: ImageFile[]
  className?: string
}

interface ImageModalProps {
  images: ImageFile[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

function ImageModal({ images, currentIndex, onClose, onNavigate }: ImageModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const currentImage = images[currentIndex]

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    onNavigate(newIndex)
    setZoom(1)
    setRotation(0)
  }

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
    setZoom(1)
    setRotation(0)
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  const handleDownload = () => {
    // 創建下載連結
    const link = document.createElement("a")
    link.href = currentImage.url
    link.download = currentImage.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      {/* 關閉按鈕 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* 工具列 */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Badge className="bg-black/50 text-white border-white/20">
          {currentIndex + 1} / {images.length}
        </Badge>
        <div className="flex items-center gap-1 bg-black/50 rounded-lg p-1">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-white hover:bg-white/20 p-2">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-white hover:bg-white/20 p-2">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRotate} className="text-white hover:bg-white/20 p-2">
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-white/20 p-2">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 導航按鈕 */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* 圖片容器 */}
      <div className="flex items-center justify-center w-full h-full p-16">
        <img
          src={currentImage.url || "/placeholder.svg"}
          alt={currentImage.name}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          onError={(e) => {
            // 如果圖片載入失敗，顯示錯誤訊息
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=400&width=400&text=圖片載入失敗"
          }}
        />
      </div>

      {/* 圖片資訊 */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="bg-black/50 backdrop-blur-sm border-white/20">
          <CardContent className="p-3">
            <div className="text-white text-sm">
              <div className="font-medium truncate">{currentImage.name}</div>
              <div className="text-white/70 text-xs mt-1">
                {formatFileSize(currentImage.size)} • {currentImage.type}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ImageGallery({ images, className = "" }: ImageGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (images.length === 0) return null

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30">
            📷 相關圖片 ({images.length})
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={image.id} className="relative group cursor-pointer" onClick={() => openModal(index)}>
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-200">
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
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Maximize2 className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs">點擊放大</div>
                  </div>
                </div>
              </div>

              {/* 檔案名稱 */}
              <div className="mt-1 text-xs text-slate-400 truncate" title={image.name}>
                {image.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 圖片模態框 */}
      {modalOpen && (
        <ImageModal
          images={images}
          currentIndex={currentImageIndex}
          onClose={closeModal}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </>
  )
}
