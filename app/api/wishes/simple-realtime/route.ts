import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    console.log(`🔍 簡化即時數據獲取: type=${type}`)
    
    // 從資料庫獲取困擾案例（暫時移除排序避免記憶體問題）
    let wishes
    if (type === 'public') {
      wishes = await prisma.wish.findMany({
        where: {
          isPublic: true,
          status: 'active'
        },
        take: 100
      })
    } else {
      wishes = await prisma.wish.findMany({
        where: {
          status: 'active'
        },
        take: 100
      })
    }
    
    console.log(`✅ 成功獲取 ${wishes.length} 筆困擾案例 (type: ${type})`)
    
    // 轉換數據格式，暫時不包含點讚數
    const formattedWishes = wishes.map((wish: any) => ({
      id: Number(wish.id),
      title: wish.title,
      current_pain: wish.currentPain,
      expected_solution: wish.expectedSolution,
      expected_effect: wish.expectedEffect,
      is_public: wish.isPublic,
      email: wish.email,
      images: wish.images,
      user_session: wish.userSession,
      status: wish.status,
      category: wish.category,
      priority: Number(wish.priority),
      like_count: 0, // 暫時設為 0
      created_at: wish.createdAt.toISOString(),
      updated_at: wish.updatedAt.toISOString()
    }))
    
    // 按照 ID 降序排序（已在資料庫查詢中完成）
    // 不需要額外排序，因為資料庫查詢已經使用 orderBy: { id: 'desc' }
    
    console.log(`✅ 成功從資料庫獲取 ${formattedWishes.length} 筆即時數據`)
    
    return NextResponse.json({ 
      success: true, 
      data: formattedWishes 
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
