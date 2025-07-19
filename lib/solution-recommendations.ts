// 智能解決方案推薦系統
export interface SolutionCategory {
  id: string
  name: string
  icon: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  keywords: string[]
  examples: string[]
  benefits: string[]
  difficulty: "easy" | "medium" | "hard"
  timeframe: string
  techStack: string[]
}

export const solutionCategories: SolutionCategory[] = [
  {
    id: "chatbot",
    name: "聊天機器人",
    icon: "🤖",
    description: "建立對話式助手，回答常見問題、流程說明",
    color: "#3B82F6",
    bgColor: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-400/30",
    textColor: "text-blue-200",
    keywords: ["問答", "諮詢", "客服", "常見問題", "FAQ", "詢問", "回覆", "解答", "支援", "服務"],
    examples: ["客戶、內部SOP詢問", "流程說明"],
    benefits: ["24小時服務", "減少重複問答", "提升回應效率"],
    difficulty: "medium",
    timeframe: "2-4週",
    techStack: ["ChatGPT", "Dialogflow", "LINE Bot"],
  },
  {
    id: "document-generation",
    name: "文件生成",
    icon: "📄",
    description: "自動產出報告、會議紀錄、表單填寫等",
    color: "#10B981",
    bgColor: "from-green-500/20 to-emerald-600/20",
    borderColor: "border-green-400/30",
    textColor: "text-green-200",
    keywords: ["報表", "文件", "表單", "會議紀錄", "填寫", "產出", "生成", "製作", "撰寫", "輸出"],
    examples: ["報告填寫", "表單填入", "合約產製"],
    benefits: ["節省撰寫時間", "格式統一", "減少錯誤"],
    difficulty: "easy",
    timeframe: "1-2週",
    techStack: ["Word模板", "Google Docs API", "PDF生成"],
  },
  {
    id: "knowledge-management",
    name: "知識整理",
    icon: "📚",
    description: "提取與重組非結構資料，打造企業知識庫",
    color: "#8B5CF6",
    bgColor: "from-purple-500/20 to-violet-600/20",
    borderColor: "border-purple-400/30",
    textColor: "text-purple-200",
    keywords: ["知識", "整理", "歸檔", "分類", "搜尋", "文檔", "資料庫", "管理", "查找", "SOP"],
    examples: ["FAQ建立", "SOP匯整", "文件歸檔"],
    benefits: ["知識不流失", "快速查找", "經驗傳承"],
    difficulty: "medium",
    timeframe: "3-6週",
    techStack: ["Notion", "Confluence", "向量資料庫"],
  },
  {
    id: "data-visualization",
    name: "數據視覺化",
    icon: "📊",
    description: "把複雜數據轉換成圖表、儀表板",
    color: "#F59E0B",
    bgColor: "from-yellow-500/20 to-amber-600/20",
    borderColor: "border-yellow-400/30",
    textColor: "text-yellow-200",
    keywords: ["數據", "資料", "圖表", "分析", "統計", "視覺化", "儀表板", "報告", "趨勢", "爆表"],
    examples: ["報表分析", "自動儀表板", "績效追蹤"],
    benefits: ["一目了然", "決策支援", "趨勢洞察"],
    difficulty: "medium",
    timeframe: "2-4週",
    techStack: ["Power BI", "Tableau", "Google Charts"],
  },
  {
    id: "process-automation",
    name: "流程自動化",
    icon: "⚡",
    description: "用RPA/n8n/Zapier等自動執行例行操作",
    color: "#EF4444",
    bgColor: "from-red-500/20 to-rose-600/20",
    borderColor: "border-red-400/30",
    textColor: "text-red-200",
    keywords: ["自動化", "流程", "重複", "例行", "操作", "執行", "RPA", "機器人", "排程", "批次"],
    examples: ["表單自動送簽", "報表排程產製", "系統跳轉操作"],
    benefits: ["解放人力", "減少錯誤", "提升效率"],
    difficulty: "hard",
    timeframe: "4-8週",
    techStack: ["UiPath", "n8n", "Zapier", "Power Automate"],
  },
  {
    id: "data-cleaning",
    name: "資料清洗",
    icon: "🧹",
    description: "格式轉換、資料對齊、電位補齊與比對",
    color: "#06B6D4",
    bgColor: "from-cyan-500/20 to-teal-600/20",
    borderColor: "border-cyan-400/30",
    textColor: "text-cyan-200",
    keywords: ["資料", "清洗", "格式", "轉換", "對齊", "比對", "Excel", "CSV", "匯入", "匯出"],
    examples: ["Excel合併", "去重", "比對鎖定", "轉格式"],
    benefits: ["資料品質提升", "格式統一", "節省手工時間"],
    difficulty: "easy",
    timeframe: "1-3週",
    techStack: ["Python", "Excel VBA", "Power Query"],
  },
  {
    id: "ai-search",
    name: "AI搜尋推薦",
    icon: "🔍",
    description: "讓使用者快速找到相關知識、紀錄或案例",
    color: "#84CC16",
    bgColor: "from-lime-500/20 to-green-600/20",
    borderColor: "border-lime-400/30",
    textColor: "text-lime-200",
    keywords: ["搜尋", "查找", "推薦", "相關", "案例", "知識", "文件", "快速", "智能", "找到"],
    examples: ["文件搜尋", "產品推薦", "知識引導"],
    benefits: ["快速定位", "智能推薦", "提升查找效率"],
    difficulty: "hard",
    timeframe: "4-6週",
    techStack: ["Elasticsearch", "AI向量搜尋", "RAG系統"],
  },
  {
    id: "image-recognition",
    name: "影像辨識",
    icon: "👁️",
    description: "分析票片、文件、物件、標籤等",
    color: "#EC4899",
    bgColor: "from-pink-500/20 to-rose-600/20",
    borderColor: "border-pink-400/30",
    textColor: "text-pink-200",
    keywords: ["影像", "辨識", "掃描", "票據", "文件", "照片", "圖片", "識別", "分析", "OCR"],
    examples: ["缺陷檢測", "清單金額讀取", "監控畫面分析"],
    benefits: ["自動識別", "減少人工檢查", "提升準確度"],
    difficulty: "hard",
    timeframe: "6-10週",
    techStack: ["OpenCV", "TensorFlow", "Azure Vision"],
  },
  {
    id: "smart-summary",
    name: "智能摘要",
    icon: "📝",
    description: "將會議/文件自動摘要成精華",
    color: "#F97316",
    bgColor: "from-orange-500/20 to-red-600/20",
    borderColor: "border-orange-400/30",
    textColor: "text-orange-200",
    keywords: ["摘要", "會議", "文件", "精華", "重點", "總結", "整理", "濃縮", "提取", "歸納"],
    examples: ["會議紀錄", "長文件摘要整理"],
    benefits: ["快速掌握重點", "節省閱讀時間", "重點不遺漏"],
    difficulty: "medium",
    timeframe: "2-4週",
    techStack: ["GPT-4", "Claude", "自然語言處理"],
  },
  {
    id: "system-integration",
    name: "系統整合",
    icon: "🔗",
    description: "多系統資料打通、統一操作",
    color: "#6366F1",
    bgColor: "from-indigo-500/20 to-purple-600/20",
    borderColor: "border-indigo-400/30",
    textColor: "text-indigo-200",
    keywords: ["系統", "整合", "打通", "統一", "多系統", "切換", "介面", "平台", "連接", "同步"],
    examples: ["ERP + CRM串接", "跨平台整合操作"],
    benefits: ["減少重複輸入", "資料同步", "操作統一"],
    difficulty: "hard",
    timeframe: "8-12週",
    techStack: ["API整合", "ETL工具", "中介軟體"],
  },
]

