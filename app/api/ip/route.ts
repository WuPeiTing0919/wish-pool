import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, isIpAllowed, getIpLocation, getDetailedIpInfo } from '@/lib/ip-utils'

// 強制動態渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 使用詳細的IP檢測功能
    const detailedInfo = getDetailedIpInfo(request);
    let clientIp = detailedInfo.detectedIp;
    
    // 確保返回IPv4格式的地址
    function ensureIPv4Format(ip: string): string {
      if (!ip) return '127.0.0.1';
      
      // 移除空白字符
      ip = ip.trim();
      
      // 處理IPv6格式的IPv4地址
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

    // 檢查是否為IPv6格式的IPv4地址
    function isIPv6MappedIPv4(ip: string): boolean {
      return ip.startsWith('::ffff:');
    }

    // 獲取IPv6格式的IPv4地址
    function getIPv6MappedFormat(ipv4: string): string {
      return `::ffff:${ipv4}`;
    }
    
    // 如果檢測到的是127.0.0.1，嘗試從請求頭獲取真實IP
    if (clientIp === '127.0.0.1') {
      // 檢查是否有代理轉發的真實IP
      const forwardedFor = request.headers.get('x-forwarded-for');
      if (forwardedFor) {
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        for (const ip of ips) {
          // 處理IPv6格式的IPv4地址
          let cleanIp = ip;
          if (ip.startsWith('::ffff:')) {
            cleanIp = ip.substring(7);
          }
          if (cleanIp && cleanIp !== '127.0.0.1' && cleanIp !== '::1' && cleanIp !== 'localhost') {
            clientIp = cleanIp;
            break;
          }
        }
      }
      
      // 檢查其他可能的IP來源
      const realIp = request.headers.get('x-real-ip');
      if (realIp) {
        let cleanRealIp = realIp;
        if (realIp.startsWith('::ffff:')) {
          cleanRealIp = realIp.substring(7);
        }
        if (cleanRealIp !== '127.0.0.1') {
          clientIp = cleanRealIp;
        }
      }
      
      const clientIpHeader = request.headers.get('x-client-ip');
      if (clientIpHeader) {
        let cleanClientIp = clientIpHeader;
        if (clientIpHeader.startsWith('::ffff:')) {
          cleanClientIp = clientIpHeader.substring(7);
        }
        if (cleanClientIp !== '127.0.0.1') {
          clientIp = cleanClientIp;
        }
      }
    }
    
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
    
    // 確保最終返回的IP是IPv4格式
    const finalIp = ensureIPv4Format(clientIp);
    const originalIp = detailedInfo.detectedIp;
    const isIPv6Mapped = isIPv6MappedIPv4(originalIp);
    const ipv6Format = getIPv6MappedFormat(finalIp);
    
    return NextResponse.json({
      ip: finalIp,
      isAllowed,
      enableIpWhitelist,
      allowedIps: enableIpWhitelist ? allowedIps.split(',').map(ip => ip.trim()) : [],
      timestamp: new Date().toISOString(),
      ipv6Info: {
        isIPv6Mapped,
        originalFormat: originalIp,
        ipv6Format,
        hasIPv6Support: true
      },
      debug: {
        allIpSources: detailedInfo.ipSources,
        allFoundIps: detailedInfo.allFoundIps,
        isLocalDevelopment: detailedInfo.isLocalDevelopment,
        localIp: detailedInfo.localIp,
        environment: process.env.NODE_ENV,
        host: request.headers.get('host'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
        originalDetectedIp: detailedInfo.detectedIp,
        finalDetectedIp: finalIp,
        rawDetectedIp: clientIp, // 保留原始檢測到的IP用於調試
        ipDetectionMethod: isIPv6Mapped ? 'IPv6-Mapped-IPv4' : 'Standard-IPv4'
      },
      location: locationInfo,
      // 本地開發環境的特殊信息
      development: detailedInfo.isLocalDevelopment ? {
        message: '本地開發環境 - IP檢測可能受限',
        suggestions: [
          '在生產環境中部署後，IP檢測會更準確',
          '可以使用 ngrok 或類似工具進行外部測試',
          '檢查防火牆和網路配置',
          '確認代理伺服器設置',
          '如果使用VPN，請檢查VPN設置'
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