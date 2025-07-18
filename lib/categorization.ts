// 工作痛點分類系統 - 精簡版 10 個分類
export const categories = [
  {
    name: "重複作業",
    description: "每天遇到都在做的重工、報表、開票等例行事務",
    keywords: [
      "重複",
      "重工",
      "報表",
      "開票",
      "例行",
      "每天",
      "固定",
      "重複性",
      "例行公事",
      "重複工作",
      "日常作業",
      "定期",
      "週期性",
      "重複操作",
      "機械化",
      "單調",
    ],
    color: "#3B82F6",
    bgColor: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-400/30",
    textColor: "text-blue-200",
    icon: "🔄",
  },
  {
    name: "數據混亂",
    description: "資料統整困難、爆表、無法分析或視覺化",
    keywords: [
      "數據",
      "資料",
      "統整",
      "爆表",
      "分析",
      "視覺化",
      "整理",
      "混亂",
      "散亂",
      "不一致",
      "格式",
      "匯入",
      "匯出",
      "Excel",
      "CSV",
      "報告",
      "圖表",
    ],
    color: "#DB2777",
    bgColor: "from-pink-600/20 to-rose-700/20",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-200",
    icon: "📊",
  },
  {
    name: "找不到資料",
    description: "文件、SOP、規則等資訊難查找",
    keywords: [
      "找不到",
      "文件",
      "SOP",
      "規則",
      "資訊",
      "查找",
      "搜尋",
      "文檔",
      "手冊",
      "說明",
      "指引",
      "標準",
      "程序",
      "知識",
      "資料庫",
      "檔案",
      "位置",
    ],
    color: "#F59E0B",
    bgColor: "from-yellow-500/20 to-amber-600/20",
    borderColor: "border-yellow-400/30",
    textColor: "text-yellow-200",
    icon: "🔍",
  },
  {
    name: "流程卡關",
    description: "請購、採購、維修等流程追蹤不到",
    keywords: [
      "流程",
      "請購",
      "採購",
      "維修",
      "追蹤",
      "卡關",
      "停滯",
      "延遲",
      "審核",
      "簽核",
      "申請",
      "進度",
      "狀態",
      "追不到",
      "不知道",
      "等待",
    ],
    color: "#EF4444",
    bgColor: "from-red-500/20 to-rose-600/20",
    borderColor: "border-red-400/30",
    textColor: "text-red-200",
    icon: "🚧",
  },
  {
    name: "文件太多",
    description: "表單量、會議紀錄等需人工輸入/比對",
    keywords: [
      "文件",
      "表單",
      "會議紀錄",
      "人工輸入",
      "比對",
      "繁瑣",
      "太多",
      "大量",
      "手動",
      "輸入",
      "填寫",
      "紙本",
      "列印",
      "掃描",
      "歸檔",
      "整理",
    ],
    color: "#8B5CF6",
    bgColor: "from-purple-500/20 to-violet-600/20",
    borderColor: "border-purple-400/30",
    textColor: "text-purple-200",
    icon: "📄",
  },
  {
    name: "協作混亂",
    description: "人工配置、斷線、跨部門難協調",
    keywords: [
      "協作",
      "人工配置",
      "斷線",
      "跨部門",
      "協調",
      "溝通",
      "配合",
      "團隊",
      "合作",
      "聯繫",
      "回應",
      "討論",
      "會議",
      "同事",
      "部門",
      "協調",
    ],
    color: "#10B981",
    bgColor: "from-green-500/20 to-emerald-600/20",
    borderColor: "border-green-400/30",
    textColor: "text-green-200",
    icon: "🤝",
  },
  {
    name: "時間浪費",
    description: "等資料、等簽核、等開會系統等無效率時間",
    keywords: [
      "時間",
      "等資料",
      "等簽核",
      "等開會",
      "無效率",
      "浪費",
      "等待",
      "拖延",
      "慢",
      "效率",
      "速度",
      "加班",
      "忙碌",
      "趕工",
      "deadline",
      "截止",
    ],
    color: "#F97316",
    bgColor: "from-orange-500/20 to-red-600/20",
    borderColor: "border-orange-400/30",
    textColor: "text-orange-200",
    icon: "⏰",
  },
  {
    name: "諮詢煩重",
    description: "客戶或內部常見問答人力吃緊",
    keywords: [
      "諮詢",
      "客戶",
      "內部",
      "問答",
      "人力吃緊",
      "常見問題",
      "重複問題",
      "客服",
      "支援",
      "解答",
      "回覆",
      "詢問",
      "疑問",
      "FAQ",
      "服務",
      "處理",
    ],
    color: "#0891B2",
    bgColor: "from-cyan-600/20 to-teal-700/20",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-300",
    icon: "💬",
  },
  {
    name: "權限不清",
    description: "權限管理混亂、責任不明",
    keywords: [
      "權限",
      "管理",
      "混亂",
      "責任",
      "不明",
      "不清楚",
      "授權",
      "存取",
      "帳號",
      "密碼",
      "登入",
      "角色",
      "職責",
      "負責人",
      "歸屬",
      "分工",
    ],
    color: "#84CC16",
    bgColor: "from-lime-500/20 to-green-600/20",
    borderColor: "border-lime-400/30",
    textColor: "text-lime-200",
    icon: "🔐",
  },
  {
    name: "系統太多",
    description: "多系統操作、切換成本高",
    keywords: [
      "系統",
      "多系統",
      "切換",
      "成本高",
      "太多",
      "太雜",
      "操作",
      "介面",
      "平台",
      "工具",
      "軟體",
      "應用程式",
      "登入",
      "帳號",
      "整合",
      "統一",
    ],
    color: "#6366F1",
    bgColor: "from-indigo-500/20 to-purple-600/20",
    borderColor: "border-indigo-400/30",
    textColor: "text-indigo-200",
    icon: "💻",
  },
]

