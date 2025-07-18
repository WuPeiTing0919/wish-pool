import { supabase, type Database } from "./supabase"
import { SupabaseImageService, ImageMigrationService, type SupabaseImageFile } from "./supabase-image-utils"

// 更新的 Wish 類型定義
export type Wish = Database["public"]["Tables"]["wishes"]["Row"] & {
  like_count?: number
  images?: SupabaseImageFile[] // 使用新的圖片類型
}

export type WishInsert = Database["public"]["Tables"]["wishes"]["Insert"]
export type WishLike = Database["public"]["Tables"]["wish_likes"]["Row"]
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]

// 錯誤處理
export class SupabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message)
    this.name = "SupabaseError"
  }
}

// 更新的困擾案例服務
export class WishService {
  // 獲取所有公開的困擾案例（帶點讚數和圖片）
  static async getPublicWishes(): Promise<Wish[]> {
    try {
      const { data, error } = await supabase
        .from("wishes_with_likes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (error) throw new SupabaseError("獲取公開困擾失敗", error)

      // 轉換圖片格式
      return (data || []).map((wish) => ({
        ...wish,
        images: this.parseImages(wish.images),
      }))
    } catch (error) {
      console.error("Error fetching public wishes:", error)
      throw error
    }
  }

  // 獲取所有困擾案例（用於分析，包含私密的）
  static async getAllWishes(): Promise<Wish[]> {
    try {
      const { data, error } = await supabase
        .from("wishes_with_likes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw new SupabaseError("獲取所有困擾失敗", error)

      // 轉換圖片格式
      return (data || []).map((wish) => ({
        ...wish,
        images: this.parseImages(wish.images),
      }))
    } catch (error) {
      console.error("Error fetching all wishes:", error)
      throw error
    }
  }

  // 創建新的困擾案例（支持 Supabase Storage 圖片）
  static async createWish(wishData: {
    title: string
    currentPain: string
    expectedSolution: string
    expectedEffect?: string
    isPublic?: boolean
    email?: string
    images?: SupabaseImageFile[]
  }): Promise<Wish> {
    try {
      // 準備圖片數據
      const imageData =
        wishData.images?.map((img) => ({
          id: img.id,
          name: img.name,
          size: img.size,
          type: img.type,
          storage_path: img.storage_path,
          public_url: img.public_url,
          uploaded_at: img.uploaded_at,
        })) || []

      const insertData: WishInsert = {
        title: wishData.title,
        current_pain: wishData.currentPain,
        expected_solution: wishData.expectedSolution,
        expected_effect: wishData.expectedEffect || null,
        is_public: wishData.isPublic ?? true,
        email: wishData.email || null,
        images: imageData,
      }

      const { data, error } = await supabase.from("wishes").insert(insertData).select().single()

      if (error) throw new SupabaseError("創建困擾失敗", error)

      return {
        ...data,
        images: this.parseImages(data.images),
      }
    } catch (error) {
      console.error("Error creating wish:", error)
      throw error
    }
  }

  // 解析圖片數據
  private static parseImages(imagesData: any): SupabaseImageFile[] {
    if (!imagesData || !Array.isArray(imagesData)) return []

    return imagesData.map((img) => ({
      id: img.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: img.name || "unknown.jpg",
      size: img.size || 0,
      type: img.type || "image/jpeg",
      storage_path: img.storage_path || "",
      public_url: img.public_url || img.url || "", // 向後兼容
      uploaded_at: img.uploaded_at || new Date().toISOString(),
    }))
  }

  // 獲取統計數據
  static async getWishesStats() {
    try {
      const { data, error } = await supabase.rpc("get_wishes_stats")

      if (error) throw new SupabaseError("獲取統計數據失敗", error)
      return data
    } catch (error) {
      console.error("Error fetching wishes stats:", error)
      throw error
    }
  }

  // 刪除困擾案例（包括相關圖片）
  static async deleteWish(wishId: number): Promise<boolean> {
    try {
      // 先獲取困擾案例的圖片信息
      const { data: wish, error: fetchError } = await supabase.from("wishes").select("images").eq("id", wishId).single()

      if (fetchError) throw new SupabaseError("獲取困擾案例失敗", fetchError)

      // 刪除相關圖片
      if (wish.images && Array.isArray(wish.images)) {
        const storagePaths = wish.images.map((img: any) => img.storage_path).filter((path: string) => path)

        if (storagePaths.length > 0) {
          await SupabaseImageService.deleteImages(storagePaths)
        }
      }

      // 刪除困擾案例記錄
      const { error: deleteError } = await supabase.from("wishes").delete().eq("id", wishId)

      if (deleteError) throw new SupabaseError("刪除困擾案例失敗", deleteError)

      return true
    } catch (error) {
      console.error("Error deleting wish:", error)
      throw error
    }
  }
}

// 更新的數據遷移服務
export class MigrationService {
  // 遷移 localStorage 中的困擾案例到 Supabase（包括圖片遷移）
  static async migrateWishesFromLocalStorage(): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    try {
      const localWishes = JSON.parse(localStorage.getItem("wishes") || "[]")

      if (localWishes.length === 0) {
        console.log("No local wishes to migrate")
        return result
      }

      console.log(`Starting migration of ${localWishes.length} wishes...`)

      for (const wish of localWishes) {
        try {
          let migratedImages: SupabaseImageFile[] = []

          // 遷移圖片（如果有的話）
          if (wish.images && Array.isArray(wish.images) && wish.images.length > 0) {
            console.log(`Migrating ${wish.images.length} images for wish: ${wish.title}`)

            const imageMigrationResult = await ImageMigrationService.migrateImagesFromWish(wish.images)

            migratedImages = imageMigrationResult.successful

            if (imageMigrationResult.failed.length > 0) {
              console.warn(`Failed to migrate ${imageMigrationResult.failed.length} images for wish: ${wish.title}`)
              // 記錄圖片遷移失敗，但不阻止整個 wish 的遷移
              result.errors.push(`部分圖片遷移失敗 "${wish.title}": ${imageMigrationResult.failed.length} 張圖片`)
            }
          }

          // 創建困擾案例
          await WishService.createWish({
            title: wish.title,
            currentPain: wish.currentPain,
            expectedSolution: wish.expectedSolution,
            expectedEffect: wish.expectedEffect,
            isPublic: wish.isPublic !== false,
            email: wish.email,
            images: migratedImages,
          })

          result.success++
          console.log(`Successfully migrated wish: ${wish.title}`)
        } catch (error) {
          result.failed++
          result.errors.push(`Failed to migrate wish "${wish.title}": ${error}`)
          console.error(`Failed to migrate wish "${wish.title}":`, error)
        }
      }

      console.log(`Migration completed: ${result.success} success, ${result.failed} failed`)
      return result
    } catch (error) {
      console.error("Migration error:", error)
      result.errors.push(`Migration process failed: ${error}`)
      return result
    }
  }

  // 清空 localStorage 中的舊數據
  static clearLocalStorageData(): void {
    const keysToRemove = ["wishes", "wishLikes", "userLikedWishes"]
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })
    console.log("Local storage data cleared")
  }
}

// 存儲健康檢查服務
export class StorageHealthService {
  // 檢查 Supabase Storage 健康狀態
  static async checkStorageHealth(): Promise<{
    healthy: boolean
    stats?: { totalFiles: number; totalSize: number }
    error?: string
  }> {
    try {
      const healthCheck = await SupabaseImageService.checkStorageHealth()
      if (!healthCheck.healthy) {
        return { healthy: false, error: healthCheck.error }
      }

      const stats = await SupabaseImageService.getStorageStats()
      return {
        healthy: true,
        stats: {
          totalFiles: stats.totalFiles,
          totalSize: stats.totalSize,
        },
        error: stats.error,
      }
    } catch (error) {
      return { healthy: false, error: `健康檢查失敗: ${error}` }
    }
  }

  // 清理孤立的圖片
  static async cleanupOrphanedImages(): Promise<{ cleaned: number; error?: string }> {
    try {
      const { data, error } = await supabase.rpc("cleanup_orphaned_images")

      if (error) {
        return { cleaned: 0, error: error.message }
      }

      return { cleaned: data || 0 }
    } catch (error) {
      return { cleaned: 0, error: `清理過程失敗: ${error}` }
    }
  }
}
