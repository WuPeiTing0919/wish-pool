"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Info, Cloud, Server } from "lucide-react"

interface DiagnosticData {
  timestamp: string
  environment: string
  url: string
  ipAnalysis: {
    xForwardedFor: string | null
    xRealIp: string | null
    xClientIp: string | null
    cfConnectingIp: string | null
    forwarded: string | null
    xOriginalForwardedFor: string | null
    analysis: {
      hasCloudflare: boolean
      hasXForwardedFor: boolean
      hasXRealIp: boolean
      hasForwarded: boolean
      recommendedIpSource: string
      recommendedIp: string
    }
  }
  isCloudflare: {
    hasCfConnectingIp: boolean
    hasCfRay: boolean
    hasCfVisitor: boolean
    hasCfIpCountry: boolean
    cfRay: string | null
    cfCountry: string | null
    cfVisitor: string | null
  }
  proxyInfo: {
    hasNginxProxy: boolean
    has1Panel: boolean
    nginxProxyIp: string | null
    panelClientIp: string | null
  }
  ipChain: {
    xForwardedForChain: string[]
    recommendedClientIp: string
  }
  ipHeaders: Record<string, string | null>
  otherHeaders: Record<string, string | null>
  allHeaders: Record<string, string>
  recommendations: {
    primaryIpSource: string
    primaryIp: string
    isCloudflareSetup: boolean
    isProxySetup: boolean
    suggestedConfig: string[]
  }
}

export default function IpDiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiagnosticData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/ip-diagnostic')
      if (!response.ok) {
        throw new Error('無法獲取診斷數據')
      }
      const data = await response.json()
      setDiagnosticData(data)
    } catch (error) {
      console.error("無法獲取診斷數據:", error)
      setError("無法獲取診斷數據")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnosticData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>載入診斷數據中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !diagnosticData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              診斷失敗
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDiagnosticData} className="mt-4">
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
        <h1 className="text-3xl font-bold">IP 診斷工具</h1>
        <Button onClick={fetchDiagnosticData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新診斷
        </Button>
      </div>

      {/* 環境檢測結果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            環境檢測結果
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span className="text-sm font-medium">Cloudflare:</span>
              <Badge variant={diagnosticData.isCloudflare.hasCfConnectingIp ? "default" : "secondary"}>
                {diagnosticData.isCloudflare.hasCfConnectingIp ? "檢測到" : "未檢測到"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span className="text-sm font-medium">代理服務器:</span>
              <Badge variant={diagnosticData.proxyInfo.hasNginxProxy || diagnosticData.proxyInfo.has1Panel ? "default" : "secondary"}>
                {diagnosticData.proxyInfo.hasNginxProxy || diagnosticData.proxyInfo.has1Panel ? "檢測到" : "未檢測到"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">IP來源:</span>
              <Badge variant="default">
                {diagnosticData.recommendations.primaryIpSource}
              </Badge>
            </div>
          </div>

          {/* 推薦的IP */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">推薦使用的客戶端IP</h3>
            <p className="text-lg font-mono text-blue-800">
              {diagnosticData.recommendations.primaryIp}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              來源: {diagnosticData.recommendations.primaryIpSource}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cloudflare 信息 */}
      {diagnosticData.isCloudflare.hasCfConnectingIp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              Cloudflare 信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">CF-Connecting-IP</label>
                <p className="text-sm bg-gray-100 p-2 rounded font-mono">
                  {diagnosticData.ipAnalysis.cfConnectingIp || 'null'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CF-Ray</label>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {diagnosticData.isCloudflare.cfRay || 'null'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CF-Country</label>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {diagnosticData.isCloudflare.cfCountry || 'null'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CF-Visitor</label>
                <p className="text-sm bg-gray-100 p-2 rounded">
                  {diagnosticData.isCloudflare.cfVisitor || 'null'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 代理信息 */}
      {(diagnosticData.proxyInfo.hasNginxProxy || diagnosticData.proxyInfo.has1Panel) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-green-500" />
              代理服務器信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {diagnosticData.proxyInfo.hasNginxProxy && (
              <div>
                <label className="text-sm font-medium text-gray-500">Nginx Proxy Real IP</label>
                <p className="text-sm bg-gray-100 p-2 rounded font-mono">
                  {diagnosticData.proxyInfo.nginxProxyIp || 'null'}
                </p>
              </div>
            )}
            {diagnosticData.proxyInfo.has1Panel && (
              <div>
                <label className="text-sm font-medium text-gray-500">1Panel Client IP</label>
                <p className="text-sm bg-gray-100 p-2 rounded font-mono">
                  {diagnosticData.proxyInfo.panelClientIp || 'null'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* IP鏈分析 */}
      <Card>
        <CardHeader>
          <CardTitle>IP 鏈分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">X-Forwarded-For 鏈</label>
            {diagnosticData.ipChain.xForwardedForChain.length > 0 ? (
              <div className="mt-1 space-y-1">
                {diagnosticData.ipChain.xForwardedForChain.map((ip, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      {index === 0 ? "客戶端" : `代理${index}`}
                    </Badge>
                    <span className="font-mono">{ip}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">無 X-Forwarded-For 頭部</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 所有IP相關頭部 */}
      <Card>
        <CardHeader>
          <CardTitle>所有 IP 相關頭部</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {Object.entries(diagnosticData.ipHeaders).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-sm bg-gray-100 p-2 rounded">
                <span className="font-medium text-blue-600 min-w-32">{key}:</span>
                <span className="font-mono text-gray-800 flex-1">{value || 'null'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 配置建議 */}
      <Card>
        <CardHeader>
          <CardTitle>配置建議</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {diagnosticData.recommendations.suggestedConfig.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 完整頭部列表 */}
      <Card>
        <CardHeader>
          <CardTitle>完整 HTTP 頭部列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(diagnosticData.allHeaders).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-sm bg-gray-100 p-2 rounded">
                <span className="font-medium text-blue-600 min-w-40">{key}:</span>
                <span className="text-gray-800 flex-1 break-all">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用說明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用說明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. 查看上面的診斷結果，確認你的環境類型（Cloudflare、代理、直接連接）</p>
          <p>2. 檢查「推薦使用的客戶端IP」是否為你的真實IP (114.33.18.13)</p>
          <p>3. 如果不是，請將診斷結果截圖發給我，我會根據實際的頭部信息調整IP檢測邏輯</p>
          <p>4. 特別注意 X-Forwarded-For 鏈和 Cloudflare 相關頭部</p>
        </CardContent>
      </Card>
    </div>
  )
}
