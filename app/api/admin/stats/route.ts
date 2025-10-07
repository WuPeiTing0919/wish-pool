import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 後台管理 - 獲取統計數據...')
    
    // 獲取基本統計
    const totalWishes = await prisma.wish.count({
      where: { status: 'active' }
    })
    
    const publicWishes = await prisma.wish.count({
      where: { 
        status: 'active',
        isPublic: true 
      }
    })
    
    const privateWishes = totalWishes - publicWishes
    
    // 獲取總點讚數
    const totalLikes = await prisma.wishLike.count()
    
    // 獲取本週新增（最近7天）
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const recentWishes = await prisma.wish.count({
      where: {
        status: 'active',
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })
    
    // 獲取所有困擾案例進行自動分類
    const allWishes = await prisma.wish.findMany({
      where: { 
        status: 'active'
      },
      select: {
        id: true,
        title: true,
        currentPain: true,
        expectedSolution: true,
        category: true
      }
    })
    
    // 導入分類函數
    const { categorizeWishMultiple } = await import('@/lib/categorization')
    
    // 對每個困擾案例進行分類
    const categories: { [key: string]: number } = {}
    
    allWishes.forEach(wish => {
      // 如果資料庫中已有分類，使用資料庫的分類
      if (wish.category && wish.category !== 'NULL' && wish.category !== '') {
        categories[wish.category] = (categories[wish.category] || 0) + 1
      } else {
        // 否則進行自動分類
        const wishData = {
          title: wish.title,
          currentPain: wish.currentPain,
          expectedSolution: wish.expectedSolution
        }
        
        const categories_result = categorizeWishMultiple(wishData)
        if (categories_result.length > 0) {
          // 使用第一個分類的名稱，但排除「其他問題」
          const primaryCategory = categories_result[0].name
          if (primaryCategory !== '其他問題') {
            categories[primaryCategory] = (categories[primaryCategory] || 0) + 1
          }
        }
        // 注意：不統計「其他問題」和「未分類」的案例
      }
    })
    
    const stats = {
      totalWishes,
      publicWishes,
      privateWishes,
      totalLikes,
      recentWishes,
      categories
    }
    
    console.log(`✅ 成功獲取統計數據: 總計 ${totalWishes} 個困擾案例`)
    
    return NextResponse.json({ 
      success: true, 
      data: stats 
    })
    
  } catch (error) {
    console.error('後台管理統計 API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
