import { supabase } from "./supabase"

// Supabase 圖片相關的類型定義
export interface SupabaseImageFile {
  id: string
  name: string
  size: number
  type: string
  storage_path: string // Supabase Storage 中的路徑
  public_url: string // 公開訪問 URL
  uploaded_at: string
}

export interface ImageUploadResult {
  success: boolean
  data?: SupabaseImageFile
  error?: string
}

export interface BatchUploadResult {
  successful: SupabaseImageFile[]
  failed: Array<{ file: File; error: string }>
  total: number
}

// 圖片上傳服務
export class SupabaseImageService {
  private static readonly BUCKET_NAME = "wish-images"
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

  // 驗證圖片文件
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `不支援的檔案格式: ${file.type}。請使用 JPG、PNG、WebP 或 GIF 格式。`,
      }
    }

    if (file.size > this.MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return {
        isValid: false,
        error: `檔案過大: ${sizeMB}MB。請壓縮圖片至 5MB 以下。`,
      }
    }

    return { isValid: true }
  }

  // 生成唯一的檔案路徑
  static generateFilePath(file: File): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    return `${timestamp}_${randomId}.${extension}`
  }

  // 上傳單個圖片到 Supabase Storage
  static async uploadImage(file: File): Promise<ImageUploadResult> {
    try {
      // 驗證檔案
      const validation = this.validateImageFile(file)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // 生成檔案路徑
      const filePath = this.generateFilePath(file)

      // 上傳到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return { success: false, error: `上傳失敗: ${uploadError.message}` }
      }

      // 獲取公開 URL
      const { data: urlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        return { success: false, error: "無法獲取圖片 URL" }
      }

      // 創建圖片記錄
      const imageFile: SupabaseImageFile = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        storage_path: filePath,
        public_url: urlData.publicUrl,
        uploaded_at: new Date().toISOString(),
      }

      return { success: true, data: imageFile }
    } catch (error) {
      console.error("Image upload error:", error)
      return { success: false, error: `上傳過程中發生錯誤: ${error}` }
    }
  }

  // 批量上傳圖片
  static async uploadImages(files: File[]): Promise<BatchUploadResult> {
    const result: BatchUploadResult = {
      successful: [],
      failed: [],
      total: files.length,
    }

    // 並行上傳所有圖片
    const uploadPromises = files.map(async (file) => {
      const uploadResult = await this.uploadImage(file)
      if (uploadResult.success && uploadResult.data) {
        result.successful.push(uploadResult.data)
      } else {
        result.failed.push({
          file,
          error: uploadResult.error || "未知錯誤",
        })
      }
    })

    await Promise.all(uploadPromises)
    return result
  }

  // 刪除圖片
  static async deleteImage(storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([storagePath])

      if (error) {
        console.error("Delete error:", error)
        return { success: false, error: `刪除失敗: ${error.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error("Image delete error:", error)
      return { success: false, error: `刪除過程中發生錯誤: ${error}` }
    }
  }

  // 批量刪除圖片
  static async deleteImages(storagePaths: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove(storagePaths)

      if (error) {
        console.error("Batch delete error:", error)
        return { success: false, error: `批量刪除失敗: ${error.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error("Batch delete error:", error)
      return { success: false, error: `批量刪除過程中發生錯誤: ${error}` }
    }
  }

  // 獲取圖片的公開 URL
  static getPublicUrl(storagePath: string): string {
    const { data } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(storagePath)
    return data.publicUrl
  }

  // 檢查存儲桶是否存在並可訪問
  static async checkStorageHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list("", { limit: 1 })

      if (error) {
        return { healthy: false, error: `存儲檢查失敗: ${error.message}` }
      }

      return { healthy: true }
    } catch (error) {
      return { healthy: false, error: `存儲檢查過程中發生錯誤: ${error}` }
    }
  }

  // 獲取存儲使用統計
  static async getStorageStats(): Promise<{
    totalFiles: number
    totalSize: number
    error?: string
  }> {
    try {
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).list("", { limit: 1000 })

      if (error) {
        return { totalFiles: 0, totalSize: 0, error: error.message }
      }

      const totalFiles = data?.length || 0
      const totalSize = data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0

      return { totalFiles, totalSize }
    } catch (error) {
      return { totalFiles: 0, totalSize: 0, error: `獲取統計失敗: ${error}` }
    }
  }
}

// 圖片壓縮工具（在上傳前使用）
export class ImageCompressionService {
  // 壓縮圖片
  static async compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // 計算新尺寸
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // 繪製壓縮後的圖片
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file) // 如果壓縮失敗，返回原檔案
            }
          },
          file.type,
          quality,
        )
      }

      img.onerror = () => resolve(file) // 如果載入失敗，返回原檔案
      img.src = URL.createObjectURL(file)
    })
  }

  // 批量壓縮圖片
  static async compressImages(files: File[]): Promise<File[]> {
    const compressionPromises = files.map((file) => {
      // 如果檔案小於 1MB，不需要壓縮
      if (file.size < 1024 * 1024) {
        return Promise.resolve(file)
      }
      return this.compressImage(file, 1920, 0.8)
    })

    return Promise.all(compressionPromises)
  }
}

// 從舊的 base64 格式遷移到 Supabase Storage
export class ImageMigrationService {
  // 將 base64 圖片遷移到 Supabase Storage
  static async migrateBase64ToStorage(base64Data: string, fileName: string): Promise<ImageUploadResult> {
    try {
      // 將 base64 轉換為 Blob
      const response = await fetch(base64Data)
      const blob = await response.blob()

      // 創建 File 對象
      const file = new File([blob], fileName, { type: blob.type })

      // 上傳到 Supabase Storage
      return await SupabaseImageService.uploadImage(file)
    } catch (error) {
      console.error("Base64 migration error:", error)
      return { success: false, error: `遷移失敗: ${error}` }
    }
  }

  // 批量遷移圖片
  static async migrateImagesFromWish(wishImages: any[]): Promise<{
    successful: SupabaseImageFile[]
    failed: Array<{ originalImage: any; error: string }>
  }> {
    const result = {
      successful: [] as SupabaseImageFile[],
      failed: [] as Array<{ originalImage: any; error: string }>,
    }

    for (const image of wishImages) {
      try {
        if (image.base64) {
          // 遷移 base64 圖片
          const migrationResult = await this.migrateBase64ToStorage(image.base64, image.name)
          if (migrationResult.success && migrationResult.data) {
            result.successful.push(migrationResult.data)
          } else {
            result.failed.push({
              originalImage: image,
              error: migrationResult.error || "遷移失敗",
            })
          }
        } else if (image.storage_path) {
          // 已經是 Supabase Storage 格式，直接保留
          result.successful.push(image as SupabaseImageFile)
        }
      } catch (error) {
        result.failed.push({
          originalImage: image,
          error: `處理失敗: ${error}`,
        })
      }
    }

    return result
  }
}