// 基於內容生成穩定的哈希值
function generateContentHash(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 轉換為32位整數
  }
  return Math.abs(hash)
}

// 計算信心度的改進演算法
function calculateConfidence(
  scoredSolutions: { solution: SolutionCategory; score: number; matchedKeywords: string[] }[],
  fullText: string,
  topSolutions: SolutionCategory[]
): number {
  if (scoredSolutions.length === 0) {
    return 25 // 沒有匹配時，信心度很低
  }

  const bestScore = scoredSolutions[0]?.score || 0
  const textLength = fullText.length
  const solutionCount = scoredSolutions.length

  // 基礎信心度：根據最佳匹配分數
  let baseConfidence = Math.min(90, bestScore * 12 + 20) // 20-90% 範圍

  // 修正因子
  let confidenceModifier = 0

  // 1. 文本長度修正：描述越詳細，信心度略提升
  if (textLength > 200) {
    confidenceModifier += 5
  } else if (textLength < 50) {
    confidenceModifier -= 8
  }

  // 2. 匹配解決方案數量修正
  if (solutionCount >= 3) {
    confidenceModifier += 8 // 多個匹配選項，信心度提升
  } else if (solutionCount === 1) {
    confidenceModifier -= 5 // 只有一個匹配，信心度略降
  }

  // 3. 匹配質量修正：檢查關鍵詞匹配的相關性
  const keywordDensity = scoredSolutions[0]?.matchedKeywords.length / (fullText.split(' ').length + 1)
  if (keywordDensity > 0.1) {
    confidenceModifier += 6 // 關鍵詞密度高，信心度提升
  }

  // 4. 基於內容的穩定變化因子，避免隨機波動
  const contentHash = generateContentHash(fullText)
  const stableVariation = (contentHash % 11 - 5) * 0.8 // ±4% 穩定調整

  // 最終信心度計算
  let finalConfidence = baseConfidence + confidenceModifier + stableVariation

  // 確保信心度在合理範圍內
  finalConfidence = Math.max(20, Math.min(92, finalConfidence))

  // 四捨五入到整數
  return Math.round(finalConfidence)
}

