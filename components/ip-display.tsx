"use client"

import { useEffect, useState } from "react"
import { Globe, Shield, ShieldAlert, Info } from "lucide-react"

interface IpDisplayProps {
  mobileSimplified?: boolean
}

interface IpInfo {
  ip: string
  isAllowed: boolean
  enableIpWhitelist: boolean
  allowedIps: string[]
  timestamp: string
  ipv6Info?: {
    isIPv6Mapped: boolean
    originalFormat: string
    ipv6Format: string
    hasIPv6Support: boolean
  }
  debug?: {
    originalDetectedIp?: string
    finalDetectedIp?: string
    rawDetectedIp?: string
    allFoundIps?: string[]
    ipDetectionMethod?: string
  }
}

// 清理IP地址，確保顯示IPv4格式
function cleanIpForDisplay(ip: string): string {
  if (!ip) return '127.0.0.1';
  
  // 移除空白字符
  ip = ip.trim();
  
  // 處理IPv6格式的IPv4地址 (例如: ::ffff:192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  // 處理純IPv6本地回環地址
  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  // 驗證是否為有效的IPv4地址
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) {
    return ip;
  }
  
  // 如果不是有效的IPv4，返回默認值
  return '127.0.0.1';
}

// 檢查是否為IPv6格式的IPv4地址
function isIPv6MappedIPv4(ip: string): boolean {
  return ip.startsWith('::ffff:');
}

// 獲取IPv6格式的IPv4地址
function getIPv6MappedFormat(ipv4: string): string {
  return `::ffff:${ipv4}`;
}

export default function IpDisplay({ mobileSimplified = false }: IpDisplayProps) {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showIPv6Format, setShowIPv6Format] = useState(false)

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

  // 清理IP地址確保顯示IPv4格式
  const displayIp = cleanIpForDisplay(ipInfo.ip);
  
  // 使用API返回的IPv6信息，如果沒有則回退到本地檢測
  const isIPv6Mapped = ipInfo.ipv6Info?.isIPv6Mapped || isIPv6MappedIPv4(ipInfo.debug?.originalDetectedIp || ipInfo.ip);
  const ipv6Format = ipInfo.ipv6Info?.ipv6Format || getIPv6MappedFormat(displayIp);
  const originalFormat = ipInfo.ipv6Info?.originalFormat || ipInfo.debug?.originalDetectedIp || ipInfo.ip;

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
          {isIPv6Mapped ? 'IPv6' : 'IPv4'}: {displayIp.split('.').slice(0, 2).join('.')}...
        </span>
      </div>
    )
  }

  return (
    <div className="relative group">
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
        
        <div className="flex flex-col">
          <span className="text-xs text-blue-200 font-mono">
            {isIPv6Mapped ? 'IPv6' : 'IPv4'}: {displayIp}
          </span>
          {isIPv6Mapped && (
            <span className="text-xs text-cyan-300 font-mono">
              {ipv6Format}
            </span>
          )}
        </div>
        
        {ipInfo.enableIpWhitelist && (
          <span className={`text-xs px-1 py-0.5 rounded ${
            ipInfo.isAllowed 
              ? 'bg-green-900/50 text-green-200' 
              : 'bg-red-900/50 text-red-200'
          }`}>
            {ipInfo.isAllowed ? '允許' : '拒絕'}
          </span>
        )}
        
        {/* IPv6格式切換按鈕 */}
        <button
          onClick={() => setShowIPv6Format(!showIPv6Format)}
          className="ml-1 p-0.5 rounded hover:bg-blue-800/30 transition-colors"
          title="切換IPv6格式顯示"
        >
          <Info className="w-3 h-3 text-blue-300" />
        </button>
      </div>
      
      {/* 詳細信息彈出框 */}
      {showIPv6Format && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-slate-800/95 border border-blue-800/50 rounded-md shadow-lg backdrop-blur-sm z-50 min-w-64">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-200">IPv4格式:</span>
              <span className="text-white font-mono">{displayIp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-200">IPv6格式:</span>
              <span className="text-cyan-300 font-mono">{ipv6Format}</span>
            </div>
            {originalFormat && originalFormat !== displayIp && (
              <div className="flex justify-between">
                <span className="text-blue-200">原始格式:</span>
                <span className="text-yellow-300 font-mono">{originalFormat}</span>
              </div>
            )}
            {ipInfo.debug?.ipDetectionMethod && (
              <div className="flex justify-between">
                <span className="text-blue-200">檢測方法:</span>
                <span className="text-green-300 font-mono">{ipInfo.debug.ipDetectionMethod}</span>
              </div>
            )}
            {ipInfo.debug?.allFoundIps && ipInfo.debug.allFoundIps.length > 0 && (
              <div className="mt-2 pt-1 border-t border-blue-800/30">
                <span className="text-blue-200">所有檢測到的IP:</span>
                <div className="mt-1 space-y-0.5">
                  {ipInfo.debug.allFoundIps.map((ip, index) => (
                    <div key={index} className="text-yellow-300 font-mono text-xs">
                      {ip}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {ipInfo.ipv6Info?.hasIPv6Support && (
              <div className="mt-2 pt-1 border-t border-blue-800/30">
                <span className="text-green-300">✓ IPv6支援已啟用</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 