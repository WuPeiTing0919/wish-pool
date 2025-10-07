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
      // 清理和轉義 CSV 數據
      const cleanText = (text: string) => {
        if (!text) return ''
        return text
          .replace(/"/g, '""')  // 轉義雙引號
          .replace(/\r?\n/g, ' ')  // 將換行符替換為空格
          .replace(/\t/g, ' ')  // 將製表符替換為空格
          .trim()
      }
      
      const row = [
        wish.id,
        `"${cleanText(wish.title)}"`,
        `"${cleanText(wish.current_pain)}"`,
        `"${cleanText(wish.expected_solution)}"`,
        `"${cleanText(wish.expected_effect || '')}"`,
        wish.is_public ? '是' : '否',
        `"${cleanText(wish.email || '')}"`,
        wish.status === 'active' ? '活躍' : '非活躍',
        `"${cleanText(wish.category || '未分類')}"`,
        wish.priority,
        wish.like_count,
        `"${new Date(wish.created_at).toLocaleString('zh-TW', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}"`,
        `"${new Date(wish.updated_at).toLocaleString('zh-TW', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}"`,
        `"${cleanText(wish.user_session)}"`
      ]
      csvRows.push(row.join(','))
    })
    
    const csvContent = csvRows.join('\n')
    // 添加 UTF-8 BOM 以確保 Excel 正確識別中文編碼
    const csvBuffer = Buffer.concat([
      Buffer.from('\uFEFF', 'utf8'), // UTF-8 BOM
      Buffer.from(csvContent, 'utf-8')
    ])
    
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
