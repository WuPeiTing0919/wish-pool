# 數據遷移指南 - 從 Supabase 到 MySQL

## 📋 概述

本指南將幫助您將現有的 Supabase 數據遷移到 MySQL 資料庫，並設置相應的統計功能。

## 🔧 前置準備

### 1. 獲取 Supabase 連接資訊

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 前往 **Settings** → **API**
4. 複製以下資訊：
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. 確認 MySQL 資料庫已設置

確保您已經執行過：
```bash
node scripts/create-basic-tables.js
node scripts/create-views-procedures.js
```

## 🚀 執行數據遷移

### 方法一：使用環境變數（推薦）

#### Windows:
```cmd
set NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
node scripts/migrate-with-env.js
```

#### Linux/Mac:
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
node scripts/migrate-with-env.js
```

### 方法二：直接在命令中設定

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key node scripts/migrate-with-env.js
```

## 📊 遷移內容

遷移腳本會處理以下數據：

1. **困擾案例 (wishes)**
   - 標題、描述、解決方案
   - 公開/私密狀態
   - 分類和優先級
   - 圖片數據
   - 創建和更新時間

2. **點讚記錄 (wish_likes)**
   - 用戶會話 ID
   - IP 地址和用戶代理
   - 創建時間

3. **用戶設定 (user_settings)**
   - 音樂偏好
   - 主題設定
   - 語言偏好
   - 通知設定

4. **系統統計 (system_stats)**
   - 日統計數據
   - 困擾案例數量
   - 點讚數量
   - 活躍用戶數

## 🔄 統計功能替代方案

由於 MySQL 觸發器需要 SUPER 權限，我們提供了應用程式層面的統計服務：

### 自動統計更新

- **困擾案例創建/更新/刪除**：自動更新統計數據
- **點讚/取消點讚**：自動更新點讚統計
- **用戶設定更新**：更新活躍用戶統計

### 手動重新計算統計

如果需要重新計算所有統計數據：

```typescript
import { StatisticsService } from '@/lib/statistics-service'

// 重新計算所有統計
const stats = await StatisticsService.recalculateAllStats()
console.log('統計數據:', stats)
```

## 🧪 測試遷移結果

### 1. 檢查數據完整性

```bash
node scripts/test-mysql-connection.js
```

### 2. 驗證統計數據

```typescript
import { StatisticsService } from '@/lib/statistics-service'

// 獲取當前統計
const stats = await StatisticsService.getStatistics()
console.log('當前統計:', stats)
```

### 3. 檢查應用程式功能

1. 啟動開發服務器：`npm run dev`
2. 測試困擾案例創建
3. 測試點讚功能
4. 檢查分析頁面

## 🔧 故障排除

### 常見問題

#### 1. 環境變數未設定
```
❌ 請設定 Supabase 環境變數
```
**解決方案**：按照上述方法設定環境變數

#### 2. 連接失敗
```
❌ 資料庫連接失敗
```
**解決方案**：
- 檢查 Supabase URL 和 Key 是否正確
- 確認 MySQL 資料庫連接正常
- 檢查網路連接

#### 3. 數據重複
```
⚠️ 遷移完成，但有 X 個項目失敗
```
**解決方案**：
- 檢查錯誤詳情
- 清理重複數據
- 重新執行遷移

#### 4. 統計數據不準確
**解決方案**：
```typescript
// 重新計算統計數據
await StatisticsService.recalculateAllStats()
```

### 調試工具

#### 檢查 Supabase 數據
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// 檢查困擾案例數量
const { count } = await supabase
  .from('wishes')
  .select('*', { count: 'exact', head: true })

console.log('Supabase 困擾案例數量:', count)
```

#### 檢查 MySQL 數據
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 檢查困擾案例數量
const count = await prisma.wish.count()
console.log('MySQL 困擾案例數量:', count)
```

## 📈 性能優化

### 1. 批量遷移

對於大量數據，可以修改遷移腳本使用批量插入：

```typescript
// 批量插入困擾案例
await prisma.wish.createMany({
  data: wishes.map(wish => ({
    title: wish.title,
    currentPain: wish.current_pain,
    // ... 其他字段
  }))
})
```

### 2. 並行處理

```typescript
// 並行遷移不同類型的數據
await Promise.all([
  migrateWishes(),
  migrateLikes(),
  migrateUserSettings(),
  migrateSystemStats()
])
```

### 3. 進度追蹤

```typescript
// 添加進度條
const total = wishes.length
let processed = 0

for (const wish of wishes) {
  // 遷移邏輯
  processed++
  console.log(`進度: ${processed}/${total} (${Math.round(processed/total*100)}%)`)
}
```

## 🔒 安全注意事項

1. **環境變數安全**
   - 不要在代碼中硬編碼 Supabase 密鑰
   - 使用 `.env.local` 文件（已被 .gitignore 忽略）
   - 生產環境使用安全的環境變數管理

2. **數據備份**
   - 遷移前備份 Supabase 數據
   - 遷移後驗證數據完整性
   - 保留原始數據直到確認遷移成功

3. **權限控制**
   - 確保 MySQL 用戶只有必要的權限
   - 定期檢查和更新密碼

## ✅ 完成檢查清單

- [ ] Supabase 連接資訊已獲取
- [ ] MySQL 資料庫結構已創建
- [ ] 環境變數已設定
- [ ] 數據遷移已執行
- [ ] 遷移結果已驗證
- [ ] 統計功能已測試
- [ ] 應用程式功能已確認
- [ ] 數據備份已完成

## 📞 支援

如果遇到問題：

1. 檢查錯誤日誌
2. 確認環境變數設定
3. 驗證資料庫連接
4. 查看遷移報告
5. 重新計算統計數據

---

**注意**：遷移過程中請確保有穩定的網路連接，並在非高峰時段執行以避免影響正常使用。
