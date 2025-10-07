import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    console.log(`🔍 讀取真實數據: type=${type}`)
    
    // 讀取對應的 JSON 文件
    let dataFile
    if (type === 'public') {
      dataFile = path.join(process.cwd(), 'data', 'public-wishes.json')
    } else {
      dataFile = path.join(process.cwd(), 'data', 'all-wishes.json')
    }
    
    // 檢查文件是否存在
    if (!fs.existsSync(dataFile)) {
      console.log('❌ 數據文件不存在，正在生成...')
      return NextResponse.json(
        { success: false, error: 'Data file not found, please run get-real-data.js first' },
        { status: 404 }
      )
    }
    
    // 讀取文件
    const fileContent = fs.readFileSync(dataFile, 'utf8')
    const data = JSON.parse(fileContent)
    
    console.log(`✅ 成功讀取 ${data.data.length} 筆真實數據`)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read real data' },
      { status: 500 }
    )
  }
}
