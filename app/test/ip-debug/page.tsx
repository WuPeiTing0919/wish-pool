'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, Shield, MapPin, RefreshCw, AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-react'

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
  }
  location: any
  development: {
    message: string
    suggestions: string[]
  } | null
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
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>載入中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ipInfo) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              錯誤
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error || '無法獲取IP信息'}</p>
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
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">IP 檢測調試工具</h1>
        <p className="text-muted-foreground">查看詳細的IP檢測信息和調試數據</p>
      </div>

      {/* 本地開發環境提示 */}
      {ipInfo.development && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-2">{ipInfo.development.message}</div>
            <div className="text-sm space-y-1">
              {ipInfo.development.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Lightbulb className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 主要IP信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            IP 信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">檢測到的IP:</span>
              <Badge variant={ipInfo.ip === '127.0.0.1' ? 'destructive' : 'default'}>
                {ipInfo.ip}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">狀態:</span>
              {ipInfo.isAllowed ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  允許
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  拒絕
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">IP白名單:</span>
              <Badge variant={ipInfo.enableIpWhitelist ? 'default' : 'secondary'}>
                {ipInfo.enableIpWhitelist ? '已啟用' : '已停用'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">環境:</span>
              <Badge variant="outline">{ipInfo.debug.environment}</Badge>
            </div>
            {ipInfo.debug.isLocalDevelopment && ipInfo.debug.localIp && (
              <div className="flex items-center gap-2">
                <span className="text-sm">本機IP:</span>
                <Badge variant="outline">{ipInfo.debug.localIp}</Badge>
              </div>
            )}
          </div>

          {ipInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">位置:</span>
              <span className="text-sm">
                {ipInfo.location.city}, {ipInfo.location.country} ({ipInfo.location.isp})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 所有找到的IP */}
      <Card>
        <CardHeader>
          <CardTitle>所有檢測到的IP</CardTitle>
          <CardDescription>系統檢測到的所有IP地址</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ipInfo.debug.allFoundIps.length > 0 ? (
              ipInfo.debug.allFoundIps.map((ip, index) => (
                <Badge 
                  key={index} 
                  variant={ip === ipInfo.ip ? 'default' : 'outline'}
                  className={ip === '127.0.0.1' ? 'border-red-300 text-red-700' : ''}
                >
                  {ip} {ip === ipInfo.ip && '(已選擇)'}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">未檢測到任何IP</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 允許的IP列表 */}
      {ipInfo.enableIpWhitelist && (
        <Card>
          <CardHeader>
            <CardTitle>允許的IP地址</CardTitle>
            <CardDescription>當前配置的IP白名單</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ipInfo.allowedIps.length > 0 ? (
                ipInfo.allowedIps.map((ip, index) => (
                  <Badge key={index} variant="outline">
                    {ip}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">未配置IP白名單</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 調試信息 */}
      <Card>
        <CardHeader>
          <CardTitle>調試信息</CardTitle>
          <CardDescription>所有可能的IP來源和請求頭信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">所有IP來源:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(ipInfo.debug.allIpSources).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm font-mono">{key}:</span>
                    <span className="text-sm text-muted-foreground">
                      {value || 'null'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">請求信息:</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Host:</span>
                  <span className="text-sm text-muted-foreground">
                    {ipInfo.debug.host || 'null'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Referer:</span>
                  <span className="text-sm text-muted-foreground">
                    {ipInfo.debug.referer || 'null'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">User Agent:</span>
                  <span className="text-sm text-muted-foreground max-w-xs truncate">
                    {ipInfo.debug.userAgent || 'null'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">時間戳:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(ipInfo.timestamp).toLocaleString('zh-TW')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 地理位置信息 */}
      {ipInfo.location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              地理位置信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">位置信息</h4>
                <div className="space-y-1 text-sm">
                  <div>國家: {ipInfo.location.country} ({ipInfo.location.countryCode})</div>
                  <div>地區: {ipInfo.location.regionName}</div>
                  <div>城市: {ipInfo.location.city}</div>
                  <div>郵遞區號: {ipInfo.location.zip}</div>
                  <div>時區: {ipInfo.location.timezone}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">網路信息</h4>
                <div className="space-y-1 text-sm">
                  <div>ISP: {ipInfo.location.isp}</div>
                  <div>組織: {ipInfo.location.org}</div>
                  <div>AS: {ipInfo.location.as}</div>
                  <div>行動網路: {ipInfo.location.mobile ? '是' : '否'}</div>
                  <div>代理: {ipInfo.location.proxy ? '是' : '否'}</div>
                  <div>主機服務: {ipInfo.location.hosting ? '是' : '否'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按鈕 */}
      <div className="flex justify-center">
        <Button onClick={fetchIpInfo} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          重新檢測IP
        </Button>
      </div>
    </div>
  )
} 