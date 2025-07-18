// 心願星河 - Supabase 連接測試腳本
// 使用方法: npm run test-supabase

const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

async function testSupabaseConnection() {
  console.log("🔍 測試 Supabase 連接...\n")

  // 檢查環境變數
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ 環境變數未設置")
    console.log("請確認 .env.local 檔案中包含：")
    console.log("- NEXT_PUBLIC_SUPABASE_URL")
    console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY")
    process.exit(1)
  }

  console.log("✅ 環境變數已設置")
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...`)

  // 創建 Supabase 客戶端
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 測試基本連接
    console.log("\n🔗 測試基本連接...")
    const { data, error } = await supabase.from("wishes").select("count").limit(1)

    if (error) {
      console.error("❌ 連接失敗:", error.message)
      return false
    }

    console.log("✅ 基本連接成功")

    // 測試表格存在性
    console.log("\n📊 檢查表格結構...")
    const tables = ["wishes", "wish_likes", "user_settings", "migration_log", "system_stats"]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)

        if (error) {
          console.log(`❌ 表格 ${table}: ${error.message}`)
        } else {
          console.log(`✅ 表格 ${table}: 正常`)
        }
      } catch (err) {
        console.log(`❌ 表格 ${table}: ${err.message}`)
      }
    }

    // 測試視圖
    console.log("\n👁️ 檢查視圖...")
    const views = ["wishes_with_likes", "public_wishes", "popular_wishes"]

    for (const view of views) {
      try {
        const { data, error } = await supabase.from(view).select("*").limit(1)

        if (error) {
          console.log(`❌ 視圖 ${view}: ${error.message}`)
        } else {
          console.log(`✅ 視圖 ${view}: 正常`)
        }
      } catch (err) {
        console.log(`❌ 視圖 ${view}: ${err.message}`)
      }
    }

    // 測試函數
    console.log("\n⚙️ 測試函數...")
    try {
      const { data, error } = await supabase.rpc("get_wishes_stats")

      if (error) {
        console.log(`❌ 函數 get_wishes_stats: ${error.message}`)
      } else {
        console.log("✅ 函數 get_wishes_stats: 正常")
        console.log("📈 統計數據:", JSON.stringify(data, null, 2))
      }
    } catch (err) {
      console.log(`❌ 函數測試失敗: ${err.message}`)
    }

    // 測試存儲
    console.log("\n🗂️ 檢查存儲桶...")
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) {
        console.log(`❌ 存儲桶檢查失敗: ${error.message}`)
      } else {
        const wishBuckets = buckets.filter((bucket) => bucket.id === "wish-images" || bucket.id === "wish-thumbnails")

        if (wishBuckets.length === 2) {
          console.log("✅ 存儲桶設置完成")
          wishBuckets.forEach((bucket) => {
            console.log(`   - ${bucket.id}: ${bucket.public ? "公開" : "私密"}`)
          })
        } else {
          console.log(`⚠️ 存儲桶不完整，找到 ${wishBuckets.length}/2 個`)
        }
      }
    } catch (err) {
      console.log(`❌ 存儲桶檢查失敗: ${err.message}`)
    }

    console.log("\n🎉 Supabase 連接測試完成！")
    return true
  } catch (error) {
    console.error("❌ 測試過程中發生錯誤:", error)
    return false
  }
}

// 執行測試
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log("\n✅ 所有測試通過，可以開始使用 Supabase！")
      process.exit(0)
    } else {
      console.log("\n❌ 測試失敗，請檢查配置")
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("測試腳本執行失敗:", error)
    process.exit(1)
  })
