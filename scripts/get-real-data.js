#!/usr/bin/env node

/**
 * 獲取真實數據並保存為 JSON 文件
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// 設定環境變數
process.env.DATABASE_URL = "mysql://wish_pool:Aa123456@mysql.theaken.com:33306/db_wish_pool?schema=public"

async function getRealData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 獲取真實數據...')
    
    // 使用原始 SQL 查詢，避免排序問題
    const allWishes = await prisma.$queryRaw`
      SELECT id, title, current_pain, expected_solution, expected_effect, 
             is_public, email, images, user_session, status, category, priority,
             created_at, updated_at
      FROM wishes 
      WHERE status = 'active'
      LIMIT 100
    `
    
    const publicWishes = await prisma.$queryRaw`
      SELECT id, title, current_pain, expected_solution, expected_effect, 
             is_public, email, images, user_session, status, category, priority,
             created_at, updated_at
      FROM wishes 
      WHERE is_public = true AND status = 'active'
      LIMIT 100
    `
    
    console.log(`✅ 總計: ${allWishes.length} 筆`)
    console.log(`✅ 公開: ${publicWishes.length} 筆`)
    console.log(`✅ 私密: ${allWishes.length - publicWishes.length} 筆`)
    
    // 獲取所有困擾案例的點讚數
    console.log('🔍 獲取點讚數據...')
    const likeCounts = await prisma.$queryRaw`
      SELECT wish_id, COUNT(*) as count
      FROM wish_likes
      GROUP BY wish_id
    `
    
    // 創建點讚數映射
    const likeCountMap = {}
    likeCounts.forEach((item) => {
      likeCountMap[Number(item.wish_id)] = Number(item.count)
    })
    
    console.log(`✅ 獲取到 ${Object.keys(likeCountMap).length} 個困擾案例的點讚數據`)
    
    // 轉換數據格式
    const formatWishes = (wishes) => {
      return wishes.map((wish) => ({
        id: Number(wish.id),  // 轉換 BigInt 為 Number
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
        like_count: likeCountMap[Number(wish.id)] || 0,  // 使用真實的點讚數
        created_at: wish.created_at ? new Date(wish.created_at).toISOString() : new Date().toISOString(),
        updated_at: wish.updated_at ? new Date(wish.updated_at).toISOString() : new Date().toISOString()
      }))
    }
    
    const formattedAllWishes = formatWishes(allWishes)
    const formattedPublicWishes = formatWishes(publicWishes)
    
    // 按照 created_at 日期降序排序（最新的在前面）
    formattedAllWishes.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return dateB.getTime() - dateA.getTime() // 降序排序
    })
    
    formattedPublicWishes.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return dateB.getTime() - dateA.getTime() // 降序排序
    })
    
    // 保存為 JSON 文件
    const dataDir = path.join(__dirname, '..', 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'all-wishes.json'),
      JSON.stringify({ success: true, data: formattedAllWishes }, null, 2)
    )
    
    fs.writeFileSync(
      path.join(dataDir, 'public-wishes.json'),
      JSON.stringify({ success: true, data: formattedPublicWishes }, null, 2)
    )
    
    console.log('✅ 數據已保存到 data/ 目錄')
    
    // 顯示點讚統計
    const totalLikes = formattedAllWishes.reduce((sum, wish) => sum + wish.like_count, 0)
    const publicLikes = formattedPublicWishes.reduce((sum, wish) => sum + wish.like_count, 0)
    console.log(`📊 點讚統計: 總計 ${totalLikes} 個，公開 ${publicLikes} 個`)
    
  } catch (error) {
    console.error('❌ 獲取數據失敗:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行
if (require.main === module) {
  getRealData()
}

module.exports = { getRealData }
