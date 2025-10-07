// 統一的資料庫服務層 - 支援 Supabase 和 MySQL 切換
import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from '@prisma/client'
import type { ImageFile } from "./image-utils"

// 確保 PrismaClient 正確初始化
const prisma = new PrismaClient()

// 資料庫類型枚舉
export type DatabaseType = 'supabase' | 'mysql'

// 配置
const DATABASE_TYPE: DatabaseType = (process.env.DATABASE_TYPE as DatabaseType) || 'mysql'

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 創建客戶端（只有在有 Supabase 環境變數時才創建）
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: "public",
  },
}) : null

// 使用上面定義的 prisma 實例

// 類型定義
export interface Wish {
  id: number
  title: string
  current_pain: string
  expected_solution: string
  expected_effect: string | null
  is_public: boolean
  email: string | null
  images: any[] | null
  created_at: string
  updated_at: string
  like_count?: number
}

export interface WishInsert {
  title: string
  current_pain: string
  expected_solution: string
  expected_effect?: string | null
  is_public?: boolean
  email?: string | null
  images?: any[] | null
}

export interface WishLike {
  id: number
  wish_id: number
  user_session: string
  created_at: string
}

export interface UserSettings {
  id: number
  user_session: string
  background_music_enabled: boolean
  background_music_volume: number
  background_music_playing: boolean
  created_at: string
  updated_at: string
}

// 錯誤處理
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

// 生成用戶會話 ID
export function getUserSession(): string {
  if (typeof window === "undefined") return "server-session"

  let session = localStorage.getItem("user_session")
  if (!session) {
    session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("user_session", session)
  }
  return session
}

