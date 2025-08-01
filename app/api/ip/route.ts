import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, isIpAllowed, getIpLocation, getDetailedIpInfo } from '@/lib/ip-utils'

// 強制動態渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 使用詳細的IP檢測功能
    const detailedInfo = getDetailedIpInfo(request);
    const clientIp = detailedInfo.detectedIp;
    
    const allowedIps = process.env.ALLOWED_IPS || ''
    const enableIpWhitelist = process.env.ENABLE_IP_WHITELIST === 'true'
    
    const isAllowed = enableIpWhitelist ? isIpAllowed(clientIp, allowedIps) : true
    
    // 嘗試獲取地理位置信息
    let locationInfo = null
    if (clientIp && clientIp !== '127.0.0.1' && isPublicIp(clientIp)) {
      try {
        locationInfo = await getIpLocation(clientIp)
      } catch (error) {
        console.error('Error fetching location info:', error)
      }
    }
    
    return NextResponse.json({
      ip: clientIp,
      isAllowed,
      enableIpWhitelist,
      allowedIps: enableIpWhitelist ? allowedIps.split(',').map(ip => ip.trim()) : [],
      timestamp: new Date().toISOString(),
      debug: {
        allIpSources: detailedInfo.ipSources,
        allFoundIps: detailedInfo.allFoundIps,
        isLocalDevelopment: detailedInfo.isLocalDevelopment,
        localIp: detailedInfo.localIp,
        environment: process.env.NODE_ENV,
        host: request.headers.get('host'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
      },
      location: locationInfo,
      // 本地開發環境的特殊信息
      development: detailedInfo.isLocalDevelopment ? {
        message: '本地開發環境 - IP檢測可能受限',
        suggestions: [
          '在生產環境中部署後，IP檢測會更準確',
          '可以使用 ngrok 或類似工具進行外部測試',
          '檢查防火牆和網路配置',
          '確認代理伺服器設置'
        ]
      } : null
    })
  } catch (error) {
    console.error('Error getting IP info:', error)
    return NextResponse.json(
      { error: '無法獲取IP信息' },
      { status: 500 }
    )
  }
}

// 檢查是否為公網IP的輔助函數
function isPublicIp(ip: string): boolean {
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8
    /^169\.254\./,              // 169.254.0.0/16 (Link-local)
    /^0\./,                     // 0.0.0.0/8
    /^224\./,                   // 224.0.0.0/4 (Multicast)
    /^240\./,                   // 240.0.0.0/4 (Reserved)
  ];
  
  return !privateRanges.some(range => range.test(ip));
} 