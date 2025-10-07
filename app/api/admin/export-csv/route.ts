import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, filename } = body
    
    console.log(`🔍 後台管理 - 匯出 CSV: ${filename}`)
    
    // 準備 CSV 數據
    const headers = [
      'ID',
      '標題',
      '遇到的困擾',
      '期望的解決方式',
      '預期效果',
      '是否公開',
      '電子郵件',
      '狀態',
      '類別',
      '優先級',
      '點讚數',
      '創建時間',
      '更新時間',
      '用戶會話'
    ]
    
    // 轉換數據為 CSV 格式
    const csvRows = [headers.join(',')]
    
    data.forEach((wish: any) => {
      const row = [
        wish.id,
        `"${wish.title.replace(/"/g, '""')}"`,
        `"${wish.current_pain.replace(/"/g, '""')}"`,
        `"${wish.expected_solution.replace(/"/g, '""')}"`,
        `"${(wish.expected_effect || '').replace(/"/g, '""')}"`,
        wish.is_public ? '是' : '否',
        `"${(wish.email || '').replace(/"/g, '""')}"`,
        wish.status === 'active' ? '活躍' : '非活躍',
        `"${(wish.category || '未分類').replace(/"/g, '""')}"`,
        wish.priority,
        wish.like_count,
        `"${new Date(wish.created_at).toLocaleString('zh-TW')}"`,
        `"${new Date(wish.updated_at).toLocaleString('zh-TW')}"`,
        `"${wish.user_session.replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(','))
    })
    
    const csvContent = csvRows.join('\n')
    const csvBuffer = Buffer.from(csvContent, 'utf-8')
    
    console.log(`✅ 成功生成 CSV 文件: ${data.length} 筆數據`)
    
    // 返回文件
    return new NextResponse(csvBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': csvBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('CSV 匯出錯誤:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export CSV' },
      { status: 500 }
    )
  }
}
