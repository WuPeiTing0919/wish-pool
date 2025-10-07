import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    let wishes
    if (type === 'public') {
      // 先獲取基本數據，避免複雜的 join 查詢
      const basicWishes = await prisma.wish.findMany({
        where: {
          isPublic: true,
          status: 'active'
        },
        orderBy: {
          id: 'desc'
        },
        take: 50  // 進一步限制數量
      })
      
      // 分別獲取點讚數據
      const wishIds = basicWishes.map(w => w.id)
      const likes = await prisma.wishLike.findMany({
        where: {
          wishId: { in: wishIds }
        }
      })
      
      // 手動組合數據
      wishes = basicWishes.map(wish => ({
        ...wish,
        likes: likes.filter(like => like.wishId === wish.id)
      }))
    } else {
      // 先獲取基本數據，避免複雜的 join 查詢
      const basicWishes = await prisma.wish.findMany({
        where: {
          status: 'active'
        },
        orderBy: {
          id: 'desc'
        },
        take: 50  // 進一步限制數量
      })
      
      // 分別獲取點讚數據
      const wishIds = basicWishes.map(w => w.id)
      const likes = await prisma.wishLike.findMany({
        where: {
          wishId: { in: wishIds }
        }
      })
      
      // 手動組合數據
      wishes = basicWishes.map(wish => ({
        ...wish,
        likes: likes.filter(like => like.wishId === wish.id)
      }))
    }
    
    // 轉換數據格式
    const formattedWishes = wishes.map((wish: any) => ({
      ...wish,
      like_count: wish.likes.length,
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
