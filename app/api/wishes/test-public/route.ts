import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 測試公開困擾案例查詢...')
    
    // 分步測試
    console.log('1. 測試基本查詢...')
    const allWishes = await prisma.wish.findMany({
      where: {
        status: 'active'
      },
      take: 3,
      select: {
        id: true,
        title: true,
        isPublic: true
      }
    })
    console.log(`✅ 基本查詢成功: ${allWishes.length} 筆`)
    
    console.log('2. 測試公開查詢...')
    const publicWishes = await prisma.wish.findMany({
      where: {
        isPublic: true,
        status: 'active'
      },
      take: 3,
      select: {
        id: true,
        title: true,
        isPublic: true
      }
    })
    console.log(`✅ 公開查詢成功: ${publicWishes.length} 筆`)
    
    // 轉換數據格式
    const formattedWishes = publicWishes.map((wish: any) => ({
      id: Number(wish.id),
      title: wish.title,
      isPublic: wish.isPublic
    }))
    
    return NextResponse.json({ 
      success: true, 
      data: formattedWishes,
      message: `成功獲取 ${publicWishes.length} 筆公開困擾案例`
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
