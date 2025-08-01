"use client"

import { useEffect, useState } from "react"
import { Globe, Shield, ShieldAlert } from "lucide-react"

interface IpDisplayProps {
  mobileSimplified?: boolean
}

interface IpInfo {
  ip: string
  isAllowed: boolean
  enableIpWhitelist: boolean
  allowedIps: string[]
  timestamp: string
}

export default function IpDisplay({ mobileSimplified = false }: IpDisplayProps) {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIpInfo = async () => {
      try {
        const response = await fetch('/api/ip')
        if (!response.ok) {
          throw new Error('無法獲取IP信息')
        }
        const data = await response.json()
        setIpInfo(data)
      } catch (error) {
        console.error("無法獲取IP信息:", error)
        setError("無法獲取IP信息")
      } finally {
        setLoading(false)
      }
    }

    fetchIpInfo()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-md border border-blue-800/30 ${mobileSimplified ? 'text-xs' : ''}`}>
        <Globe className={`${mobileSimplified ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-blue-300`} />
        <span className="text-xs text-blue-200">載入中...</span>
      </div>
    )
  }

  if (error || !ipInfo) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 bg-red-900/50 rounded-md border border-red-800/30 ${mobileSimplified ? 'text-xs' : ''}`}>
        <Globe className={`${mobileSimplified ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-red-300`} />
        <span className="text-xs text-red-200">錯誤</span>
      </div>
    )
  }

  // 手機版簡化顯示
  if (mobileSimplified) {
    return (
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border backdrop-blur-sm ${
        ipInfo.enableIpWhitelist && !ipInfo.isAllowed 
          ? 'bg-red-900/50 border-red-800/30' 
          : 'bg-slate-800/50 border-blue-800/30'
      }`}>
        {ipInfo.enableIpWhitelist && !ipInfo.isAllowed ? (
          <ShieldAlert className="w-2.5 h-2.5 text-red-300" />
        ) : (
          <Shield className="w-2.5 h-2.5 text-green-300" />
        )}
        <span className="text-xs font-mono text-blue-200">
          {ipInfo.ip.split('.').slice(0, 2).join('.')}...
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border backdrop-blur-sm ${
      ipInfo.enableIpWhitelist && !ipInfo.isAllowed 
        ? 'bg-red-900/50 border-red-800/30' 
        : 'bg-slate-800/50 border-blue-800/30'
    }`}>
      {ipInfo.enableIpWhitelist && !ipInfo.isAllowed ? (
        <ShieldAlert className="w-3 h-3 text-red-300" />
      ) : (
        <Shield className="w-3 h-3 text-green-300" />
      )}
      <span className="text-xs text-blue-200 font-mono">{ipInfo.ip}</span>
      {ipInfo.enableIpWhitelist && (
        <span className={`text-xs px-1 py-0.5 rounded ${
          ipInfo.isAllowed 
            ? 'bg-green-900/50 text-green-200' 
            : 'bg-red-900/50 text-red-200'
        }`}>
          {ipInfo.isAllowed ? '允許' : '拒絕'}
        </span>
      )}
    </div>
  )
} 