'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Globe, Info, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface IpDebugInfo {
  ip: string
  isAllowed: boolean
  enableIpWhitelist: boolean
  allowedIps: string[]
  timestamp: string
  debug: {
    allIpSources: Record<string, string | null>
    allFoundIps: string[]
    isLocalDevelopment: boolean
    localIp: string | null
    environment: string
    host: string | null
    referer: string | null
    userAgent: string | null
    originalDetectedIp: string
    finalDetectedIp: string
  }
  location: any
  development: any
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
      console.error('Error fetching IP info:', error)
      setError('無法獲取IP信息')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIpInfo()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  if (error || !ipInfo) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">IP 調試信息</h1>
        <p className="text-muted-foreground">詳細的IP檢測和調試信息</p>
      </div>

      {/* 主要IP信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            檢測到的IP地址
          </CardTitle>
          <CardDescription>
            系統檢測到的主要IP地址信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">最終檢測到的IP</h4>
              <Badge variant="default" className="text-sm">
                {ipInfo.ip}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">原始檢測到的IP</h4>
              <Badge variant="outline" className="text-sm">
                {ipInfo.debug.originalDetectedIp}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">IP白名單狀態</h4>
              <Badge variant={ipInfo.isAllowed ? "default" : "destructive"}>
                {ipInfo.isAllowed ? '允許' : '拒絕'}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">白名單功能</h4>
              <Badge variant={ipInfo.enableIpWhitelist ? "default" : "secondary"}>
                {ipInfo.enableIpWhitelist ? '已啟用' : '已禁用'}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">環境</h4>
              <Badge variant="outline">
                {ipInfo.debug.environment}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 所有找到的IP */}
      <Card>
        <CardHeader>
          <CardTitle>所有檢測到的IP地址</CardTitle>
          <CardDescription>
            從各種來源檢測到的所有IP地址
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ipInfo.debug.allFoundIps.length > 0 ? (
              ipInfo.debug.allFoundIps.map((ip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {ip}
                  </Badge>
                  {ip === ipInfo.ip && (
                    <Badge variant="default" className="text-xs">
                      最終選擇
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">沒有檢測到任何IP地址</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* IP來源詳細信息 */}
      <Card>
        <CardHeader>
          <CardTitle>IP來源詳細信息</CardTitle>
          <CardDescription>
            各種HTTP頭和連接信息中的IP地址
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(ipInfo.debug.allIpSources).map(([source, value]) => (
              <div key={source} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="font-medium text-sm">{source}:</span>
                <span className="font-mono text-sm">
                  {value || '未設置'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 本地開發環境信息 */}
      {ipInfo.development && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">{ipInfo.development.message}</div>
            <div className="text-sm space-y-1">
              {ipInfo.development.suggestions.map((suggestion, index) => (
                <div key={index}>• {suggestion}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 地理位置信息 */}
      {ipInfo.location && (
        <Card>
          <CardHeader>
            <CardTitle>地理位置信息</CardTitle>
            <CardDescription>
              IP地址的地理位置信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(ipInfo.location, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 其他調試信息 */}
      <Card>
        <CardHeader>
          <CardTitle>其他調試信息</CardTitle>
          <CardDescription>
            額外的調試和環境信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">主機</h4>
                <p className="text-sm font-mono">{ipInfo.debug.host || '未設置'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">引用來源</h4>
                <p className="text-sm font-mono">{ipInfo.debug.referer || '未設置'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">用戶代理</h4>
              <p className="text-sm font-mono break-all">{ipInfo.debug.userAgent || '未設置'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">時間戳</h4>
              <p className="text-sm">{ipInfo.timestamp}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按鈕 */}
      <div className="flex justify-center gap-4">
        <Button onClick={fetchIpInfo} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          重新檢測
        </Button>
        <Button variant="outline" onClick={() => window.open('/api/ip', '_blank')}>
          <Globe className="w-4 h-4 mr-2" />
          查看API響應
        </Button>
      </div>
    </div>
  )
} 