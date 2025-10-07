// 統計服務 - 替代 MySQL 觸發器功能
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 統計更新服務
export class StatisticsService {
  // 更新困擾案例統計
  static async updateWishStats(wishId: number, action: 'create' | 'update' | 'delete', isPublic?: boolean) {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (action === 'create') {
        // 創建困擾案例
        await prisma.systemStat.upsert({
          where: { statDate: today },
          update: {
            totalWishes: { increment: 1 },
            publicWishes: { increment: isPublic ? 1 : 0 },
            privateWishes: { increment: isPublic ? 0 : 1 }
          },
          create: {
            statDate: today,
            totalWishes: 1,
            publicWishes: isPublic ? 1 : 0,
            privateWishes: isPublic ? 0 : 1,
            totalLikes: 0,
            activeUsers: 0,
            storageUsedMb: 0
          }
        })
      } else if (action === 'delete') {
        // 刪除困擾案例
        const existing = await prisma.systemStat.findUnique({
          where: { statDate: today }
        })

        if (existing) {
          await prisma.systemStat.update({
            where: { statDate: today },
            data: {
              totalWishes: Math.max(existing.totalWishes - 1, 0),
              publicWishes: Math.max(existing.publicWishes - (isPublic ? 1 : 0), 0),
              privateWishes: Math.max(existing.privateWishes - (isPublic ? 0 : 1), 0)
            }
          })
        }
      } else if (action === 'update') {
        // 更新困擾案例（公開狀態變更）
        const existing = await prisma.systemStat.findUnique({
          where: { statDate: today }
        })

        if (existing) {
          await prisma.systemStat.update({
            where: { statDate: today },
            data: {
              publicWishes: { increment: isPublic ? 1 : -1 },
              privateWishes: { increment: isPublic ? -1 : 1 }
            }
          })
        }
      }
    } catch (error) {
      console.error('更新困擾案例統計失敗:', error)
    }
  }

  // 更新點讚統計
  static async updateLikeStats(wishId: number, action: 'create' | 'delete') {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (action === 'create') {
        await prisma.systemStat.upsert({
          where: { statDate: today },
          update: {
            totalLikes: { increment: 1 }
          },
          create: {
            statDate: today,
            totalWishes: 0,
            publicWishes: 0,
            privateWishes: 0,
            totalLikes: 1,
            activeUsers: 0,
            storageUsedMb: 0
          }
        })
      } else if (action === 'delete') {
        const existing = await prisma.systemStat.findUnique({
          where: { statDate: today }
        })

        if (existing) {
          await prisma.systemStat.update({
            where: { statDate: today },
            data: {
              totalLikes: Math.max(existing.totalLikes - 1, 0)
            }
          })
        }
      }
    } catch (error) {
      console.error('更新點讚統計失敗:', error)
    }
  }

  // 更新活躍用戶統計
  static async updateActiveUserStats(userSession: string) {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 檢查今天是否已經統計過這個用戶
      const existing = await prisma.systemStat.findUnique({
        where: { statDate: today }
      })

      if (existing) {
        // 簡單的活躍用戶計數（實際應用中可能需要更複雜的邏輯）
        await prisma.systemStat.update({
          where: { statDate: today },
          data: {
            activeUsers: { increment: 1 }
          }
        })
      } else {
        await prisma.systemStat.create({
          data: {
            statDate: today,
            totalWishes: 0,
            publicWishes: 0,
            privateWishes: 0,
            totalLikes: 0,
            activeUsers: 1,
            storageUsedMb: 0
          }
        })
      }
    } catch (error) {
      console.error('更新活躍用戶統計失敗:', error)
    }
  }

  // 獲取統計數據
  static async getStatistics() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const stats = await prisma.systemStat.findUnique({
        where: { statDate: today }
      })

      if (!stats) {
        return {
          totalWishes: 0,
          publicWishes: 0,
          privateWishes: 0,
          totalLikes: 0,
          activeUsers: 0,
          storageUsedMb: 0
        }
      }

      return stats
    } catch (error) {
      console.error('獲取統計數據失敗:', error)
      return null
    }
  }

  // 重新計算所有統計數據
  static async recalculateAllStats() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 計算總困擾數
      const totalWishes = await prisma.wish.count({
        where: { status: 'active' }
      })

      // 計算公開困擾數
      const publicWishes = await prisma.wish.count({
        where: { 
          status: 'active',
          isPublic: true 
        }
      })

      // 計算私密困擾數
      const privateWishes = await prisma.wish.count({
        where: { 
          status: 'active',
          isPublic: false 
        }
      })

      // 計算總點讚數
      const totalLikes = await prisma.wishLike.count()

      // 計算本週新增困擾數
      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)
      const thisWeekWishes = await prisma.wish.count({
        where: {
          status: 'active',
          createdAt: { gte: thisWeek }
        }
      })

      // 計算上週新增困擾數
      const lastWeekStart = new Date()
      lastWeekStart.setDate(lastWeekStart.getDate() - 14)
      const lastWeekEnd = new Date()
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)
      const lastWeekWishes = await prisma.wish.count({
        where: {
          status: 'active',
          createdAt: { 
            gte: lastWeekStart,
            lt: lastWeekEnd
          }
        }
      })

      // 更新或創建統計記錄
      await prisma.systemStat.upsert({
        where: { statDate: today },
        update: {
          totalWishes,
          publicWishes,
          privateWishes,
          totalLikes,
          activeUsers: 0, // 需要更複雜的邏輯來計算活躍用戶
          storageUsedMb: 0 // 需要計算實際儲存使用量
        },
        create: {
          statDate: today,
          totalWishes,
          publicWishes,
          privateWishes,
          totalLikes,
          activeUsers: 0,
          storageUsedMb: 0
        }
      })

      return {
        totalWishes,
        publicWishes,
        privateWishes,
        totalLikes,
        thisWeekWishes,
        lastWeekWishes
      }
    } catch (error) {
      console.error('重新計算統計數據失敗:', error)
      return null
    }
  }
}

export default StatisticsService
