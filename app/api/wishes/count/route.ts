import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 只獲取數量，避免排序問題
    const publicCount = await prisma.wish.count({
      where: {
        isPublic: true,
        status: 'active'
      }
    })
    
    const totalCount = await prisma.wish.count({
      where: {
        status: 'active'
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: {
        public: publicCount,
        total: totalCount
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch counts' },
      { status: 500 }
    )
  }
}
