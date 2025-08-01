"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Shield, ShieldAlert, Globe, Save, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface IpInfo {
  ip: string
  isAllowed: boolean
  enableIpWhitelist: boolean
  allowedIps: string[]
  timestamp: string
}

export default function IpWhitelistPage() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enableWhitelist, setEnableWhitelist] = useState(false)
  const [allowedIps, setAllowedIps] = useState("")

  useEffect(() => {
    fetchIpInfo()
  }, [])

  const fetchIpInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ip')
      if (!response.ok) {
        throw new Error('無法獲取IP信息')
      }
      const data = await response.json()
      setIpInfo(data)
      setEnableWhitelist(data.enableIpWhitelist)
      setAllowedIps(data.allowedIps.join(', '))
    } catch (error) {
      console.error("無法獲取IP信息:", error)
      toast({
        title: "錯誤",
        description: "無法獲取IP信息",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // 這裡應該調用API來保存設置
      // 由於這是前端演示，我們只顯示成功消息
      toast({
        title: "成功",
        description: "IP白名單設置已保存",
      })
    } catch (error) {
      console.error("保存失敗:", error)
      toast({
        title: "錯誤",
        description: "保存設置失敗",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">IP 白名單管理</h1>
          <p className="text-blue-200">管理允許訪問系統的IP地址</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 當前IP狀態 */}
          <Card className="bg-slate-800/50 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                當前IP狀態
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ipInfo && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">IP地址:</span>
                    <span className="text-white font-mono">{ipInfo.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">白名單狀態:</span>
                    <div className="flex items-center gap-2">
                      {ipInfo.enableIpWhitelist && !ipInfo.isAllowed ? (
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-green-400" />
                      )}
                      <span className={ipInfo.enableIpWhitelist && !ipInfo.isAllowed ? "text-red-400" : "text-green-400"}>
                        {ipInfo.enableIpWhitelist && !ipInfo.isAllowed ? "拒絕" : "允許"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">檢查時間:</span>
                    <span className="text-white text-sm">
                      {new Date(ipInfo.timestamp).toLocaleString('zh-TW')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 白名單設置 */}
          <Card className="bg-slate-800/50 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                白名單設置
              </CardTitle>
              <CardDescription className="text-blue-200">
                配置允許訪問的IP地址
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-whitelist" className="text-blue-200">
                  啟用IP白名單
                </Label>
                <Switch
                  id="enable-whitelist"
                  checked={enableWhitelist}
                  onCheckedChange={setEnableWhitelist}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-ips" className="text-blue-200">
                  允許的IP地址
                </Label>
                <Input
                  id="allowed-ips"
                  value={allowedIps}
                  onChange={(e) => setAllowedIps(e.target.value)}
                  placeholder="192.168.1.0/24, 10.0.0.50, 172.16.0.0/16"
                  className="bg-slate-700 border-blue-600 text-white"
                />
                <p className="text-xs text-blue-300">
                  支援格式：單一IP (192.168.1.100)、IP範圍 (192.168.1.0/24)、多個IP用逗號分隔
                </p>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                保存設置
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 使用說明 */}
        <Card className="mt-6 bg-slate-800/50 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-white">使用說明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-200 space-y-2 text-sm">
              <p>• <strong>啟用IP白名單：</strong>開啟後，只有白名單內的IP才能訪問系統</p>
              <p>• <strong>IP格式支援：</strong></p>
              <ul className="ml-6 space-y-1">
                <li>• 單一IP：192.168.1.100</li>
                <li>• IP範圍：192.168.1.0/24 (CIDR格式)</li>
                <li>• 多個IP：用逗號分隔，如 192.168.1.100, 10.0.0.50</li>
              </ul>
              <p>• <strong>注意：</strong>設置更改後需要重新啟動應用程式才能生效</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 