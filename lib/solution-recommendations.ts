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

  // 計算信心度
  const confidence = Math.min(95, Math.max(60, scoredSolutions[0]?.score * 15 || 60))

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
  ]

  const empathyPhrases = [
    "工作中遇到這樣的狀況真的很讓人頭疼",
    "我完全理解這種重複性工作帶來的疲憊感",
    "這種效率低下的情況確實會影響工作心情",
    "面對這樣的挑戰，任何人都會感到困擾",
  ]

  const solutionIntros = [
    "根據你的描述，我認為以下幾個方向可能會對你有幫助：",
    "結合你的具體情況，我建議可以考慮這些解決方案：",
    "針對你提到的問題，我整理了幾個可行的改善方向：",
    "基於我的經驗，這類問題通常可以透過以下方式來改善：",
  ]

  const encouragements = [
    "相信透過合適的工具和方法，這個問題是可以得到很好的改善的！",
    "每個困擾都是改善的機會，你已經踏出了重要的第一步。",
    "不要氣餒，很多看似複雜的問題其實都有相對簡單的解決方案。",
    "你的這個想法很棒，讓我們一起找到最適合的解決方式吧！",
  ]

  const greeting = greetings[Math.floor(Math.random() * greetings.length)]
  const empathy = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)]
  const solutionIntro = solutionIntros[Math.floor(Math.random() * solutionIntros.length)]
  const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]

  return `${greeting}。${empathy}。\n\n${solutionIntro}\n\n${encouragement}`
}

// 獲取解決方案的詳細建議
export function getSolutionDetails(solutionId: string): SolutionCategory | null {
  return solutionCategories.find((solution) => solution.id === solutionId) || null
}
