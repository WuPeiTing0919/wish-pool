import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    console.log(`🔍 獲取真實數據: type=${type}`)
    
    // 使用簡單的查詢，避免排序緩衝區問題
    let wishes
    if (type === 'public') {
      // 獲取公開的困擾案例，使用 id 排序避免內存問題
      wishes = await prisma.wish.findMany({
        where: {
          isPublic: true,
          status: 'active'
        },
        orderBy: { id: 'desc' },
        take: 100  // 限制數量
      })
    } else {
      // 獲取所有困擾案例，使用 id 排序避免內存問題
      wishes = await prisma.wish.findMany({
        where: {
          status: 'active'
        },
        orderBy: { id: 'desc' },
        take: 100  // 限制數量
      })
    }
    
    console.log(`✅ 成功獲取 ${wishes.length} 筆真實數據`)
    
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
      { success: false, error: 'Failed to fetch real data' },
      { status: 500 }
    )
  }
}
