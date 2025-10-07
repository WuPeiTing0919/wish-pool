import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    // 只獲取基本數據，不包含點讚數據
    let wishes
    if (type === 'public') {
      wishes = await prisma.wish.findMany({
        where: {
          isPublic: true,
          status: 'active'
        },
        orderBy: {
          id: 'desc'
        },
        take: 20  // 只獲取前 20 個
        // 不包含 likes，避免複雜查詢
      })
    } else {
      wishes = await prisma.wish.findMany({
        where: {
          status: 'active'
        },
        orderBy: {
          id: 'desc'
        },
        take: 20  // 只獲取前 20 個
        // 不包含 likes，避免複雜查詢
      })
    }
    
    // 轉換數據格式
    const formattedWishes = wishes.map((wish: any) => ({
      ...wish,
      like_count: 0,  // 暫時設為 0，避免複雜查詢
      created_at: wish.createdAt.toISOString(),
      updated_at: wish.updatedAt.toISOString(),
      current_pain: wish.currentPain,
      expected_solution: wish.expectedSolution,
      expected_effect: wish.expectedEffect,
      is_public: wish.isPublic
    }))
    
    return NextResponse.json({ success: true, data: formattedWishes })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishes' },
      { status: 500 }
    )
  }
}