export interface Wish {
  id: number
  title: string
  currentPain: string
  expectedSolution: string
  expectedEffect: string
  createdAt: string
}

export interface Category {
  name: string
  description: string
  keywords: string[]
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  icon: string
}

// 多標籤自動分類函數 - 最多返回3個
export function categorizeWishMultiple(wish: Wish): Category[] {
  const fullText = `${wish.title} ${wish.currentPain} ${wish.expectedSolution} ${wish.expectedEffect}`.toLowerCase()
  const matchedCategories: Category[] = []

  // 檢查每個分類，收集所有匹配的分類
  categories.forEach((category) => {
    const matchedKeywords = category.keywords.filter((keyword) => fullText.includes(keyword.toLowerCase()))

    if (matchedKeywords.length > 0) {
      matchedCategories.push({
        ...category,
        matchScore: matchedKeywords.length, // 添加匹配分數
      } as Category & { matchScore: number })
    }
  })

  // 如果有匹配的分類，按匹配分數排序並返回最多3個
  if (matchedCategories.length > 0) {
    return matchedCategories.sort((a, b) => (b as any).matchScore - (a as any).matchScore).slice(0, 3) // 最多3個標籤
  }

  // 如果沒有匹配到任何分類，返回默認分類
  return [
    {
      name: "其他問題",
      description: "未能歸類的特殊工作困擾",
      keywords: [],
      color: "#94A3B8",
      bgColor: "from-slate-400/20 to-slate-500/20",
      borderColor: "border-slate-400/40",
      textColor: "text-slate-200",
      icon: "❓",
    },
  ]
}

// 保持向後兼容的單一分類函數
export function categorizeWish(wish: Wish): Category {
  const categories = categorizeWishMultiple(wish)
  return categories[0] // 返回最匹配的分類
}

// 獲取所有願望的分類統計（支持多標籤）
export function getCategoryStats(wishes: Wish[]) {
  const stats: { [key: string]: number } = {}

  // 初始化統計
  categories.forEach((cat) => {
    stats[cat.name] = 0
  })
  stats["其他問題"] = 0

  // 統計每個分類的數量（多標籤計算）
  wishes.forEach((wish) => {
    const wishCategories = categorizeWishMultiple(wish)
    wishCategories.forEach((category) => {
      stats[category.name]++
    })
  })

  return stats
}

// 獲取分類統計（用於雷達圖，避免重複計算）
export function getCategoryStatsForRadar(wishes: Wish[]) {
  const stats: { [key: string]: number } = {}

  // 初始化統計
  categories.forEach((cat) => {
    stats[cat.name] = 0
  })
  stats["其他問題"] = 0

  // 統計每個分類的數量（每個願望只計算一次，取主要分類）
  wishes.forEach((wish) => {
    const primaryCategory = categorizeWish(wish)
    stats[primaryCategory.name]++
  })

  return stats
}
