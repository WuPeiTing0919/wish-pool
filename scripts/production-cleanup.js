// 正式環境佈署前的完整資料清理腳本
// 執行此腳本將清除所有測試資料，重置到正式環境狀態

console.log("🚀 開始準備正式環境佈署...")
console.log("=".repeat(50))

// 1. 清空所有本地存儲資料
console.log("📋 第一步：清理本地存儲資料")

const dataKeys = [
  "wishes", // 所有許願/困擾案例
  "wishLikes", // 點讚數據
  "userLikedWishes", // 用戶點讚記錄
  "backgroundMusicState", // 背景音樂狀態
]

let clearedCount = 0
let totalDataSize = 0

// 計算清理前的資料大小
dataKeys.forEach((key) => {
  const data = localStorage.getItem(key)
  if (data) {
    totalDataSize += data.length
  }
})

console.log(`📊 清理前資料統計:`)
console.log(`   - 總資料大小: ${(totalDataSize / 1024).toFixed(2)} KB`)

// 清空每個資料項目
dataKeys.forEach((key) => {
  const existingData = localStorage.getItem(key)
  if (existingData) {
    const dataSize = existingData.length
    localStorage.removeItem(key)
    console.log(`✅ 已清空: ${key} (${(dataSize / 1024).toFixed(2)} KB)`)
    clearedCount++
  } else {
    console.log(`ℹ️  ${key} 已經是空的`)
  }
})

console.log("\n" + "=".repeat(50))

// 2. 設定正式環境的初始狀態
console.log("⚙️  第二步：設定正式環境初始狀態")

const productionDefaults = {
  wishes: [],
  wishLikes: {},
  userLikedWishes: [],
  backgroundMusicState: {
    enabled: false,
    volume: 0.3,
    isPlaying: false,
  },
}

// 設定初始狀態
Object.entries(productionDefaults).forEach(([key, value]) => {
  localStorage.setItem(key, JSON.stringify(value))
  console.log(`✅ 已設定: ${key} 初始狀態`)
})

console.log("\n" + "=".repeat(50))

// 3. 驗證清理結果
console.log("🔍 第三步：驗證清理結果")

let verificationPassed = true

dataKeys.forEach((key) => {
  const data = localStorage.getItem(key)
  if (data) {
    const parsedData = JSON.parse(data)

    // 檢查是否為空狀態
    if (key === "wishes" && Array.isArray(parsedData) && parsedData.length === 0) {
      console.log(`✅ ${key}: 已重置為空陣列`)
    } else if (
      (key === "wishLikes" || key === "userLikedWishes") &&
      ((Array.isArray(parsedData) && parsedData.length === 0) ||
        (typeof parsedData === "object" && Object.keys(parsedData).length === 0))
    ) {
      console.log(`✅ ${key}: 已重置為空狀態`)
    } else if (key === "backgroundMusicState" && typeof parsedData === "object") {
      console.log(`✅ ${key}: 已重置為預設狀態`)
    } else {
      console.log(`❌ ${key}: 狀態異常`)
      verificationPassed = false
    }
  } else {
    console.log(`❌ ${key}: 資料遺失`)
    verificationPassed = false
  }
})

console.log("\n" + "=".repeat(50))

// 4. 顯示最終結果
console.log("🎉 清理完成報告:")
console.log(`📊 清理統計:`)
console.log(`   - 清空了 ${clearedCount} 個資料項目`)
console.log(`   - 檢查了 ${dataKeys.length} 個資料項目`)
console.log(`   - 釋放了 ${(totalDataSize / 1024).toFixed(2)} KB 空間`)
console.log(`   - 驗證結果: ${verificationPassed ? "✅ 通過" : "❌ 失敗"}`)

console.log("\n🚀 正式環境準備狀態:")
console.log("   ✅ 困擾案例: 0 個")
console.log("   ✅ 點讚記錄: 已清空")
console.log("   ✅ 背景音樂: 預設關閉")
console.log("   ✅ 本地存儲: 已重置")

console.log("\n" + "=".repeat(50))

if (verificationPassed) {
  console.log("🎯 佈署準備完成！")
  console.log("✨ 應用程式已準備好進行正式佈署")
  console.log("\n📋 建議的佈署檢查清單:")
  console.log("   □ 重新整理頁面確認所有資料已清空")
  console.log("   □ 測試各個功能頁面的初始狀態")
  console.log("   □ 確認沒有錯誤訊息或異常行為")
  console.log("   □ 檢查響應式設計在各裝置正常")
  console.log("   □ 測試音效和背景音樂功能")
  console.log("   □ 驗證隱私設定功能")
  console.log("   □ 準備佈署到正式環境")

  // 提供重新載入頁面的選項
  setTimeout(() => {
    if (confirm("✅ 清理完成！是否要重新載入頁面以確認效果？")) {
      window.location.reload()
    }
  }, 2000)
} else {
  console.log("⚠️  清理過程中發現問題，請檢查後重新執行")
}

console.log("\n🌟 感謝使用心願星河！準備為用戶提供優質服務！")
