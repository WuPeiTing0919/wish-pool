"use client"

import { useEffect, useRef } from "react"

interface CategoryData {
  name: string
  count: number
  percentage: number
  color: string
  keywords: string[]
}

interface RadarChartProps {
  data: CategoryData[]
}

export default function RadarChart({ data }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 獲取容器尺寸
    const container = canvas.parentElement
    if (!container) return

    const containerRect = container.getBoundingClientRect()

    // 設置 canvas 尺寸 - 確保正方形比例
    const size = Math.min(containerRect.width, containerRect.height)
    canvas.width = size * window.devicePixelRatio
    canvas.height = size * window.devicePixelRatio
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const centerX = size / 2
    const centerY = size / 2
    // 调整边距到合理范围，既保证文字显示又不让图表太小
    const radius = Math.min(centerX, centerY) - 80

    // 清除畫布
    ctx.clearRect(0, 0, size, size)

    // 過濾有數據的分類
    const activeData = data.filter((item) => item.count > 0)
    if (activeData.length === 0) {
      // 顯示無數據提示
      ctx.fillStyle = "#94A3B8"
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("暫無數據", centerX, centerY)
      return
    }

    const angleStep = (2 * Math.PI) / activeData.length
    const maxValue = Math.max(...activeData.map((item) => item.count))

    // 繪製背景網格
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1

    // 繪製同心圓
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // 繪製軸線
    activeData.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    })

    // 繪製數據區域
    ctx.beginPath()
    activeData.forEach((item, index) => {
      const angle = index * angleStep - Math.PI / 2
      const value = (item.count / maxValue) * radius
      const x = centerX + Math.cos(angle) * value
      const y = centerY + Math.sin(angle) * value

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()

    // 填充區域
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
    ctx.fill()

    // 描邊
    ctx.strokeStyle = "#3B82F6"
    ctx.lineWidth = 2
    ctx.stroke()

    // 繪製數據點
    activeData.forEach((item, index) => {
      const angle = index * angleStep - Math.PI / 2
      const value = (item.count / maxValue) * radius
      const x = centerX + Math.cos(angle) * value
      const y = centerY + Math.sin(angle) * value

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = item.color
      ctx.fill()
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // 繪製標籤 - 调整为合适的文字大小
    ctx.fillStyle = "#E2E8F0"
    const fontSize = Math.max(10, Math.min(14, size / 32)) // 适当增大字体提高可读性
    ctx.font = `${fontSize}px sans-serif`

    activeData.forEach((item, index) => {
      const angle = index * angleStep - Math.PI / 2
      // 增加标签距离确保文字不被遮住
      const labelRadius = radius + 40
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius

      // 更精確的文字對齊
      const cosAngle = Math.cos(angle)
      const sinAngle = Math.sin(angle)
      
      if (cosAngle < -0.3) {
        ctx.textAlign = "right"
      } else if (cosAngle > 0.3) {
        ctx.textAlign = "left"
      } else {
        ctx.textAlign = "center"
      }

      // 垂直對齊調整
      let textY = y
      if (sinAngle < -0.3) {
        // 上方文字，向下偏移一點
        textY = y + fontSize / 3
      } else if (sinAngle > 0.3) {
        // 下方文字，向上偏移一點
        textY = y - fontSize / 3
      }

      // 繪製分類名稱
      ctx.fillText(item.name, x, textY)
      // 繪製數量，減少行間距
      ctx.fillText(`${item.count}`, x, textY + fontSize + 3)
    })
  }, [data])

  // 監聽窗口大小變化
  useEffect(() => {
    const handleResize = () => {
      // 觸發重繪
      const canvas = canvasRef.current
      if (canvas) {
        const event = new Event("resize")
        window.dispatchEvent(event)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{
          width: "auto",
          height: "auto",
          aspectRatio: "1 / 1", // 確保正方形比例
        }}
      />
    </div>
  )
}
