"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Lock } from "lucide-react"

interface IpInfo {
  ip: string
  isAllowed: boolean
  enableIpWhitelist: boolean
  allowedIps: string[]
  timestamp: string
}

export default function IpBlockingTestPage() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
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
        <h1 className="text-3xl font-bold">IP 阻擋測試</h1>
        <Button onClick={fetchIpInfo} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* IP狀態卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {ipInfo.enableIpWhitelist && !ipInfo.isAllowed ? (
              <>
                <Lock className="w-5 h-5 text-red-500" />
                IP 被阻擋
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                IP 允許訪問
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
              <label className="text-sm font-medium text-gray-500">訪問狀態</label>
              <div className="mt-1">
                <Badge variant={ipInfo.isAllowed ? "default" : "destructive"}>
                  {ipInfo.isAllowed ? "允許" : "阻擋"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">白名單狀態</label>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm">
                {ipInfo.enableIpWhitelist ? "已啟用" : "未啟用"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* 阻擋測試說明 */}
      <Card>
        <CardHeader>
          <CardTitle>IP 阻擋測試說明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">✅ 如果你能看到這個頁面</h3>
            <p className="text-sm text-blue-800">
              說明你的IP ({ipInfo.ip}) 在白名單中，可以正常訪問網站。
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">⚠️ 測試阻擋功能</h3>
            <p className="text-sm text-yellow-800">
              要測試IP阻擋功能，可以：
            </p>
            <ul className="text-sm text-yellow-800 mt-2 ml-4 list-disc">
              <li>暫時從 .env.local 的 ALLOWED_IPS 中移除你的IP</li>
              <li>重啟應用後訪問網站</li>
              <li>應該會看到403禁止訪問頁面</li>
              <li>記得測試完成後將IP加回白名單</li>
            </ul>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">🚫 被阻擋的訪問</h3>
            <p className="text-sm text-red-800">
              如果IP不在白名單中，訪問者會看到：
            </p>
            <ul className="text-sm text-red-800 mt-2 ml-4 list-disc">
              <li>403 Forbidden 錯誤頁面</li>
              <li>顯示被阻擋的IP地址</li>
              <li>無法訪問任何網頁內容</li>
              <li>只有IP檢測API可以訪問</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 當前配置 */}
      <Card>
        <CardHeader>
          <CardTitle>當前配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">白名單狀態:</span>
            <Badge variant={ipInfo.enableIpWhitelist ? "default" : "secondary"}>
              {ipInfo.enableIpWhitelist ? "已啟用" : "未啟用"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">當前IP:</span>
            <span className="text-sm font-mono">{ipInfo.ip}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">訪問權限:</span>
            <Badge variant={ipInfo.isAllowed ? "default" : "destructive"}>
              {ipInfo.isAllowed ? "允許" : "阻擋"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
