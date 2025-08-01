import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isIpAllowed, getClientIp } from '@/lib/ip-utils'

export function middleware(request: NextRequest) {
  // 檢查是否啟用IP白名單
  const enableIpWhitelist = process.env.ENABLE_IP_WHITELIST === 'true'
  
  if (!enableIpWhitelist) {
    return NextResponse.next()
  }

  // 獲取客戶端IP
  const clientIp = getClientIp(request)
  
  // 獲取允許的IP列表
  const allowedIps = process.env.ALLOWED_IPS || ''
  
  // 檢查IP是否被允許
  if (!isIpAllowed(clientIp, allowedIps)) {
    // 記錄被拒絕的訪問
    console.warn(`Access denied for IP: ${clientIp} - Path: ${request.nextUrl.pathname}`)
    
    // 返回403禁止訪問頁面
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>訪問被拒絕</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 500px;
            margin: 1rem;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #ff6b6b;
          }
          p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1rem;
            opacity: 0.9;
          }
          .ip-info {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
          }
          .contact {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-top: 2rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚫 訪問被拒絕</h1>
          <p>很抱歉，您的IP地址不在允許的訪問列表中。</p>
          <div class="ip-info">
            <strong>您的IP地址：</strong><br>
            ${clientIp}
          </div>
          <p>如果您認為這是一個錯誤，請聯繫系統管理員。</p>
          <div class="contact">
            錯誤代碼：403 Forbidden<br>
            時間：${new Date().toLocaleString('zh-TW')}
          </div>
        </div>
      </body>
      </html>
      `,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    )
  }

  // IP檢查通過，繼續處理請求
  return NextResponse.next()
}

// 配置中間件適用的路徑
export const config = {
  matcher: [
    /*
     * 匹配所有路徑，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.png (icon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
} 