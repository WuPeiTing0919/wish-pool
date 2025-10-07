import { PrismaClient } from '@prisma/client'
import type { ImageFile } from './image-utils'
import { StatisticsService } from './statistics-service'

// 創建 Prisma 客戶端實例
const prisma = new PrismaClient()

// 類型定義
export type Wish = {
  id: number
  title: string
  current_pain: string
  expected_solution: string
  expected_effect: string | null
  is_public: boolean
  email: string | null
  images: any[] | null
  user_session: string
  status: string
  category: string | null
  priority: number
  created_at: Date
  updated_at: Date
  like_count?: number
}

export type WishInsert = {
  title: string
  current_pain: string
  expected_solution: string
  expected_effect?: string | null
  is_public?: boolean
  email?: string | null
  images?: any[] | null
  user_session: string
  status?: string
  category?: string | null
  priority?: number
}

export type WishLike = {
  id: number
  wish_id: number
  user_session: string
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

export type UserSettings = {
  id: number
  user_session: string
  background_music_enabled: boolean
  background_music_volume: number
  background_music_playing: boolean
  theme_preference: string
  language_preference: string
  notification_enabled: boolean
  created_at: Date
  updated_at: Date
}

// 錯誤處理
export class MySQLServiceError extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message)
    this.name = "MySQLServiceError"
  }
}

// 生成用戶會話 ID（用於匿名識別）
export function getUserSession(): string {
  if (typeof window === "undefined") return "server-session"

  let session = localStorage.getItem("user_session")
  if (!session) {
    session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("user_session", session)
  }
  return session
}

// 困擾案例相關服務
export class WishService {
  // 獲取所有公開的困擾案例（帶點讚數）
  static async getPublicWishes(): Promise<Wish[]> {
    try {
      const wishes = await prisma.wish.findMany({
        where: {
          isPublic: true,
          status: 'active'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          likes: true
        }
      })

      // 添加點讚數
      return wishes.map((wish: any) => ({
        ...wish,
        like_count: wish.likes.length
      }))
    } catch (error) {
      console.error("Error fetching public wishes:", error)
      throw new MySQLServiceError("獲取公開困擾失敗", error)
    }
  }

  // 獲取所有困擾案例（用於分析，包含私密的）
  static async getAllWishes(): Promise<Wish[]> {
    try {
      const wishes = await prisma.wish.findMany({
        where: {
          status: 'active'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          likes: true
        }
      })

      // 添加點讚數
      return wishes.map((wish: any) => ({
        ...wish,
        like_count: wish.likes.length
      }))
    } catch (error) {
      console.error("Error fetching all wishes:", error)
      throw new MySQLServiceError("獲取所有困擾失敗", error)
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
      const imageData = wishData.images?.map((img) => ({
        id: img.id,
        name: img.name,
        size: img.size,
        type: img.type,
        base64: img.base64 || img.url,
      })) || []

      const userSession = getUserSession()

      const wish = await prisma.wish.create({
        data: {
          title: wishData.title,
          currentPain: wishData.currentPain,
          expectedSolution: wishData.expectedSolution,
          expectedEffect: wishData.expectedEffect || null,
          isPublic: wishData.isPublic ?? true,
          email: wishData.email || null,
          images: imageData,
          userSession: userSession,
          status: 'active',
          priority: 3
        },
        include: {
          likes: true
        }
      })

      // 更新統計數據
      await StatisticsService.updateWishStats(Number(wish.id), 'create', wishData.isPublic ?? true)

      return {
        ...wish,
        like_count: wish.likes.length
      }
    } catch (error) {
      console.error("Error creating wish:", error)
      throw new MySQLServiceError("創建困擾失敗", error)
    }
  }

  // 獲取統計數據
  static async getWishesStats() {
    try {
      const result = await prisma.$queryRaw`
        CALL GetWishesStats()
      `
      return result
    } catch (error) {
      console.error("Error fetching wishes stats:", error)
      throw new MySQLServiceError("獲取統計數據失敗", error)
    }
  }

  // 根據 ID 獲取困擾案例
  static async getWishById(id: number): Promise<Wish | null> {
    try {
      const wish = await prisma.wish.findUnique({
        where: { id },
        include: {
          likes: true
        }
      })

      if (!wish) return null

      return {
        ...wish,
        like_count: wish.likes.length
      }
    } catch (error) {
      console.error("Error fetching wish by id:", error)
      throw new MySQLServiceError("獲取困擾案例失敗", error)
    }
  }

  // 更新困擾案例
  static async updateWish(id: number, data: Partial<WishInsert>): Promise<Wish> {
    try {
      const wish = await prisma.wish.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          likes: true
        }
      })

      return {
        ...wish,
        like_count: wish.likes.length
      }
    } catch (error) {
      console.error("Error updating wish:", error)
      throw new MySQLServiceError("更新困擾案例失敗", error)
    }
  }

  // 刪除困擾案例
  static async deleteWish(id: number): Promise<boolean> {
    try {
      await prisma.wish.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error("Error deleting wish:", error)
      throw new MySQLServiceError("刪除困擾案例失敗", error)
    }
  }
}

