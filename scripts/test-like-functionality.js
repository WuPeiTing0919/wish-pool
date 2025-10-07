#!/usr/bin/env node

/**
 * 測試點讚功能
 */

const { PrismaClient } = require('@prisma/client')

// 設定環境變數
process.env.DATABASE_URL = "mysql://wish_pool:Aa123456@mysql.theaken.com:33306/db_wish_pool?schema=public"

async function testLikeFunctionality() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 測試點讚功能...')
    console.log('')
    
    // 1. 檢查現有的點讚記錄
    console.log('1️⃣ 檢查現有的點讚記錄...')
    const existingLikes = await prisma.wishLike.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`✅ 現有 ${existingLikes.length} 筆點讚記錄`)
    existingLikes.forEach((like, index) => {
      console.log(`   ${index + 1}. Wish ID: ${like.wishId}, Session: ${like.userSession.substring(0, 20)}...`)
    })
    console.log('')
    
    // 2. 測試創建點讚記錄
    console.log('2️⃣ 測試創建點讚記錄...')
    // 先獲取一個存在的 Wish ID
    const existingWish = await prisma.wish.findFirst()
    if (!existingWish) {
      console.log('❌ 沒有找到任何困擾案例')
      return
    }
    const testWishId = existingWish.id
    const testUserSession = `test_session_${Date.now()}`
    
    console.log(`   使用 Wish ID: ${testWishId}`)
    
    try {
      const newLike = await prisma.wishLike.create({
        data: {
          wishId: testWishId,
          userSession: testUserSession
        }
      })
      console.log(`✅ 成功創建點讚記錄: ID ${newLike.id}`)
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️ 點讚記錄已存在（重複點讚）')
      } else {
        throw error
      }
    }
    console.log('')
    
    // 3. 測試查詢點讚記錄
    console.log('3️⃣ 測試查詢點讚記錄...')
    const foundLike = await prisma.wishLike.findFirst({
      where: {
        wishId: testWishId,
        userSession: testUserSession
      }
    })
    
    if (foundLike) {
      console.log(`✅ 成功找到點讚記錄: ID ${foundLike.id}`)
    } else {
      console.log('❌ 未找到點讚記錄')
    }
    console.log('')
    
    // 4. 統計點讚數量
    console.log('4️⃣ 統計點讚數量...')
    const likeCount = await prisma.wishLike.count({
      where: { wishId: testWishId }
    })
    console.log(`✅ Wish ID ${testWishId} 的點讚數量: ${likeCount}`)
    console.log('')
    
    console.log('🎉 點讚功能測試完成！')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message)
    console.error('詳細錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行測試
if (require.main === module) {
  testLikeFunctionality()
}

module.exports = { testLikeFunctionality }