// 智能推薦引擎
export function generateSolutionRecommendations(wish: any): {
  recommendations: SolutionCategory[]
  personalizedMessage: string
  confidence: number
} {
  const fullText = `${wish.title} ${wish.currentPain} ${wish.expectedSolution} ${wish.expectedEffect}`.toLowerCase()

  // 計算每個解決方案的匹配分數
  const scoredSolutions = solutionCategories
    .map((solution) => {
      const matchedKeywords = solution.keywords.filter((keyword) => fullText.includes(keyword.toLowerCase()))
      const score = matchedKeywords.length
      return { solution, score, matchedKeywords }
    })
    .filter((item) => item.score > 0)

  // 按分數排序，取前3個
  const topSolutions = scoredSolutions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.solution)

  // 生成個人化訊息
  const personalizedMessage = generatePersonalizedMessage(wish, topSolutions, scoredSolutions[0]?.matchedKeywords || [])

  // 計算信心度 - 改進演算法，更貼近真實情況
  const confidence = calculateConfidence(scoredSolutions, fullText, topSolutions)

  return {
    recommendations: topSolutions,
    personalizedMessage,
    confidence,
  }
}

// 生成溫暖人性化的回覆訊息
function generatePersonalizedMessage(wish: any, solutions: SolutionCategory[], matchedKeywords: string[]): string {
  const greetings = [
    "看到你的困擾，我很能理解這種感受",
    "這個問題確實很常見，你不是一個人在面對",
    "感謝你願意分享這個困擾，讓我來幫你想想解決方案",
    "我仔細看了你的描述，這確實是個需要解決的問題",
    "從你的描述中，我能感受到這個問題對你的影響",
    "這樣的工作困擾我見過不少，很理解你的心情",
    "你提到的這個狀況確實需要好好處理一下",
    "看得出來這個問題已經困擾你一段時間了",
  ]

  const empathyPhrases = [
    "工作中遇到這樣的狀況真的很讓人頭疼",
    "我完全理解這種重複性工作帶來的疲憊感",
    "這種效率低下的情況確實會影響工作心情",
    "面對這樣的挑戰，任何人都會感到困擾",
    "重複處理類似的問題確實會消耗很多精力",
    "這類流程問題往往比表面看起來更複雜",
    "長期面對這種狀況確實會影響工作效率",
    "這種系統性問題需要從根本上來解決",
  ]

  const solutionIntros = [
    "根據你的描述，我已經為你準備了幾個改善方向，點擊上方展開按鈕查看詳細建議：",
    "結合你的具體情況，我整理了一些解決方案，展開即可查看完整分析：",
    "針對你提到的問題，我準備了幾個可行的改善方向，請展開查看具體內容：",
    "基於我的經驗，這類問題有多種改善方式，點擊展開按鈕查看詳細建議：",
  ]

  const encouragements = [
    "相信透過合適的工具和方法，這個問題是可以得到很好的改善的！",
    "每個困擾都是改善的機會，你已經踏出了重要的第一步。",
    "不要氣餒，很多看似複雜的問題其實都有相對簡單的解決方案。",
    "你的這個想法很棒，讓我們一起找到最適合的解決方式吧！",
    "通過科技和流程優化，這類問題往往能得到顯著改善。",
    "你願意主動尋求解決方案，這本身就是很大的進步！",
    "改善工作流程需要時間，但每一小步都值得肯定。",
    "有了明確的改善方向，相信你很快就能看到成效。",
    "這些建議希望能為你帶來一些新的思路和啟發。",
    "記住，最好的解決方案往往是循序漸進地實施的。",
  ]

  // 基於內容生成穩定且多樣化的文案選擇
  const fullText = `${wish.title} ${wish.currentPain} ${wish.expectedSolution} ${wish.expectedEffect}`.toLowerCase()
  const contentHash = generateContentHash(fullText)
  
  // 加入關鍵詞特徵增加多樣性
  const keywordBonus = matchedKeywords.length * 13
  const textLengthFactor = fullText.length % 17
  
  // 使用不同的分散策略確保多樣性
  const greeting = greetings[(contentHash + keywordBonus) % greetings.length]
  const empathy = empathyPhrases[(contentHash * 5 + textLengthFactor) % empathyPhrases.length]
  const solutionIntro = solutionIntros[(contentHash * 13 + keywordBonus * 3) % solutionIntros.length]
  const encouragement = encouragements[(contentHash * 19 + textLengthFactor * 7) % encouragements.length]

  return `${greeting}。${empathy}。\n\n${solutionIntro}\n\n${encouragement}`
}

// 獲取解決方案的詳細建議
export function getSolutionDetails(solutionId: string): SolutionCategory | null {
  return solutionCategories.find((solution) => solution.id === solutionId) || null
}