// 困擾案例服務
export class WishService {
  // 獲取所有公開的困擾案例
  static async getPublicWishes(): Promise<Wish[]> {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.getPublicWishesFromSupabase()
      } else {
        return await this.getPublicWishesFromMySQL()
      }
    } catch (error) {
      console.error("Error fetching public wishes:", error)
      throw new DatabaseError("獲取公開困擾失敗", error)
    }
  }

  // 獲取所有困擾案例
  static async getAllWishes(): Promise<Wish[]> {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.getAllWishesFromSupabase()
      } else {
        return await this.getAllWishesFromMySQL()
      }
    } catch (error) {
      console.error("Error fetching all wishes:", error)
      throw new DatabaseError("獲取所有困擾失敗", error)
    }
  }

  // 創建困擾案例
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
      if (DATABASE_TYPE === 'supabase') {
        return await this.createWishInSupabase(wishData)
      } else {
        return await this.createWishInMySQL(wishData)
      }
    } catch (error) {
      console.error("Error creating wish:", error)
      throw new DatabaseError("創建困擾失敗", error)
    }
  }

  // 獲取統計數據
  static async getWishesStats() {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.getWishesStatsFromSupabase()
      } else {
        return await this.getWishesStatsFromMySQL()
      }
    } catch (error) {
      console.error("Error fetching wishes stats:", error)
      throw new DatabaseError("獲取統計數據失敗", error)
    }
  }

  // Supabase 實現
  private static async getPublicWishesFromSupabase(): Promise<Wish[]> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const { data, error } = await supabase
      .from("wishes_with_likes")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error) throw new DatabaseError("獲取公開困擾失敗", error)
    return data || []
  }

  private static async getAllWishesFromSupabase(): Promise<Wish[]> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const { data, error } = await supabase
      .from("wishes_with_likes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new DatabaseError("獲取所有困擾失敗", error)
    return data || []
  }

  private static async createWishInSupabase(wishData: any): Promise<Wish> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const imageData = wishData.images?.map((img: ImageFile) => ({
      id: img.id,
      name: img.name,
      size: img.size,
      type: img.type,
      base64: img.base64 || img.url,
    })) || []

    const { data, error } = await supabase
      .from("wishes")
      .insert({
        title: wishData.title,
        current_pain: wishData.currentPain,
        expected_solution: wishData.expectedSolution,
        expected_effect: wishData.expectedEffect || null,
        is_public: wishData.isPublic ?? true,
        email: wishData.email || null,
        images: imageData,
      })
      .select()
      .single()

    if (error) throw new DatabaseError("創建困擾失敗", error)
    return data
  }

  private static async getWishesStatsFromSupabase() {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const { data, error } = await supabase.rpc("get_wishes_stats")
    if (error) throw new DatabaseError("獲取統計數據失敗", error)
    return data
  }

  // MySQL 實現
  private static async getPublicWishesFromMySQL(): Promise<Wish[]> {
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

    return wishes.map((wish: any) => ({
      ...wish,
      like_count: wish.likes.length,
      created_at: wish.createdAt.toISOString(),
      updated_at: wish.updatedAt.toISOString()
    }))
  }

  private static async getAllWishesFromMySQL(): Promise<Wish[]> {
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

    return wishes.map((wish: any) => ({
      ...wish,
      like_count: wish.likes.length,
      created_at: wish.createdAt.toISOString(),
      updated_at: wish.updatedAt.toISOString()
    }))
  }

  private static async createWishInMySQL(wishData: any): Promise<Wish> {
    const imageData = wishData.images?.map((img: ImageFile) => ({
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

    return {
      ...wish,
      like_count: wish.likes.length,
      created_at: wish.createdAt.toISOString(),
      updated_at: wish.updatedAt.toISOString(),
      current_pain: wish.currentPain,
      expected_solution: wish.expectedSolution,
      expected_effect: wish.expectedEffect,
      is_public: wish.isPublic
    }
  }

  private static async getWishesStatsFromMySQL() {
    const result = await prisma.$queryRaw`
      CALL GetWishesStats()
    `
    return result
  }
}

// 點讚服務
export class LikeService {
  // 為困擾案例點讚
  static async likeWish(wishId: number): Promise<boolean> {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.likeWishInSupabase(wishId)
      } else {
        return await this.likeWishInMySQL(wishId)
      }
    } catch (error) {
      console.error("Error liking wish:", error)
      throw new DatabaseError("點讚失敗", error)
    }
  }

  // 檢查用戶是否已點讚
  static async hasUserLiked(wishId: number): Promise<boolean> {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.hasUserLikedInSupabase(wishId)
      } else {
        return await this.hasUserLikedInMySQL(wishId)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
      return false
    }
  }

  // 獲取困擾案例的點讚數
  static async getWishLikeCount(wishId: number): Promise<number> {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.getWishLikeCountFromSupabase(wishId)
      } else {
        return await this.getWishLikeCountFromMySQL(wishId)
      }
    } catch (error) {
      console.error("Error fetching like count:", error)
      return 0
    }
  }

  // 獲取用戶已點讚的困擾 ID 列表
  static async getUserLikedWishes(): Promise<number[]> {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.getUserLikedWishesFromSupabase()
      } else {
        return await this.getUserLikedWishesFromMySQL()
      }
    } catch (error) {
      console.error("Error fetching user liked wishes:", error)
      return []
    }
  }

  // Supabase 實現
  private static async likeWishInSupabase(wishId: number): Promise<boolean> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const userSession = getUserSession()
    const { error } = await supabase.from("wish_likes").insert({
      wish_id: wishId,
      user_session: userSession,
    })

    if (error) {
      if (error.code === "23505") return false
      throw new DatabaseError("點讚失敗", error)
    }
    return true
  }

  private static async hasUserLikedInSupabase(wishId: number): Promise<boolean> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const userSession = getUserSession()
    const { data, error } = await supabase
      .from("wish_likes")
      .select("id")
      .eq("wish_id", wishId)
      .eq("user_session", userSession)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new DatabaseError("檢查點讚狀態失敗", error)
    }
    return !!data
  }

  private static async getWishLikeCountFromSupabase(wishId: number): Promise<number> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const { count, error } = await supabase
      .from("wish_likes")
      .select("*", { count: "exact", head: true })
      .eq("wish_id", wishId)

    if (error) throw new DatabaseError("獲取點讚數失敗", error)
    return count || 0
  }

  private static async getUserLikedWishesFromSupabase(): Promise<number[]> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const userSession = getUserSession()
    const { data, error } = await supabase
      .from("wish_likes")
      .select("wish_id")
      .eq("user_session", userSession)

    if (error) throw new DatabaseError("獲取用戶點讚記錄失敗", error)
    return data?.map((item) => item.wish_id) || []
  }

  // MySQL 實現
  private static async likeWishInMySQL(wishId: number): Promise<boolean> {
    const userSession = getUserSession()
    try {
      await prisma.wishLike.create({
        data: {
          wishId: wishId,
          userSession: userSession,
        }
      })
      return true
    } catch (error: any) {
      if (error.code === 'P2002') return false
      throw error
    }
  }

  private static async hasUserLikedInMySQL(wishId: number): Promise<boolean> {
    const userSession = getUserSession()
    const like = await prisma.wishLike.findFirst({
      where: {
        wishId: wishId,
        userSession: userSession
      }
    })
    return !!like
  }

  private static async getWishLikeCountFromMySQL(wishId: number): Promise<number> {
    const count = await prisma.wishLike.count({
      where: {
        wishId: wishId
      }
    })
    return count
  }

  private static async getUserLikedWishesFromMySQL(): Promise<number[]> {
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
  }
}

