import { supabase, getUserSession, type Database } from "./supabase"
import type { ImageFile } from "./image-utils"

// 類型定義
export type Wish = Database["public"]["Tables"]["wishes"]["Row"] & {
  like_count?: number
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

// 困擾案例相關服務
export class WishService {
  // 獲取所有公開的困擾案例（帶點讚數）
  static async getPublicWishes(): Promise<Wish[]> {
    try {
      const { data, error } = await supabase
        .from("wishes_with_likes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (error) throw new SupabaseError("獲取公開困擾失敗", error)
      return data || []
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
      return data || []
    } catch (error) {
      console.error("Error fetching all wishes:", error)
      throw error
    }
  }

  // 創建新的困擾案例
  static async createWish(wishData: {
    title: string
    currentPain: string
    expectedSolution: string
    expectedEffect?: string
    isPublic?: boolean
    email?: string
    images?: ImageFile[]
  }): Promise<Wish> {
    try {
      // 轉換圖片數據格式
      const imageData =
        wishData.images?.map((img) => ({
          id: img.id,
          name: img.name,
          size: img.size,
          type: img.type,
          base64: img.base64 || img.url,
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
      return data
    } catch (error) {
      console.error("Error creating wish:", error)
      throw error
    }
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
}

// 點讚相關服務
export class LikeService {
  // 為困擾案例點讚
  static async likeWish(wishId: number): Promise<boolean> {
    try {
      const userSession = getUserSession()

      const { error } = await supabase.from("wish_likes").insert({
        wish_id: wishId,
        user_session: userSession,
      })

      if (error) {
        // 如果是重複點讚錯誤，返回 false
        if (error.code === "23505") {
          return false
        }
        throw new SupabaseError("點讚失敗", error)
      }

      return true
    } catch (error) {
      console.error("Error liking wish:", error)
      throw error
    }
  }

  // 檢查用戶是否已點讚
  static async hasUserLiked(wishId: number): Promise<boolean> {
    try {
      const userSession = getUserSession()

      const { data, error } = await supabase
        .from("wish_likes")
        .select("id")
        .eq("wish_id", wishId)
        .eq("user_session", userSession)
        .single()

      if (error && error.code !== "PGRST116") {
        throw new SupabaseError("檢查點讚狀態失敗", error)
      }

      return !!data
    } catch (error) {
      console.error("Error checking like status:", error)
      return false
    }
  }

  // 獲取困擾案例的點讚數
  static async getWishLikeCount(wishId: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("wish_likes")
        .select("*", { count: "exact", head: true })
        .eq("wish_id", wishId)

      if (error) throw new SupabaseError("獲取點讚數失敗", error)
      return count || 0
    } catch (error) {
      console.error("Error fetching like count:", error)
      return 0
    }
  }

  // 獲取用戶已點讚的困擾 ID 列表
  static async getUserLikedWishes(): Promise<number[]> {
    try {
      const userSession = getUserSession()

      const { data, error } = await supabase.from("wish_likes").select("wish_id").eq("user_session", userSession)

      if (error) throw new SupabaseError("獲取用戶點讚記錄失敗", error)
      return data?.map((item) => item.wish_id) || []
    } catch (error) {
      console.error("Error fetching user liked wishes:", error)
      return []
    }
  }
}

// 用戶設定相關服務
export class UserSettingsService {
  // 獲取用戶設定
  static async getUserSettings(): Promise<UserSettings | null> {
    try {
      const userSession = getUserSession()

      const { data, error } = await supabase.from("user_settings").select("*").eq("user_session", userSession).single()

      if (error && error.code !== "PGRST116") {
        throw new SupabaseError("獲取用戶設定失敗", error)
      }

      return data
    } catch (error) {
      console.error("Error fetching user settings:", error)
      return null
    }
  }

  // 更新或創建用戶設定
  static async updateUserSettings(settings: {
    backgroundMusicEnabled?: boolean
    backgroundMusicVolume?: number
    backgroundMusicPlaying?: boolean
  }): Promise<UserSettings> {
    try {
      const userSession = getUserSession()

      // 先嘗試更新
      const { data: updateData, error: updateError } = await supabase
        .from("user_settings")
        .update({
          background_music_enabled: settings.backgroundMusicEnabled,
          background_music_volume: settings.backgroundMusicVolume,
          background_music_playing: settings.backgroundMusicPlaying,
        })
        .eq("user_session", userSession)
        .select()
        .single()

      if (updateError && updateError.code === "PGRST116") {
        // 如果記錄不存在，創建新記錄
        const { data: insertData, error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_session: userSession,
            background_music_enabled: settings.backgroundMusicEnabled ?? false,
            background_music_volume: settings.backgroundMusicVolume ?? 0.3,
            background_music_playing: settings.backgroundMusicPlaying ?? false,
          })
          .select()
          .single()

        if (insertError) throw new SupabaseError("創建用戶設定失敗", insertError)
        return insertData
      }

      if (updateError) throw new SupabaseError("更新用戶設定失敗", updateError)
      return updateData
    } catch (error) {
      console.error("Error updating user settings:", error)
      throw error
    }
  }
}

// 數據遷移服務（從 localStorage 遷移到 Supabase）
export class MigrationService {
  // 遷移 localStorage 中的困擾案例到 Supabase
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
          await WishService.createWish({
            title: wish.title,
            currentPain: wish.currentPain,
            expectedSolution: wish.expectedSolution,
            expectedEffect: wish.expectedEffect,
            isPublic: wish.isPublic !== false, // 默認為 true
            email: wish.email,
            images: wish.images || [],
          })
          result.success++
        } catch (error) {
          result.failed++
          result.errors.push(`Failed to migrate wish "${wish.title}": ${error}`)
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
