import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wishId = searchParams.get('wishId')
    
    if (!wishId) {
      return NextResponse.json(
        { success: false, error: 'Wish ID is required' },
        { status: 400 }
      )
    }
    
    // 獲取指定困擾案例的點讚數
    const likeCount = await prisma.wishLike.count({
      where: {
        wishId: Number(wishId)
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        wishId: Number(wishId),
        likeCount: likeCount 
      } 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get like count' },
      { status: 500 }
    )
  }
}
