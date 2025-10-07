import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, filename } = body
    
    console.log(`🔍 後台管理 - 匯出 Excel: ${filename}`)
    
    // 動態導入 xlsx
    const XLSX = await import('xlsx')
    
    // 準備 Excel 數據
    const excelData = data.map((wish: any) => ({
      'ID': wish.id,
      '標題': wish.title,
      '遇到的困擾': wish.current_pain,
      '期望的解決方式': wish.expected_solution,
      '預期效果': wish.expected_effect || '',
      '是否公開': wish.is_public ? '是' : '否',
      '電子郵件': wish.email || '',
      '狀態': wish.status === 'active' ? '活躍' : '非活躍',
      '類別': wish.category || '未分類',
      '優先級': wish.priority,
      '點讚數': wish.like_count,
      '創建時間': new Date(wish.created_at).toLocaleString('zh-TW'),
      '更新時間': new Date(wish.updated_at).toLocaleString('zh-TW'),
      '用戶會話': wish.user_session
    }))
    
    // 創建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 創建工作表
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // 設置列寬
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 30 },  // 標題
      { wch: 40 },  // 遇到的困擾
      { wch: 40 },  // 期望的解決方式
      { wch: 30 },  // 預期效果
      { wch: 10 },  // 是否公開
      { wch: 25 },  // 電子郵件
      { wch: 10 },  // 狀態
      { wch: 15 },  // 類別
      { wch: 8 },   // 優先級
      { wch: 8 },   // 點讚數
      { wch: 20 },  // 創建時間
      { wch: 20 },  // 更新時間
      { wch: 25 }   // 用戶會話
    ]
    worksheet['!cols'] = columnWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '困擾案例數據')
    
    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    })
    
    console.log(`✅ 成功生成 Excel 文件: ${excelData.length} 筆數據`)
    
    // 返回文件
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('Excel 匯出錯誤:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export Excel' },
      { status: 500 }
    )
  }
}
