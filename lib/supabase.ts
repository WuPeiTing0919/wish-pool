import { createClient } from "@supabase/supabase-js"

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 創建 Supabase 客戶端（單例模式）
// 只有在有 Supabase 環境變數時才創建客戶端
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 我們不需要用戶認證
  },
  db: {
    schema: "public",
  },
}) : null

// 數據庫類型定義
export interface Database {
  public: {
    Tables: {
      wishes: {
        Row: {
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
        }
        Insert: {
          title: string
          current_pain: string
          expected_solution: string
          expected_effect?: string | null
          is_public?: boolean
          email?: string | null
          images?: any[] | null
        }
        Update: {
          title?: string
          current_pain?: string
          expected_solution?: string
          expected_effect?: string | null
          is_public?: boolean
          email?: string | null
          images?: any[] | null
        }
      }
      wish_likes: {
        Row: {
          id: number
          wish_id: number
          user_session: string
          created_at: string
        }
        Insert: {
          wish_id: number
          user_session: string
        }
        Update: {
          wish_id?: number
          user_session?: string
        }
      }
      user_settings: {
        Row: {
          id: number
          user_session: string
          background_music_enabled: boolean
          background_music_volume: number
          background_music_playing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_session: string
          background_music_enabled?: boolean
          background_music_volume?: number
          background_music_playing?: boolean
        }
        Update: {
          background_music_enabled?: boolean
          background_music_volume?: number
          background_music_playing?: boolean
        }
      }
    }
    Views: {
      wishes_with_likes: {
        Row: {
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
          like_count: number
        }
      }
    }
    Functions: {
      get_wishes_stats: {
        Args: {}
        Returns: {
          total_wishes: number
          public_wishes: number
          private_wishes: number
          this_week: number
          last_week: number
        }
      }
    }
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

// 測試 Supabase 連接
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    if (!supabase) {
      console.log("ℹ️ Supabase 未配置，使用 MySQL 資料庫")
      return false
    }

    const { data, error } = await supabase.from("wishes").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return false
    }

    console.log("✅ Supabase connection successful")
    return true
  } catch (error) {
    console.error("Supabase connection test error:", error)
    return false
  }
}
