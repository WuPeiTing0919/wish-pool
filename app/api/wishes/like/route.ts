import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 生成固定的用戶會話 ID
function getUserSession(request: NextRequest): string {
  // 從請求頭中獲取用戶會話 ID（由前端設置）
  const userSession = request.headers.get('x-user-session')
  
  if (userSession) {
    return userSession
  }
  
  // 如果沒有會話 ID，生成一個新的
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wishId } = body
    
    if (!wishId) {
      return NextResponse.json(
        { success: false, error: 'Wish ID is required' },
        { status: 400 }
      )
    }
    
    // 獲取用戶會話 ID
    const userSession = getUserSession(request)
    
    try {
      await prisma.wishLike.create({
        data: {
          wishId: Number(wishId),
          userSession: userSession,
        }
      })
      
      return NextResponse.json({ success: true, data: { liked: true } })
    } catch (error: any) {
      if (error.code === 'P2002') {
        // 重複點讚
        return NextResponse.json({ success: true, data: { liked: false } })
      }
      throw error
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to like wish' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wishId = searchParams.get('wishId')
    
    if (!wishId) {
      return NextResponse.json(
        { success: false, error: 'Wish ID is required' },
        { status: 400 }
      )
    }
    
    // 獲取用戶會話 ID
    const userSession = getUserSession(request)
    
    const like = await prisma.wishLike.findFirst({
      where: {
        wishId: Number(wishId),
        userSession: userSession
      }
    })
    
    const liked = !!like
    
    return NextResponse.json({ success: true, data: { liked } })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check like status' },
      { status: 500 }
    )
  }
}
