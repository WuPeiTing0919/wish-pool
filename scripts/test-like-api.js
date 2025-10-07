#!/usr/bin/env node

/**
 * 測試點讚 API
 */

async function testLikeAPI() {
  try {
    console.log('🔍 測試點讚 API...')
    console.log('')
    
    const testUserSession = `test_api_session_${Date.now()}`
    const testWishId = 6 // 使用存在的 Wish ID
    
    // 1. 測試檢查點讚狀態
    console.log('1️⃣ 測試檢查點讚狀態...')
    const checkResponse = await fetch(`http://localhost:3000/api/wishes/like?wishId=${testWishId}`, {
      headers: {
        'x-user-session': testUserSession
      }
    })
    
    const checkResult = await checkResponse.json()
    console.log(`✅ 檢查結果: ${checkResult.success ? '成功' : '失敗'}`)
    console.log(`   已點讚: ${checkResult.data?.liked || false}`)
    console.log('')
    
    // 2. 測試點讚
    console.log('2️⃣ 測試點讚...')
    const likeResponse = await fetch('http://localhost:3000/api/wishes/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-session': testUserSession
      },
      body: JSON.stringify({ wishId: testWishId })
    })
    
    const likeResult = await likeResponse.json()
    console.log(`✅ 點讚結果: ${likeResult.success ? '成功' : '失敗'}`)
    console.log(`   點讚狀態: ${likeResult.data?.liked || false}`)
    console.log('')
    
    // 3. 再次檢查點讚狀態
    console.log('3️⃣ 再次檢查點讚狀態...')
    const checkResponse2 = await fetch(`http://localhost:3000/api/wishes/like?wishId=${testWishId}`, {
      headers: {
        'x-user-session': testUserSession
      }
    })
    
    const checkResult2 = await checkResponse2.json()
    console.log(`✅ 檢查結果: ${checkResult2.success ? '成功' : '失敗'}`)
    console.log(`   已點讚: ${checkResult2.data?.liked || false}`)
    console.log('')
    
    // 4. 測試重複點讚
    console.log('4️⃣ 測試重複點讚...')
    const likeResponse2 = await fetch('http://localhost:3000/api/wishes/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-session': testUserSession
      },
      body: JSON.stringify({ wishId: testWishId })
    })
    
    const likeResult2 = await likeResponse2.json()
    console.log(`✅ 重複點讚結果: ${likeResult2.success ? '成功' : '失敗'}`)
    console.log(`   點讚狀態: ${likeResult2.data?.liked || false}`)
    console.log('')
    
    console.log('🎉 點讚 API 測試完成！')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message)
  }
}

// 執行測試
if (require.main === module) {
  testLikeAPI()
}

module.exports = { testLikeAPI }
