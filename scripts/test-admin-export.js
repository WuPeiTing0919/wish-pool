#!/usr/bin/env node

/**
 * 測試後台管理匯出功能
 */

async function testAdminExport() {
  try {
    console.log('🔍 測試後台管理匯出功能...')
    console.log('')
    
    // 1. 測試獲取數據
    console.log('1️⃣ 測試獲取困擾案例數據...')
    const wishesResponse = await fetch('http://localhost:3000/api/admin/wishes')
    const wishesResult = await wishesResponse.json()
    
    if (wishesResult.success) {
      console.log(`✅ 成功獲取 ${wishesResult.data.length} 筆困擾案例數據`)
    } else {
      console.log(`❌ 獲取失敗: ${wishesResult.error}`)
      return
    }
    console.log('')
    
    // 2. 測試獲取統計數據
    console.log('2️⃣ 測試獲取統計數據...')
    const statsResponse = await fetch('http://localhost:3000/api/admin/stats')
    const statsResult = await statsResponse.json()
    
    if (statsResult.success) {
      console.log(`✅ 成功獲取統計數據:`)
      console.log(`   總案例數: ${statsResult.data.totalWishes}`)
      console.log(`   公開案例: ${statsResult.data.publicWishes}`)
      console.log(`   私密案例: ${statsResult.data.privateWishes}`)
      console.log(`   總點讚數: ${statsResult.data.totalLikes}`)
      console.log(`   本週新增: ${statsResult.data.recentWishes}`)
    } else {
      console.log(`❌ 獲取統計失敗: ${statsResult.error}`)
    }
    console.log('')
    
    // 3. 測試 CSV 匯出
    console.log('3️⃣ 測試 CSV 匯出...')
    const exportResponse = await fetch('http://localhost:3000/api/admin/export-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: wishesResult.data.slice(0, 5), // 只匯出前5筆測試
        filename: 'test_export.csv'
      })
    })
    
    if (exportResponse.ok) {
      const csvContent = await exportResponse.text()
      console.log(`✅ CSV 匯出成功，內容長度: ${csvContent.length} 字元`)
      console.log(`   前100字元: ${csvContent.substring(0, 100)}...`)
    } else {
      console.log(`❌ CSV 匯出失敗: ${exportResponse.status}`)
    }
    console.log('')
    
    console.log('🎉 後台管理功能測試完成！')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message)
  }
}

// 執行測試
if (require.main === module) {
  testAdminExport()
}

module.exports = { testAdminExport }
