// 清空所有本地存儲資料的腳本
// 執行此腳本將清除所有測試數據，讓應用回到初始狀態

console.log("🧹 開始清空所有測試資料...")

// 清空的資料項目
const dataKeys = [
  "wishes", // 所有許願/困擾案例
  "wishLikes", // 點讚數據
  "userLikedWishes", // 用戶點讚記錄
  "backgroundMusicState", // 背景音樂狀態
]

let clearedCount = 0

// 清空每個資料項目
dataKeys.forEach((key) => {
  const existingData = localStorage.getItem(key)
  if (existingData) {
    localStorage.removeItem(key)
    console.log(`✅ 已清空: ${key}`)
    clearedCount++
  } else {
    console.log(`ℹ️  ${key} 已經是空的`)
  }
})

// 顯示清理結果
console.log(`\n🎉 資料清理完成！`)
console.log(`📊 清理統計:`)
console.log(`   - 清空了 ${clearedCount} 個資料項目`)
console.log(`   - 檢查了 ${dataKeys.length} 個資料項目`)

// 驗證清理結果
console.log(`\n🔍 驗證清理結果:`)
dataKeys.forEach((key) => {
  const data = localStorage.getItem(key)
  if (data) {
    console.log(`❌ ${key}: 仍有資料殘留`)
  } else {
    console.log(`✅ ${key}: 已完全清空`)
  }
})

console.log(`\n🚀 應用程式已準備好進行正式佈署！`)
console.log(`💡 建議接下來的步驟:`)
console.log(`   1. 重新整理頁面確認所有資料已清空`)
console.log(`   2. 測試各個功能頁面的初始狀態`)
console.log(`   3. 確認沒有錯誤訊息或異常行為`)
console.log(`   4. 準備佈署到正式環境`)

// 提供重新載入頁面的選項
if (confirm("是否要重新載入頁面以確認清理效果？")) {
  window.location.reload()
}
