import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 生成用戶會話 ID
    const userSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const wish = await prisma.wish.create({
      data: {
        title: body.title,
        currentPain: body.currentPain,
        expectedSolution: body.expectedSolution,
        expectedEffect: body.expectedEffect || null,
        isPublic: body.isPublic ?? true,
        email: body.email || null,
        images: body.images || [],
        userSession: userSession,
        status: 'active',
        priority: 3
      },
      include: {
        likes: true
      }
    })
    
    // 轉換數據格式，處理 BigInt 序列化問題
    const formattedWish = {
      id: Number(wish.id), // 轉換 BigInt 為 Number
      title: wish.title,
      current_pain: wish.currentPain,
      expected_solution: wish.expectedSolution,
      expected_effect: wish.expectedEffect,
      is_public: wish.isPublic,
      email: wish.email,
      images: wish.images,
      user_session: wish.userSession,
      status: wish.status,
      category: wish.category,
      priority: Number(wish.priority), // 轉換 BigInt 為 Number
      like_count: wish.likes.length,
      created_at: wish.createdAt.toISOString(),
      updated_at: wish.updatedAt.toISOString()
    }
    
    // 創建成功後，更新數據文件
    try {
      console.log('🔄 更新數據文件...')
      execSync('node scripts/get-real-data.js', { stdio: 'pipe' })
      console.log('✅ 數據文件更新完成')
    } catch (updateError) {
      console.warn('⚠️ 數據文件更新失敗:', updateError)
      // 不影響創建結果，只是警告
    }

    return NextResponse.json({ success: true, data: formattedWish })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create wish' },
      { status: 500 }
    )
  }
}
