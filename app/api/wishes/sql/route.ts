import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    // 使用原始 SQL 查詢，避免 Prisma 的排序問題
    let sql
    if (type === 'public') {
      sql = `
        SELECT id, title, currentPain, expectedSolution, expectedEffect, 
               isPublic, email, images, userSession, status, category, priority,
               createdAt, updatedAt
        FROM wishes 
        WHERE isPublic = true AND status = 'active'
        LIMIT 100
      `
    } else {
      sql = `
        SELECT id, title, currentPain, expectedSolution, expectedEffect, 
               isPublic, email, images, userSession, status, category, priority,
               createdAt, updatedAt
        FROM wishes 
        WHERE status = 'active'
        LIMIT 100
      `
    }
    
    const wishes = await prisma.$queryRawUnsafe(sql)
    
    // 轉換數據格式
    const formattedWishes = (wishes as any[]).map((wish: any) => ({
      ...wish,
      like_count: 0,  // 暫時設為 0，避免複雜查詢
      created_at: wish.createdAt.toISOString(),
      updated_at: wish.updatedAt.toISOString(),
      current_pain: wish.currentPain,
      expected_solution: wish.expectedSolution,
      expected_effect: wish.expectedEffect,
      is_public: wish.isPublic
    }))
    
    return NextResponse.json({ success: true, data: formattedWishes })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishes' },
      { status: 500 }
    )
  }
}
