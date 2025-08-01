'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, ExternalLink, Info, CheckCircle, AlertCircle } from 'lucide-react'

export default function IpTestPage() {
  const [externalIp, setExternalIp] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExternalIp = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      if (!response.ok) {
        throw new Error('無法獲取外部IP')
      }
      const data = await response.json()
      setExternalIp(data.ip)
    } catch (error) {
      console.error('Error fetching external IP:', error)
      setError('無法獲取外部IP地址')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">IP 測試工具</h1>
        <p className="text-muted-foreground">測試你的真實公網IP地址</p>
      </div>

      {/* 說明 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">為什麼會顯示 127.0.0.1？</div>
          <div className="text-sm space-y-1">
            <div>• 在本地開發環境中，所有請求都來自本地回環地址</div>
            <div>• 這是正常的行為，不是錯誤</div>
            <div>• 在生產環境中部署後，IP檢測會更準確</div>
            <div>• 你可以使用下面的工具測試你的真實公網IP</div>
          </div>
        </AlertDescription>
      </Alert>

      {/* 外部IP檢測 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            真實公網IP檢測
          </CardTitle>
          <CardDescription>
            從外部服務獲取你的真實公網IP地址
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchExternalIp} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {loading ? '檢測中...' : '檢測真實IP'}
            </Button>
            
            {externalIp && (
              <div className="flex items-center gap-2">
                <span className="font-medium">你的公網IP:</span>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {externalIp}
                </Badge>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>這個IP地址就是你的真實公網IP，可以用於：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>配置IP白名單</li>
              <li>測試IP檢測功能</li>
              <li>驗證網路配置</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 測試方法 */}
      <Card>
        <CardHeader>
          <CardTitle>測試真實IP的方法</CardTitle>
          <CardDescription>幾種測試IP檢測功能的方法</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">1. 使用 ngrok 進行外部測試</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 安裝 ngrok: <code className="bg-muted px-1 rounded">npm install -g ngrok</code></p>
                <p>• 啟動隧道: <code className="bg-muted px-1 rounded">ngrok http 3000</code></p>
                <p>• 使用 ngrok 提供的URL訪問你的應用</p>
                <p>• 這樣就能測試真實的IP檢測功能</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. 部署到生產環境</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 部署到 Vercel、Netlify 或其他平台</p>
                <p>• 在生產環境中，IP檢測會更準確</p>
                <p>• 可以測試真實的IP白名單功能</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. 使用代理服務器</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 配置 Nginx 或 Apache 作為反向代理</p>
                <p>• 確保正確設置 IP 轉發頭</p>
                <p>• 這樣可以模擬生產環境的IP檢測</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置建議 */}
      <Card>
        <CardHeader>
          <CardTitle>配置建議</CardTitle>
          <CardDescription>根據不同環境的配置建議</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">本地開發環境</h4>
              <div className="text-sm text-muted-foreground">
                <p>在 <code className="bg-muted px-1 rounded">.env.local</code> 中設置：</p>
                <pre className="bg-muted p-2 rounded mt-2 text-xs">
{`# 禁用IP白名單檢查
ENABLE_IP_WHITELIST=false

# 或者允許本地IP
ALLOWED_IPS=127.0.0.1,192.168.1.0/24`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">生產環境</h4>
              <div className="text-sm text-muted-foreground">
                <p>在生產環境中設置：</p>
                <pre className="bg-muted p-2 rounded mt-2 text-xs">
{`# 啟用IP白名單
ENABLE_IP_WHITELIST=true

# 設置允許的IP地址
ALLOWED_IPS=你的真實IP地址,其他允許的IP`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速連結 */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => window.open('/test/ip-debug', '_blank')}>
          <Globe className="w-4 h-4 mr-2" />
          詳細IP調試
        </Button>
        <Button variant="outline" onClick={() => window.open('/api/ip', '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          IP API 端點
        </Button>
      </div>
    </div>
  )
} 