// 點讚相關服務
export class LikeService {
  // 為困擾案例點讚
  static async likeWish(wishId: number): Promise<boolean> {
    try {
      const userSession = getUserSession()

      await prisma.wishLike.create({
        data: {
          wishId: wishId,
          userSession: userSession,
        }
      })

      // 更新統計數據
      await StatisticsService.updateLikeStats(wishId, 'create')

      return true
    } catch (error: any) {
      // 如果是重複點讚錯誤，返回 false
      if (error.code === 'P2002') {
        return false
      }
      console.error("Error liking wish:", error)
      throw new MySQLServiceError("點讚失敗", error)
    }
  }

  // 取消點讚
  static async unlikeWish(wishId: number): Promise<boolean> {
    try {
      const userSession = getUserSession()

      const result = await prisma.wishLike.deleteMany({
        where: {
          wishId: wishId,
          userSession: userSession
        }
      })

      if (result.count > 0) {
        // 更新統計數據
        await StatisticsService.updateLikeStats(wishId, 'delete')
        return true
      }
      return false
    } catch (error) {
      console.error("Error unliking wish:", error)
      throw new MySQLServiceError("取消點讚失敗", error)
    }
  }

  // 檢查用戶是否已點讚
  static async hasUserLiked(wishId: number): Promise<boolean> {
    try {
      const userSession = getUserSession()

      const like = await prisma.wishLike.findFirst({
        where: {
          wishId: wishId,
          userSession: userSession
        }
      })

      return !!like
    } catch (error) {
      console.error("Error checking like status:", error)
      return false
    }
  }

  // 獲取困擾案例的點讚數
  static async getWishLikeCount(wishId: number): Promise<number> {
    try {
      const count = await prisma.wishLike.count({
        where: {
          wish_id: wishId
        }
      })

      return count
    } catch (error) {
      console.error("Error fetching like count:", error)
      return 0
    }
  }

  // 獲取用戶已點讚的困擾 ID 列表
  static async getUserLikedWishes(): Promise<number[]> {
    try {
      const userSession = getUserSession()

      const likes = await prisma.wishLike.findMany({
        where: {
          userSession: userSession
        },
        select: {
          wishId: true
        }
      })

      return likes.map((like: any) => like.wishId)
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

      const settings = await prisma.userSetting.findUnique({
        where: {
          userSession: userSession
        }
      })

      return settings
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
    themePreference?: string
    languagePreference?: string
    notificationEnabled?: boolean
  }): Promise<UserSettings> {
    try {
      const userSession = getUserSession()

      const userSettings = await prisma.userSetting.upsert({
        where: {
          userSession: userSession
        },
        update: {
          backgroundMusicEnabled: settings.backgroundMusicEnabled,
          backgroundMusicVolume: settings.backgroundMusicVolume,
          backgroundMusicPlaying: settings.backgroundMusicPlaying,
          themePreference: settings.themePreference,
          languagePreference: settings.languagePreference,
          notificationEnabled: settings.notificationEnabled,
        },
        create: {
          userSession: userSession,
          backgroundMusicEnabled: settings.backgroundMusicEnabled ?? false,
          backgroundMusicVolume: settings.backgroundMusicVolume ?? 0.3,
          backgroundMusicPlaying: settings.backgroundMusicPlaying ?? false,
          themePreference: settings.themePreference ?? 'auto',
          languagePreference: settings.languagePreference ?? 'zh-TW',
          notificationEnabled: settings.notificationEnabled ?? true,
        }
      })

      return userSettings
    } catch (error) {
      console.error("Error updating user settings:", error)
      throw new MySQLServiceError("更新用戶設定失敗", error)
    }
  }
}

// 數據遷移服務（從 Supabase 遷移到 MySQL）
export class MigrationService {
  // 遷移 Supabase 數據到 MySQL
  static async migrateFromSupabase(supabaseData: any[]): Promise<{
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
      console.log(`Starting migration of ${supabaseData.length} wishes...`)

      for (const wish of supabaseData) {
        try {
          await WishService.createWish({
            title: wish.title,
            currentPain: wish.current_pain,
            expectedSolution: wish.expected_solution,
            expectedEffect: wish.expected_effect,
            isPublic: wish.is_public,
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

  // 清空所有數據（測試用）
  static async clearAllData(): Promise<void> {
    try {
      await prisma.wishLike.deleteMany()
      await prisma.wish.deleteMany()
      await prisma.userSetting.deleteMany()
      await prisma.migrationLog.deleteMany()
      await prisma.systemStat.deleteMany()
      console.log("All data cleared")
    } catch (error) {
      console.error("Error clearing data:", error)
      throw new MySQLServiceError("清空數據失敗", error)
    }
  }
}

// 測試 MySQL 連接
export async function testMySQLConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log("✅ MySQL connection successful")
    return true
  } catch (error) {
    console.error("MySQL connection test failed:", error)
    return false
  }
}

// 關閉 Prisma 連接
export async function closeMySQLConnection(): Promise<void> {
  await prisma.$disconnect()
}

export default prisma
