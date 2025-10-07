import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Wishes API is working',
      data: [
        {
          id: 1,
          title: '測試困擾案例',
          current_pain: '這是一個測試困擾',
          expected_solution: '期望的解決方案',
          expected_effect: '預期效果',
          is_public: true,
          like_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishes' },
      { status: 500 }
    )
  }
}
