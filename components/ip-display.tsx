"use client"

import { useEffect, useState } from "react"
import { Globe } from "lucide-react"

interface IpDisplayProps {
  mobileSimplified?: boolean
}

export default function IpDisplay({ mobileSimplified = false }: IpDisplayProps) {
  const [ip, setIp] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIp = async () => {
      try {
        // 使用 ipify API 來獲取客戶端IP
        const response = await fetch("https://api.ipify.org?format=json")
        const data = await response.json()
        setIp(data.ip)
      } catch (error) {
        console.error("無法獲取IP地址:", error)
        setIp("未知")
      } finally {
        setLoading(false)
      }
    }

    fetchIp()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-md border border-blue-800/30 ${mobileSimplified ? 'text-xs' : ''}`}>
        <Globe className={`${mobileSimplified ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-blue-300`} />
        <span className="text-xs text-blue-200">載入中...</span>
      </div>
    )
  }

  // 手機版簡化顯示
  if (mobileSimplified) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800/50 rounded border border-blue-800/30 backdrop-blur-sm">
        <Globe className="w-2.5 h-2.5 text-blue-300" />
        <span className="text-xs text-blue-200 font-mono">{ip.split('.').slice(0, 2).join('.')}...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-md border border-blue-800/30 backdrop-blur-sm">
      <Globe className="w-3 h-3 text-blue-300" />
      <span className="text-xs text-blue-200 font-mono">{ip}</span>
    </div>
  )
} 