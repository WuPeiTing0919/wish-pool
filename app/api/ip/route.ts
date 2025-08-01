import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, isIpAllowed } from '@/lib/ip-utils'

// 強制動態渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const allowedIps = process.env.ALLOWED_IPS || ''
    const enableIpWhitelist = process.env.ENABLE_IP_WHITELIST === 'true'
    
    const isAllowed = enableIpWhitelist ? isIpAllowed(clientIp, allowedIps) : true
    
    return NextResponse.json({
      ip: clientIp,
      isAllowed,
      enableIpWhitelist,
      allowedIps: enableIpWhitelist ? allowedIps.split(',').map(ip => ip.trim()) : [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting IP info:', error)
    return NextResponse.json(
      { error: '無法獲取IP信息' },
      { status: 500 }
    )
  }
} 