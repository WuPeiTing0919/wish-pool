// 內容審核 AI 系統
export interface ModerationResult {
  isAppropriate: boolean
  issues: string[]
  suggestions: string[]
  severity: "low" | "medium" | "high"
  blockedWords: string[]
}

// 不雅詞彙和辱罵詞彙庫
const inappropriateWords = [
  // 髒話和不雅詞彙
  "幹",
  "靠",
  "操",
  "媽的",
  "他媽的",
  "去死",
  "死",
  "滾",
  "白痴",
  "智障",
  "腦殘",
  "垃圾",
  "廢物",
  "混蛋",
  "王八蛋",
  "狗屎",
  "屎",
  "婊子",
  "賤",
  "爛",
  "鳥",
  "屌",
  "雞掰",
  "機掰",
  "北七",

  // 公司辱罵相關
  "爛公司",
  "垃圾公司",
  "黑心公司",
  "慣老闆",
  "奴隸主",
  "血汗工廠",
  "剝削",
  "壓榨",
  "去你的",
  "見鬼",
  "該死",
  "要死",
  "找死",
  "活該",
  "報應",
  "天殺的",

  // 威脅性詞彙
  "殺",
  "打死",
  "弄死",
  "搞死",
  "整死",
  "報復",
  "復仇",
  "毀掉",
  "搞垮",

  // 歧視性詞彙
  "歧視",
  "種族",
  "性別歧視",
  "老不死",
  "死老頭",
  "死老太婆",
  "殘廢",
  "瘸子",

  // 英文不雅詞彙
  "fuck",
  "shit",
  "damn",
  "bitch",
  "asshole",
  "bastard",
  "crap",
  "hell",
  "wtf",
  "stfu",
  "bullshit",
  "motherfucker",
  "dickhead",
  "piss",
]

// 負面但可接受的詞彙（會給予建議但不阻擋）
const negativeButAcceptableWords = [
  "討厭",
  "煩",
  "累",
  "辛苦",
  "困難",
  "挫折",
  "失望",
  "無奈",
  "痛苦",
  "壓力",
  "不滿",
  "抱怨",
  "不爽",
  "生氣",
  "憤怒",
  "沮喪",
  "絕望",
  "疲憊",
  "厭倦",
]

// 建設性詞彙建議
const constructiveSuggestions = [
  "建議使用更具體的描述來說明遇到的困難",
  "可以嘗試描述期望的改善方向",
  "分享具體的情況會更有助於找到解決方案",
  "描述問題的影響程度會幫助我們更好地理解",
  "可以說明這個問題對工作效率的具體影響",
]

export function moderateContent(content: string): ModerationResult {
  const fullText = content.toLowerCase()
  const issues: string[] = []
  const suggestions: string[] = []
  const blockedWords: string[] = []
  let severity: "low" | "medium" | "high" = "low"

  // 檢查不雅詞彙
  inappropriateWords.forEach((word) => {
    if (fullText.includes(word.toLowerCase())) {
      blockedWords.push(word)
      issues.push(`包含不適當詞彙: "${word}"`)
    }
  })

  // 檢查負面但可接受的詞彙
  const negativeWordCount = negativeButAcceptableWords.filter((word) => fullText.includes(word.toLowerCase())).length

  // 判斷嚴重程度
  if (blockedWords.length > 0) {
    severity = "high"
    issues.push("內容包含不雅或辱罵詞彙，無法提交")
    suggestions.push("請使用更專業和建設性的語言描述遇到的困難")
    suggestions.push("我們理解工作中的挫折，但希望能以正面的方式表達")
  } else if (negativeWordCount > 3) {
    severity = "medium"
    issues.push("內容情緒較為負面")
    suggestions.push("建議加入一些具體的改善建議或期望")
    suggestions.push("描述具體情況會比情緒性詞彙更有幫助")
  } else if (negativeWordCount > 1) {
    severity = "low"
    suggestions.push("可以嘗試更具體地描述遇到的挑戰")
  }

  // 內容長度檢查
  if (content.trim().length < 10) {
    issues.push("內容過於簡短，請提供更詳細的描述")
    severity = severity === "low" ? "medium" : severity
  }

  // 重複字符檢查（可能是情緒性表達）
  const repeatedChars = content.match(/(.)\1{4,}/g)
  if (repeatedChars) {
    issues.push("請避免使用過多重複字符")
    suggestions.push("建議使用清楚的文字描述來表達感受")
  }

  // 全大寫檢查（可能是憤怒表達）
  const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (upperCaseRatio > 0.5 && content.length > 20) {
    issues.push("請避免使用過多大寫字母")
    suggestions.push("正常的大小寫會讓內容更容易閱讀")
  }

  // 如果沒有具體建議，添加通用建議
  if (suggestions.length === 0 && severity !== "high") {
    suggestions.push(...constructiveSuggestions.slice(0, 2))
  }

  return {
    isAppropriate: blockedWords.length === 0,
    issues,
    suggestions,
    severity,
    blockedWords,
  }
}

// 檢查整個表單內容
export function moderateWishForm(formData: {
  title: string
  currentPain: string
  expectedSolution: string
  expectedEffect: string
}): ModerationResult {
  const allContent = `${formData.title} ${formData.currentPain} ${formData.expectedSolution} ${formData.expectedEffect}`

  const result = moderateContent(allContent)

  // 針對不同欄位給出具體建議
  const fieldSpecificSuggestions: string[] = []

  if (formData.title.length < 5) {
    fieldSpecificSuggestions.push('標題建議更具體一些，例如："資料整理效率低下" 而非 "很煩"')
  }

  if (formData.currentPain.length < 20) {
    fieldSpecificSuggestions.push("困擾描述可以更詳細，包括具體情況和影響")
  }

  if (formData.expectedSolution.length < 15) {
    fieldSpecificSuggestions.push("期望解決方式可以更具體，這有助於我們提供更好的建議")
  }

  return {
    ...result,
    suggestions: [...result.suggestions, ...fieldSpecificSuggestions],
  }
}

// 提供正面的表達建議
export function getSuggestedPhrases(originalText: string): string[] {
  const suggestions: string[] = []

  // 根據內容提供建議
  if (originalText.includes("很煩") || originalText.includes("討厭")) {
    suggestions.push('可以說："這個流程讓我感到困擾，希望能夠簡化"')
  }

  if (originalText.includes("爛") || originalText.includes("垃圾")) {
    suggestions.push('可以說："這個系統存在一些問題，影響了工作效率"')
  }

  if (originalText.includes("老闆") && (originalText.includes("討厌") || originalText.includes("爛"))) {
    suggestions.push('可以說："希望能與主管有更好的溝通和協作"')
  }

  if (originalText.includes("同事")) {
    suggestions.push('可以說："團隊協作方面遇到一些挑戰"')
  }

  return suggestions
}
