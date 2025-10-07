import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wishId = parseInt(params.id)
    
    if (isNaN(wishId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wish ID' },
        { status: 400 }
      )
    }

    console.log(`🔍 後台管理 - 獲取困擾案例詳細資訊: ID=${wishId}`)

    // 獲取 wish 詳細資訊
    const wish = await prisma.wish.findUnique({
      where: { id: wishId },
      include: {
        likes: {
          select: {
            id: true,
            userSession: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true
          }
        }
      }
    })

    if (!wish) {
      return NextResponse.json(
        { success: false, error: 'Wish not found' },
        { status: 404 }
      )
    }

    // 處理圖片數據
    let images = []
    if (wish.images && Array.isArray(wish.images)) {
      images = wish.images.map((img: any) => ({
        id: img.id,
        name: img.name,
        size: img.size,
        type: img.type,
        url: img.public_url || img.base64 || img.url || img.storage_path,
        base64: img.base64,
        storage_path: img.storage_path,
        public_url: img.public_url,
        uploaded_at: img.uploaded_at
      }))
    }

    // 轉換數據格式
    const wishDetails = {
      id: Number(wish.id),
      title: wish.title,
      currentPain: wish.currentPain,
      expectedSolution: wish.expectedSolution,
      expectedEffect: wish.expectedEffect,
      isPublic: wish.isPublic,
      email: wish.email,
      images: images,
      userSession: wish.userSession,
      status: wish.status,
      category: wish.category,
      priority: Number(wish.priority),
      createdAt: wish.createdAt.toISOString(),
      updatedAt: wish.updatedAt.toISOString(),
      likes: wish.likes.map(like => ({
        id: Number(like.id),
        userSession: like.userSession,
        ipAddress: like.ipAddress,
        userAgent: like.userAgent,
        createdAt: like.createdAt.toISOString()
      }))
    }

    console.log(`✅ 成功獲取困擾案例詳細資訊: ${wishDetails.title}`)

    return NextResponse.json({
      success: true,
      data: wishDetails
    })

  } catch (error) {
    console.error('獲取困擾案例詳細資訊失敗:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wish details' },
      { status: 500 }
    )
  }
}
