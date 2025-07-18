// 重置應用到正式環境狀態
// 這個腳本會清空所有測試資料並設定適合正式環境的初始狀態

console.log("🔄 正在重置應用到正式環境狀態...")

// 1. 清空所有本地存儲資料
const dataKeys = ["wishes", "wishLikes", "userLikedWishes", "backgroundMusicState"]

dataKeys.forEach((key) => {
  localStorage.removeItem(key)
})

// 2. 設定正式環境的初始狀態
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
})

console.log("✅ 應用已重置到正式環境狀態")
console.log("📋 初始狀態設定:")
console.log("   - 困擾案例: 0 個")
console.log("   - 點讚記錄: 已清空")
console.log("   - 背景音樂: 預設關閉")

console.log("\n🎯 正式環境準備完成！")
console.log("🚀 可以開始佈署了")

// 重新載入頁面
setTimeout(() => {
  window.location.reload()
}, 2000)
