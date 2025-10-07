import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 後台管理 - 獲取所有困擾案例數據...')
    
    // 獲取所有困擾案例（包含私密的）
    const wishes = await prisma.$queryRaw`
      SELECT id, title, current_pain, expected_solution, expected_effect, 
             is_public, email, images, user_session, status, category, priority,
             created_at, updated_at
      FROM wishes 
      WHERE status = 'active'
      ORDER BY id DESC
      LIMIT 1000
    `
    
    // 獲取點讚數
    const wishIds = (wishes as any[]).map(w => w.id)
    const likeCountMap = {}
    
    if (wishIds.length > 0) {
      const likes = await prisma.wishLike.findMany({
        where: {
          wishId: { in: wishIds }
        },
        select: {
          wishId: true
        }
      })
      
      // 計算點讚數
      likes.forEach(like => {
        likeCountMap[Number(like.wishId)] = (likeCountMap[Number(like.wishId)] || 0) + 1
      })
    }
    
    // 轉換數據格式
    const formattedWishes = (wishes as any[]).map((wish) => ({
      id: Number(wish.id),
      title: wish.title,
      current_pain: wish.current_pain,
      expected_solution: wish.expected_solution,
      expected_effect: wish.expected_effect,
      is_public: Boolean(wish.is_public),
      email: wish.email,
      images: wish.images,
      user_session: wish.user_session,
      status: wish.status,
      category: wish.category,
      priority: Number(wish.priority),
      like_count: likeCountMap[Number(wish.id)] || 0,
      created_at: wish.created_at ? new Date(wish.created_at).toISOString() : new Date().toISOString(),
      updated_at: wish.updated_at ? new Date(wish.updated_at).toISOString() : new Date().toISOString()
    }))
    
    console.log(`✅ 成功獲取 ${formattedWishes.length} 筆困擾案例數據`)
    
    return NextResponse.json({ 
      success: true, 
      data: formattedWishes 
    })
    
  } catch (error) {
    console.error('後台管理 API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin data' },
      { status: 500 }
    )
  }
}
