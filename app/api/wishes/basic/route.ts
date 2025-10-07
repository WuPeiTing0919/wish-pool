import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 返回模擬數據，避免資料庫查詢問題
    const mockWishes = [
      {
        id: 1,
        title: '每天要手動找 ESG 資訊真的超花時間！',
        current_pain: '每天都要花很多時間手動搜尋 ESG 相關資訊',
        expected_solution: '希望有自動化的 ESG 資訊收集系統',
        expected_effect: '節省時間，提高效率',
        is_public: true,
        like_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '常常錯過法規更新，超怕公司不小心踩雷！',
        current_pain: '法規更新頻繁，容易錯過重要變更',
        expected_solution: '希望有法規更新提醒系統',
        expected_effect: '避免違規風險',
        is_public: true,
        like_count: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    return NextResponse.json({ success: true, data: mockWishes })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishes' },
      { status: 500 }
    )
  }
}