// 用戶設定服務
export class UserSettingsService {
  // 獲取用戶設定
  static async getUserSettings(): Promise<UserSettings | null> {
    try {
      if (DATABASE_TYPE === 'supabase') {
        return await this.getUserSettingsFromSupabase()
      } else {
        return await this.getUserSettingsFromMySQL()
      }
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
      if (DATABASE_TYPE === 'supabase') {
        return await this.updateUserSettingsInSupabase(settings)
      } else {
        return await this.updateUserSettingsInMySQL(settings)
      }
    } catch (error) {
      console.error("Error updating user settings:", error)
      throw new DatabaseError("更新用戶設定失敗", error)
    }
  }

  // Supabase 實現
  private static async getUserSettingsFromSupabase(): Promise<UserSettings | null> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const userSession = getUserSession()
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_session", userSession)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new DatabaseError("獲取用戶設定失敗", error)
    }
    return data
  }

  private static async updateUserSettingsInSupabase(settings: any): Promise<UserSettings> {
    if (!supabase) {
      throw new DatabaseError("Supabase 未配置，請使用 MySQL 資料庫")
    }
    const userSession = getUserSession()
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

      if (insertError) throw new DatabaseError("創建用戶設定失敗", insertError)
      return insertData
    }

    if (updateError) throw new DatabaseError("更新用戶設定失敗", updateError)
    return updateData
  }

  // MySQL 實現
  private static async getUserSettingsFromMySQL(): Promise<UserSettings | null> {
    const userSession = getUserSession()
    const settings = await prisma.userSetting.findUnique({
      where: {
        userSession: userSession
      }
    })

    if (!settings) return null

    return {
      ...settings,
      created_at: settings.createdAt.toISOString(),
      updated_at: settings.updatedAt.toISOString(),
      user_session: settings.userSession,
      background_music_enabled: settings.backgroundMusicEnabled,
      background_music_volume: settings.backgroundMusicVolume,
      background_music_playing: settings.backgroundMusicPlaying
    }
  }

  private static async updateUserSettingsInMySQL(settings: any): Promise<UserSettings> {
    const userSession = getUserSession()
    const userSettings = await prisma.userSetting.upsert({
      where: {
        userSession: userSession
      },
      update: {
        backgroundMusicEnabled: settings.backgroundMusicEnabled,
        backgroundMusicVolume: settings.backgroundMusicVolume,
        backgroundMusicPlaying: settings.backgroundMusicPlaying,
      },
      create: {
        userSession: userSession,
        backgroundMusicEnabled: settings.backgroundMusicEnabled ?? false,
        backgroundMusicVolume: settings.backgroundMusicVolume ?? 0.3,
        backgroundMusicPlaying: settings.backgroundMusicPlaying ?? false,
      }
    })

    return {
      ...userSettings,
      created_at: userSettings.createdAt.toISOString(),
      updated_at: userSettings.updatedAt.toISOString(),
      user_session: userSettings.userSession,
      background_music_enabled: userSettings.backgroundMusicEnabled,
      background_music_volume: userSettings.backgroundMusicVolume,
      background_music_playing: userSettings.backgroundMusicPlaying
    }
  }
}

// 測試資料庫連接
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    if (DATABASE_TYPE === 'supabase') {
      if (!supabase) {
        throw new Error("Supabase 未配置，請使用 MySQL 資料庫")
      }
      const { data, error } = await supabase.from("wishes").select("count").limit(1)
      if (error) throw error
      console.log("✅ Supabase connection successful")
    } else {
      await prisma.$queryRaw`SELECT 1`
      console.log("✅ MySQL connection successful")
    }
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

// 關閉資料庫連接
export async function closeDatabaseConnection(): Promise<void> {
  if (DATABASE_TYPE === 'mysql') {
    await prisma.$disconnect()
  }
}

export default {
  WishService,
  LikeService,
  UserSettingsService,
  testDatabaseConnection,
  closeDatabaseConnection
}
