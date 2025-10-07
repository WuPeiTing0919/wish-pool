import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 返回模擬的 83 筆數據（75 個公開，8 個私密）
    const mockWishes = []
    
    // 生成 75 個公開困擾案例
    for (let i = 1; i <= 75; i++) {
      mockWishes.push({
        id: i,
        title: `困擾案例 ${i} - ${i <= 6 ? ['ESG 資訊收集', '法規更新提醒', '權限管理', '溝通輔助', 'DCC 優化', '報表自動化'][i-1] : '其他工作困擾'}`,
        current_pain: `這是第 ${i} 個困擾案例的詳細描述，描述了具體的工作困難和挑戰。`,
        expected_solution: `針對第 ${i} 個困擾案例的期望解決方案，希望能有效改善工作流程。`,
        expected_effect: `實施解決方案後預期能帶來的工作效率提升和問題改善。`,
        is_public: true,
        like_count: Math.floor(Math.random() * 10),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // 生成 8 個私密困擾案例
    for (let i = 76; i <= 83; i++) {
      mockWishes.push({
        id: i,
        title: `私密困擾案例 ${i - 75}`,
        current_pain: `這是第 ${i - 75} 個私密困擾案例的詳細描述，涉及敏感的工作內容。`,
        expected_solution: `針對私密困擾案例的期望解決方案，需要謹慎處理。`,
        expected_effect: `實施解決方案後預期能帶來的工作效率提升和問題改善。`,
        is_public: false,
        like_count: Math.floor(Math.random() * 5),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ success: true, data: mockWishes })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishes' },
      { status: 500 }
    )
  }
}
