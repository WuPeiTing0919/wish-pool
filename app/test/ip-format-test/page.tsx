'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface IpTestResult {
  originalIp: string
  cleanedIp: string
  isIPv4: boolean
  isIPv6: boolean
  isLocalhost: boolean
  description: string
}

export default function IpFormatTestPage() {
  const [testResults, setTestResults] = useState<IpTestResult[]>([])
  const [loading, setLoading] = useState(false)

  // 測試IP地址清理函數
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

  // 檢查IP類型
  function analyzeIp(ip: string): { isIPv4: boolean; isIPv6: boolean; isLocalhost: boolean; description: string } {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    const isIPv4 = ipv4Regex.test(ip);
    const isIPv6 = ipv6Regex.test(ip) || ip.startsWith('::ffff:') || ip === '::1';
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    
    let description = '';
    if (ip.startsWith('::ffff:')) {
      description = 'IPv6格式的IPv4地址';
    } else if (ip === '::1') {
      description = 'IPv6本地回環地址';
    } else if (isIPv4) {
      description = '標準IPv4地址';
    } else if (isIPv6) {
      description = 'IPv6地址';
    } else {
      description = '無效的IP地址格式';
    }
    
    return { isIPv4, isIPv6, isLocalhost, description };
  }

  const runTests = () => {
    setLoading(true);
    
    const testIps = [
      '::ffff:127.0.0.1',
      '::1',
      '127.0.0.1',
      '192.168.1.1',
      '::ffff:192.168.1.100',
      '2001:db8::1',
      'invalid-ip',
      'localhost',
      '::ffff:203.0.113.1',
      '10.0.0.1'
    ];

    const results: IpTestResult[] = testIps.map(originalIp => {
      const cleanedIp = cleanIpForDisplay(originalIp);
      const analysis = analyzeIp(originalIp);
      
      return {
        originalIp,
        cleanedIp,
        ...analysis
      };
    });

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">IPv4 格式測試</h1>
        <p className="text-muted-foreground">測試IP地址清理和IPv4格式轉換功能</p>
      </div>

      {/* 說明 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">測試目的</div>
          <div className="text-sm space-y-1">
            <div>• 驗證IPv6格式的IPv4地址能正確轉換為IPv4</div>
            <div>• 確保所有IP地址都顯示為標準IPv4格式</div>
            <div>• 測試各種IP地址格式的處理邏輯</div>
            <div>• 驗證本地回環地址的正確處理</div>
          </div>
        </AlertDescription>
      </Alert>

      {/* 測試結果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            IP格式轉換測試結果
          </CardTitle>
          <CardDescription>
            各種IP地址格式的清理和轉換結果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">原始IP:</span>
                    <Badge variant="outline" className="font-mono">
                      {result.originalIp}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">清理後:</span>
                    <Badge variant="default" className="font-mono">
                      {result.cleanedIp}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    {result.isIPv4 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>IPv4: {result.isIPv4 ? '是' : '否'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {result.isIPv6 ? (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                    <span>IPv6: {result.isIPv6 ? '是' : '否'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {result.isLocalhost ? (
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                    <span>本地: {result.isLocalhost ? '是' : '否'}</span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {result.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 操作按鈕 */}
      <div className="flex justify-center">
        <Button onClick={runTests} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '測試中...' : '重新測試'}
        </Button>
      </div>

      {/* 總結 */}
      <Card>
        <CardHeader>
          <CardTitle>測試總結</CardTitle>
          <CardDescription>
            IPv4格式轉換的關鍵點
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">✅ 正確處理的格式</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code>::ffff:127.0.0.1</code> → <code>127.0.0.1</code></li>
                <li>• <code>::1</code> → <code>127.0.0.1</code></li>
                <li>• <code>127.0.0.1</code> → <code>127.0.0.1</code> (保持不變)</li>
                <li>• <code>192.168.1.1</code> → <code>192.168.1.1</code> (保持不變)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">⚠️ 無效格式處理</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 無效IP地址 → <code>127.0.0.1</code> (默認值)</li>
                <li>• 空值或null → <code>127.0.0.1</code> (默認值)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🎯 目標</h4>
              <p className="text-sm text-muted-foreground">
                確保所有顯示的IP地址都是標準的IPv4格式，提供一致且易於理解的用戶體驗。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 