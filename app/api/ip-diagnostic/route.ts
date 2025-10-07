import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 收集所有可能的IP相关头部
    const allHeaders = Object.fromEntries(request.headers.entries())
    
    // 专门收集IP相关的头部
    const ipHeaders = {
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'x-client-ip': request.headers.get('x-client-ip'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'), // Cloudflare
      'cf-ray': request.headers.get('cf-ray'), // Cloudflare Ray ID
      'cf-visitor': request.headers.get('cf-visitor'), // Cloudflare visitor info
      'cf-ipcountry': request.headers.get('cf-ipcountry'), // Cloudflare country
      'x-forwarded': request.headers.get('x-forwarded'),
      'forwarded-for': request.headers.get('forwarded-for'),
      'forwarded': request.headers.get('forwarded'),
      'x-original-forwarded-for': request.headers.get('x-original-forwarded-for'),
      'x-cluster-client-ip': request.headers.get('x-cluster-client-ip'),
      'x-1panel-client-ip': request.headers.get('x-1panel-client-ip'),
      'x-nginx-proxy-real-ip': request.headers.get('x-nginx-proxy-real-ip'),
      'x-original-remote-addr': request.headers.get('x-original-remote-addr'),
      'x-remote-addr': request.headers.get('x-remote-addr'),
      'x-client-real-ip': request.headers.get('x-client-real-ip'),
      'true-client-ip': request.headers.get('true-client-ip'),
    }

    // 获取其他有用的头部信息
    const otherHeaders = {
      'user-agent': request.headers.get('user-agent'),
      'host': request.headers.get('host'),
      'referer': request.headers.get('referer'),
      'origin': request.headers.get('origin'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-port': request.headers.get('x-forwarded-port'),
      'via': request.headers.get('via'),
      'connection': request.headers.get('connection'),
      'upgrade-insecure-requests': request.headers.get('upgrade-insecure-requests'),
    }

    // 尝试从不同来源获取IP
    const ipAnalysis = {
      // 标准代理头部
      xForwardedFor: request.headers.get('x-forwarded-for'),
      xRealIp: request.headers.get('x-real-ip'),
      xClientIp: request.headers.get('x-client-ip'),
      
      // Cloudflare 特定头部
      cfConnectingIp: request.headers.get('cf-connecting-ip'),
      
      // 其他可能的头部
      forwarded: request.headers.get('forwarded'),
      xOriginalForwardedFor: request.headers.get('x-original-forwarded-for'),
      
      // 分析结果
      analysis: {
        hasCloudflare: !!request.headers.get('cf-connecting-ip') || !!request.headers.get('cf-ray'),
        hasXForwardedFor: !!request.headers.get('x-forwarded-for'),
        hasXRealIp: !!request.headers.get('x-real-ip'),
        hasForwarded: !!request.headers.get('forwarded'),
        recommendedIpSource: '',
        recommendedIp: '',
      }
    }

    // 分析并推荐最佳IP来源
    if (ipAnalysis.cfConnectingIp) {
      ipAnalysis.analysis.recommendedIpSource = 'cf-connecting-ip (Cloudflare)'
      ipAnalysis.analysis.recommendedIp = ipAnalysis.cfConnectingIp
    } else if (ipAnalysis.xForwardedFor) {
      // 解析 x-forwarded-for，通常格式为 "client-ip, proxy1-ip, proxy2-ip"
      const forwardedIps = ipAnalysis.xForwardedFor.split(',').map(ip => ip.trim())
      const clientIp = forwardedIps[0] // 第一个IP通常是客户端IP
      ipAnalysis.analysis.recommendedIpSource = 'x-forwarded-for (first IP)'
      ipAnalysis.analysis.recommendedIp = clientIp
    } else if (ipAnalysis.xRealIp) {
      ipAnalysis.analysis.recommendedIpSource = 'x-real-ip'
      ipAnalysis.analysis.recommendedIp = ipAnalysis.xRealIp
    } else if (ipAnalysis.forwarded) {
      ipAnalysis.analysis.recommendedIpSource = 'forwarded header'
      ipAnalysis.analysis.recommendedIp = ipAnalysis.forwarded
    } else {
      ipAnalysis.analysis.recommendedIpSource = 'no reliable IP source found'
      ipAnalysis.analysis.recommendedIp = 'unknown'
    }

    // 检查是否是Cloudflare
    const isCloudflare = {
      hasCfConnectingIp: !!request.headers.get('cf-connecting-ip'),
      hasCfRay: !!request.headers.get('cf-ray'),
      hasCfVisitor: !!request.headers.get('cf-visitor'),
      hasCfIpCountry: !!request.headers.get('cf-ipcountry'),
      cfRay: request.headers.get('cf-ray'),
      cfCountry: request.headers.get('cf-ipcountry'),
      cfVisitor: request.headers.get('cf-visitor'),
    }

    // 检查是否是1Panel或Nginx代理
    const proxyInfo = {
      hasNginxProxy: !!request.headers.get('x-nginx-proxy-real-ip'),
      has1Panel: !!request.headers.get('x-1panel-client-ip'),
      nginxProxyIp: request.headers.get('x-nginx-proxy-real-ip'),
      panelClientIp: request.headers.get('x-1panel-client-ip'),
    }

    // 解析 x-forwarded-for 中的所有IP
    const parseXForwardedFor = (xff: string | null) => {
      if (!xff) return []
      return xff.split(',').map(ip => ip.trim()).filter(ip => ip)
    }

    // 分析IP来源链
    const ipChain = {
      xForwardedForChain: parseXForwardedFor(ipAnalysis.xForwardedFor),
      recommendedClientIp: ipAnalysis.analysis.recommendedIp,
      isPublicIp: (ip: string) => {
        // 简单的公网IP检查
        return !ip.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.)/)
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      url: request.url,
      
      // 主要分析结果
      ipAnalysis,
      isCloudflare,
      proxyInfo,
      ipChain,
      
      // 所有IP相关头部
      ipHeaders,
      
      // 其他有用头部
      otherHeaders,
      
      // 完整头部列表（用于调试）
      allHeaders,
      
      // 建议
      recommendations: {
        primaryIpSource: ipAnalysis.analysis.recommendedIpSource,
        primaryIp: ipAnalysis.analysis.recommendedIp,
        isCloudflareSetup: isCloudflare.hasCfConnectingIp,
        isProxySetup: proxyInfo.hasNginxProxy || proxyInfo.has1Panel,
        suggestedConfig: generateSuggestedConfig(ipAnalysis, isCloudflare, proxyInfo)
      }
    })
    
  } catch (error) {
    console.error('IP诊断错误:', error)
    return NextResponse.json(
      { error: 'IP诊断失败', details: error.message },
      { status: 500 }
    )
  }
}

