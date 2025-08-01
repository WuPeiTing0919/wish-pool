"use client"

import { useEffect, useState } from "react"
import IpDisplay from "@/components/ip-display"

interface IpInfo {
  ip: string
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

export default function TestIPv6Page() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIpInfo = async () => {
      try {
        const response = await fetch('/api/ip')
        if (response.ok) {
          const data = await response.json()
          setIpInfo(data)
        }
      } catch (error) {
        console.error("Error fetching IP info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchIpInfo()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          IPv6格式IPv4地址測試頁面
        </h1>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-800/30">
          <h2 className="text-xl font-semibold text-blue-200 mb-4">
            IP顯示組件測試
          </h2>
          
          <div className="mb-6">
            <h3 className="text-lg text-blue-300 mb-2">桌面版顯示:</h3>
            <IpDisplay />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg text-blue-300 mb-2">手機版顯示:</h3>
            <IpDisplay mobileSimplified />
          </div>
        </div>

        {loading ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-800/30 mt-6">
            <p className="text-blue-200">載入中...</p>
          </div>
        ) : ipInfo ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-800/30 mt-6">
            <h2 className="text-xl font-semibold text-blue-200 mb-4">
              原始API數據
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg text-blue-300 mb-2">基本信息:</h3>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                  <p className="text-white"><span className="text-blue-200">IPv4地址:</span> {ipInfo.ip}</p>
                  {ipInfo.ipv6Info && (
                    <>
                      <p className="text-white"><span className="text-blue-200">是否為IPv6映射:</span> {ipInfo.ipv6Info.isIPv6Mapped ? '是' : '否'}</p>
                      <p className="text-white"><span className="text-blue-200">原始格式:</span> {ipInfo.ipv6Info.originalFormat}</p>
                      <p className="text-white"><span className="text-blue-200">IPv6格式:</span> {ipInfo.ipv6Info.ipv6Format}</p>
                      <p className="text-white"><span className="text-blue-200">IPv6支援:</span> {ipInfo.ipv6Info.hasIPv6Support ? '已啟用' : '未啟用'}</p>
                    </>
                  )}
                </div>
              </div>

              {ipInfo.debug && (
                <div>
                  <h3 className="text-lg text-blue-300 mb-2">調試信息:</h3>
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <p className="text-white"><span className="text-blue-200">檢測方法:</span> {ipInfo.debug.ipDetectionMethod || '未知'}</p>
                    <p className="text-white"><span className="text-blue-200">原始檢測IP:</span> {ipInfo.debug.originalDetectedIp || '無'}</p>
                    <p className="text-white"><span className="text-blue-200">最終檢測IP:</span> {ipInfo.debug.finalDetectedIp || '無'}</p>
                    <p className="text-white"><span className="text-blue-200">原始檢測IP:</span> {ipInfo.debug.rawDetectedIp || '無'}</p>
                    
                    {ipInfo.debug.allFoundIps && ipInfo.debug.allFoundIps.length > 0 && (
                      <div className="mt-2">
                        <p className="text-blue-200">所有檢測到的IP:</p>
                        <ul className="list-disc list-inside text-yellow-300 ml-4">
                          {ipInfo.debug.allFoundIps.map((ip, index) => (
                            <li key={index}>{ip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-800/30 mt-6">
            <p className="text-red-200">無法獲取IP信息</p>
          </div>
        )}
      </div>
    </div>
  )
} 