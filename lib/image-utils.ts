// 圖片處理工具
export interface ImageFile {
  id: string
  file?: File // 可選，因為從 localStorage 恢復時不會有原始 File
  url: string // 改為 base64 URL
  name: string
  size: number
  type: string
  base64?: string // 新增 base64 字段
}

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  suggestion?: string
}

// 允許的圖片格式
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

// 允許的檔案副檔名
export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

// 檔案大小限制 (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// 單次上傳數量限制
export const MAX_FILES_PER_UPLOAD = 10

// 總檔案數量限制
export const MAX_TOTAL_FILES = 20

export function validateImageFile(file: File): ImageValidationResult {
  // 檢查檔案類型
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `不支援的檔案格式: ${file.type}`,
      suggestion: `請使用 JPG、PNG、WebP 或 GIF 格式`,
    }
  }

  // 檢查檔案大小
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      isValid: false,
      error: `檔案過大: ${sizeMB}MB`,
      suggestion: `請壓縮圖片至 5MB 以下`,
    }
  }

  // 檢查檔案名稱
  if (file.name.length > 100) {
    return {
      isValid: false,
      error: "檔案名稱過長",
      suggestion: "請使用較短的檔案名稱",
    }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

// 將 File 轉換為 base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert file to base64"))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// 創建圖片文件對象（使用 base64）
export async function createImageFile(file: File): Promise<ImageFile> {
  const base64 = await fileToBase64(file)

  return {
    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    file,
    url: base64, // 直接使用 base64 作為 URL
    name: file.name,
    size: file.size,
    type: file.type,
    base64,
  }
}

// 從儲存的數據恢復圖片對象
export function restoreImageFile(data: any): ImageFile {
  return {
    id: data.id,
    url: data.base64 || data.url, // 優先使用 base64，向後兼容
    name: data.name,
    size: data.size,
    type: data.type,
    base64: data.base64,
  }
}

// 不再需要 revokeImageUrl，因為使用 base64
export function revokeImageUrl(imageFile: ImageFile): void {
  // base64 不需要手動釋放
  return
}

// 壓縮圖片並轉為 base64
export function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
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

    img.src = URL.createObjectURL(file)
  })
}

// 生成縮圖
export function generateThumbnail(file: File, size = 200): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size

      // 計算裁切區域 (正方形縮圖)
      const minDimension = Math.min(img.width, img.height)
      const x = (img.width - minDimension) / 2
      const y = (img.height - minDimension) / 2

      ctx?.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size)

      resolve(canvas.toDataURL(file.type, 0.7))
    }

    img.src = URL.createObjectURL(file)
  })
}
