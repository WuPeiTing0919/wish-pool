import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    console.log(`🔍 獲取真實數據: type=${type}`)
    
    // 使用動態導入來避免環境變數問題
    const { PrismaClient } = await import('@prisma/client')
    
    // 設定環境變數
    process.env.DATABASE_URL = "mysql://wish_pool:Aa123456@mysql.theaken.com:33306/db_wish_pool?schema=public"
    
    const prisma = new PrismaClient()
    
    try {
      // 使用簡單的查詢
      let wishes
      if (type === 'public') {
        wishes = await prisma.wish.findMany({
          where: {
            isPublic: true,
            status: 'active'
          },
          orderBy: { id: 'desc' },
          take: 100
        })
      } else {
        wishes = await prisma.wish.findMany({
          where: {
            status: 'active'
          },
          orderBy: { id: 'desc' },
          take: 100
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
      
    } finally {
      await prisma.$disconnect()
    }
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch real data' },
      { status: 500 }
    )
  }
}