function generateSuggestedConfig(ipAnalysis: any, isCloudflare: any, proxyInfo: any): string[] {
  const suggestions = []
  
  if (isCloudflare.hasCfConnectingIp) {
    suggestions.push('检测到Cloudflare代理，建议优先使用 cf-connecting-ip 头部')
    suggestions.push('确保1Panel/反向代理正确转发 cf-connecting-ip 头部')
  }
  
  if (ipAnalysis.xForwardedFor) {
    suggestions.push('检测到 x-forwarded-for 头部，建议解析第一个IP作为客户端IP')
    const ips = ipAnalysis.xForwardedFor.split(',').map((ip: string) => ip.trim())
    if (ips.length > 1) {
      suggestions.push(`IP链: ${ips.join(' -> ')}`)
    }
  }
  
  if (proxyInfo.hasNginxProxy) {
    suggestions.push('检测到Nginx代理，建议配置 nginx.conf 正确转发客户端IP')
  }
  
  if (proxyInfo.has1Panel) {
    suggestions.push('检测到1Panel，建议检查1Panel的反向代理配置')
  }
  
  if (!isCloudflare.hasCfConnectingIp && !ipAnalysis.xForwardedFor && !ipAnalysis.xRealIp) {
    suggestions.push('警告: 未检测到可靠的IP来源头部，请检查代理配置')
  }
  
  return suggestions
}
