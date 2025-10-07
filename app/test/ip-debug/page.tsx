"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface IpDebugInfo {
  ip: string
  isAllowed: boolean
  enableIpWhitelist: boolean
  allowedIps: string[]
  timestamp: string
  debug?: {
    allIpSources?: Record<string, string | null>
    allFoundIps?: string[]
    isLocalDevelopment?: boolean
    localIp?: string | null
    environment?: string
    host?: string
    referer?: string
    userAgent?: string
    originalDetectedIp?: string
    finalDetectedIp?: string
    rawDetectedIp?: string
    ipDetectionMethod?: string
  }
  ipv6Info?: {
    isIPv6Mapped: boolean
    originalFormat: string
    ipv6Format: string
    hasIPv6Support: boolean
  }
}

export default function IpDebugPage() {
  const [ipInfo, setIpInfo] = useState<IpDebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIpInfo = async () => {
    setLoading(true)
    setError(null)
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

  useEffect(() => {
    fetchIpInfo()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>載入中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ipInfo) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              錯誤
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchIpInfo} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              重試
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">IP 檢測調試</h1>
        <Button onClick={fetchIpInfo} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 主要IP信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {ipInfo.enableIpWhitelist && !ipInfo.isAllowed ? (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                IP 被拒絕
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                IP 檢測正常
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">檢測到的IP</label>
              <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                {ipInfo.ip}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">狀態</label>
              <div className="mt-1">
                <Badge variant={ipInfo.isAllowed ? "default" : "destructive"}>
                  {ipInfo.isAllowed ? "允許" : "拒絕"}
                </Badge>
              </div>
            </div>
          </div>

          {ipInfo.enableIpWhitelist && (
            <div>
              <label className="text-sm font-medium text-gray-500">白名單狀態</label>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm">已啟用</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 詳細調試信息 */}
      {ipInfo.debug && (
        <Card>
          <CardHeader>
            <CardTitle>詳細調試信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">環境</label>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {ipInfo.debug.environment || '未知'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">檢測方法</label>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {ipInfo.debug.ipDetectionMethod || '未知'}
                </p>
              </div>
            </div>

            {ipInfo.debug.allFoundIps && ipInfo.debug.allFoundIps.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">所有檢測到的IP</label>
                <div className="mt-1 space-y-1">
                  {ipInfo.debug.allFoundIps.map((ip, index) => (
                    <div key={index} className="text-sm bg-gray-100 p-2 rounded font-mono">
                      {ip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ipInfo.debug.allIpSources && (
              <div>
                <label className="text-sm font-medium text-gray-500">所有IP來源</label>
                <div className="mt-1 space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(ipInfo.debug.allIpSources).map(([key, value]) => (
                    <div key={key} className="text-sm bg-gray-100 p-2 rounded">
                      <span className="font-medium">{key}:</span>
                      <span className="ml-2 font-mono">{value || 'null'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* IPv6信息 */}
      {ipInfo.ipv6Info && (
        <Card>
          <CardHeader>
            <CardTitle>IPv6 信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">IPv6映射</label>
                <Badge variant={ipInfo.ipv6Info.isIPv6Mapped ? "default" : "secondary"}>
                  {ipInfo.ipv6Info.isIPv6Mapped ? "是" : "否"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IPv6支援</label>
                <Badge variant={ipInfo.ipv6Info.hasIPv6Support ? "default" : "secondary"}>
                  {ipInfo.ipv6Info.hasIPv6Support ? "已啟用" : "未啟用"}
                </Badge>
              </div>
            </div>
            {ipInfo.ipv6Info.isIPv6Mapped && (
              <div>
                <label className="text-sm font-medium text-gray-500">IPv6格式</label>
                <p className="text-sm bg-gray-100 p-2 rounded font-mono">
                  {ipInfo.ipv6Info.ipv6Format}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 允許的IP列表 */}
      {ipInfo.enableIpWhitelist && ipInfo.allowedIps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>允許的IP列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {ipInfo.allowedIps.map((ip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant={ip === ipInfo.ip ? "default" : "outline"}>
                    {ip === ipInfo.ip ? "當前" : ""}
                  </Badge>
                  <span className="text-sm font-mono">{ip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 建議 */}
      <Card>
        <CardHeader>
          <CardTitle>建議</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!ipInfo.enableIpWhitelist && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ IP白名單功能未啟用。如果您的IP檢測正常，建議啟用白名單功能以提高安全性。
              </p>
            </div>
          )}
          
          {ipInfo.enableIpWhitelist && !ipInfo.isAllowed && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                ❌ 您的IP不在允許列表中。請聯繫管理員將您的IP添加到白名單。
              </p>
            </div>
          )}

          {ipInfo.ip.startsWith('172.70.') && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                💡 檢測到Cloudflare代理IP。系統已優化處理此類代理IP，會嘗試獲取您的真實IP。
              </p>
            </div>
          )}

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✅ 如果IP檢測仍有問題，請檢查1Panel的反向代理配置，確保正確轉發客戶端IP頭部。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}