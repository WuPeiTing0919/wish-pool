// Email 驗證工具
export function isValidEmail(email: string): boolean {
  if (!email) return true // 空值是允許的（可選欄位）

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function getEmailDomain(email: string): string {
  const parts = email.split("@")
  return parts.length > 1 ? parts[1] : ""
}

// 檢查是否為常見的臨時郵箱服務
const temporaryEmailDomains = [
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.org",
  "throwaway.email",
]

export function isTemporaryEmail(email: string): boolean {
  if (!email) return false

  const domain = getEmailDomain(email)
  return temporaryEmailDomains.includes(domain)
}

export function validateEmailForSubmission(email: string): {
  isValid: boolean
  message?: string
  suggestion?: string
} {
  if (!email) {
    return { isValid: true } // 空值允許
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      message: "請輸入有效的 Email 格式",
      suggestion: "例如：your.name@company.com",
    }
  }

  if (isTemporaryEmail(email)) {
    return {
      isValid: false,
      message: "請避免使用臨時郵箱服務",
      suggestion: "建議使用常用的 Email 地址，以便我們能夠聯繫到你",
    }
  }

  return { isValid: true }
}
