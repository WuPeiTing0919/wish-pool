import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 測試即時數據獲取...')
    
    // 簡單測試：獲取前5個困擾案例
    const wishes = await prisma.wish.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        id: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        isPublic: true,
        createdAt: true
      }
    })
    
    console.log(`✅ 成功獲取 ${wishes.length} 筆困擾案例`)
    
    // 轉換 BigInt 為 Number
    const formattedWishes = wishes.map((wish: any) => ({
      ...wish,
      id: Number(wish.id),
      createdAt: wish.createdAt.toISOString()
    }))
    
    return NextResponse.json({ 
      success: true, 
      data: formattedWishes,
      message: `成功獲取 ${wishes.length} 筆困擾案例`
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
