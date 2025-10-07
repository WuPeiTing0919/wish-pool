import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    console.log(`🔍 從資料庫即時獲取數據: type=${type}`)
    
    // 使用原始 SQL 查詢避免 Prisma 的排序問題
    let wishes
    if (type === 'public') {
      wishes = await prisma.$queryRaw`
        SELECT id, title, current_pain, expected_solution, expected_effect, 
               is_public, email, images, user_session, status, category, priority,
               created_at, updated_at
        FROM wishes 
        WHERE is_public = true AND status = 'active'
        LIMIT 100
      `
    } else {
      wishes = await prisma.$queryRaw`
        SELECT id, title, current_pain, expected_solution, expected_effect, 
               is_public, email, images, user_session, status, category, priority,
               created_at, updated_at
        FROM wishes 
        WHERE status = 'active'
        LIMIT 100
      `
    }
    
    console.log(`✅ 成功獲取 ${(wishes as any[]).length} 筆困擾案例 (type: ${type})`)
    
    // 獲取所有困擾案例的點讚數
    const wishIds = (wishes as any[]).map(w => w.id)
    const likeCountMap = {}
    
    if (wishIds.length > 0) {
      // 使用 Prisma 的 findMany 而不是原始 SQL 查詢
      const likes = await prisma.wishLike.findMany({
        where: {
          wishId: { in: wishIds }
        },
        select: {
          wishId: true
        }
      })
      
      // 手動計算點讚數
      likes.forEach(like => {
        likeCountMap[Number(like.wishId)] = (likeCountMap[Number(like.wishId)] || 0) + 1
      })
    }
    
    // 轉換數據格式，處理 BigInt 序列化問題
    const formattedWishes = (wishes as any[]).map((wish) => ({
      id: Number(wish.id), // 轉換 BigInt 為 Number
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
      priority: Number(wish.priority), // 轉換 BigInt 為 Number
      like_count: likeCountMap[Number(wish.id)] || 0,
      created_at: wish.created_at ? new Date(wish.created_at).toISOString() : new Date().toISOString(),
      updated_at: wish.updated_at ? new Date(wish.updated_at).toISOString() : new Date().toISOString()
    }))
    
    // 按照 created_at 日期降序排序
    formattedWishes.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return dateB.getTime() - dateA.getTime()
    })
    
    console.log(`✅ 成功從資料庫獲取 ${formattedWishes.length} 筆即時數據`)
    
    return NextResponse.json({ 
      success: true, 
      data: formattedWishes 
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch real-time data from database' },
      { status: 500 }
    )
  }
}
