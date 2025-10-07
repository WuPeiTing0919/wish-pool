# MySQL 資料庫遷移指南

## 📋 概述

本指南將幫助您將心願星河專案從 Supabase 遷移到 MySQL 資料庫。

## 🗄️ 資料庫資訊

- **主機**: mysql.theaken.com
- **端口**: 33306
- **資料庫名**: db_wish_pool
- **用戶名**: wish_pool
- **密碼**: Aa123456

## 🚀 遷移步驟

### 1. 環境準備

#### 1.1 安裝依賴
```bash
npm install @prisma/client prisma mysql2
```

#### 1.2 設定環境變數
創建 `.env.local` 檔案：
```env
# MySQL 資料庫連接
DATABASE_URL="mysql://wish_pool:Aa123456@mysql.theaken.com:33306/db_wish_pool?schema=public"

# 資料庫類型 (mysql 或 supabase)
DATABASE_TYPE="mysql"

# 其他配置...
NEXT_PUBLIC_APP_NAME="資訊部．心願星河"
ENABLE_IP_WHITELIST=false
```

### 2. 資料庫初始化

#### 2.1 執行資料庫結構腳本
```bash
# 連接到 MySQL 並執行結構腳本
mysql -h mysql.theaken.com -P 33306 -u wish_pool -p db_wish_pool < scripts/mysql-schema.sql
```

#### 2.2 生成 Prisma 客戶端
```bash
npx prisma generate
```

#### 2.3 測試資料庫連接
```bash
node scripts/test-mysql-connection.js
```

### 3. 資料遷移

#### 3.1 從 Supabase 遷移數據
```bash
# 確保 Supabase 環境變數已設定
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"

# 執行遷移腳本
node scripts/migrate-to-mysql.js
```

#### 3.2 驗證遷移結果
```bash
# 檢查數據是否正確遷移
node scripts/test-mysql-connection.js
```

### 4. 更新應用程式配置

#### 4.1 更新服務層
將現有的 Supabase 服務替換為統一的資料庫服務：

```typescript
// 在需要的地方替換
import { WishService, LikeService, UserSettingsService } from '@/lib/database-service'

// 而不是
// import { WishService } from '@/lib/supabase-service'
```

#### 4.2 更新頁面組件
確保所有頁面都使用新的服務層：

```typescript
// app/submit/page.tsx
import { WishService } from '@/lib/database-service'

// app/wishes/page.tsx  
import { WishService, LikeService } from '@/lib/database-service'

// app/analytics/page.tsx
import { WishService } from '@/lib/database-service'
```

### 5. 測試和驗證

#### 5.1 功能測試
1. 測試困擾案例創建
2. 測試困擾案例顯示
3. 測試點讚功能
4. 測試分析頁面
5. 測試用戶設定

#### 5.2 性能測試
```bash
# 啟動開發服務器
npm run dev

# 測試各項功能
```

## 📊 資料庫結構

### 主要表格

1. **wishes** - 困擾案例主表
   - 支援多媒體內容 (JSON格式)
   - 公開/私密狀態控制
   - 自動分類和優先級

2. **wish_likes** - 點讚記錄表
   - 匿名會話追蹤
   - 防重複點讚機制

3. **user_settings** - 用戶設定表
   - 音樂偏好設定
   - 主題和語言選項

4. **migration_log** - 數據遷移記錄
   - 遷移過程追蹤

5. **system_stats** - 系統統計表
   - 日統計數據
   - 儲存使用量追蹤

### 視圖和函數

- **wishes_with_likes**: 帶點讚數的困擾視圖
- **GetWishesStats()**: 統計數據存儲過程

## 🔧 故障排除

### 常見問題

#### 1. 連接失敗
```
Error: connect ECONNREFUSED
```
**解決方案**: 檢查資料庫連接資訊和網路連接

#### 2. 權限錯誤
```
Error: Access denied for user 'wish_pool'@'%'
```
**解決方案**: 確認資料庫用戶權限設定

#### 3. 表格不存在
```
Error: Table 'db_wish_pool.wishes' doesn't exist
```
**解決方案**: 執行 `scripts/mysql-schema.sql` 腳本

#### 4. 存儲過程錯誤
```
Error: PROCEDURE GetWishesStats does not exist
```
**解決方案**: 重新執行資料庫結構腳本

### 調試工具

#### 1. 檢查資料庫狀態
```sql
-- 連接到 MySQL
mysql -h mysql.theaken.com -P 33306 -u wish_pool -p db_wish_pool

-- 檢查表格
SHOW TABLES;

-- 檢查視圖
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- 檢查存儲過程
SHOW PROCEDURE STATUS WHERE Db = 'db_wish_pool';
```

#### 2. 檢查數據遷移
```sql
-- 檢查困擾案例數量
SELECT COUNT(*) FROM wishes;

-- 檢查點讚記錄
SELECT COUNT(*) FROM wish_likes;

-- 檢查用戶設定
SELECT COUNT(*) FROM user_settings;
```

## 📈 性能優化

### 索引優化
資料庫已包含以下索引：
- `idx_public_created` - 公開困擾按時間排序
- `idx_user_session` - 用戶會話查詢
- `idx_category` - 分類查詢
- `idx_wish_id` - 點讚關聯查詢

### 查詢優化
- 使用視圖 `wishes_with_likes` 減少 JOIN 查詢
- 使用存儲過程 `GetWishesStats()` 提高統計查詢效率
- 適當使用分頁限制結果集大小

## 🔄 回滾方案

如果需要回滾到 Supabase：

1. 更新環境變數：
```env
DATABASE_TYPE="supabase"
```

2. 恢復原始服務導入：
```typescript
import { WishService } from '@/lib/supabase-service'
```

3. 重新部署應用程式

## 📞 支援

如果遇到問題，請檢查：

1. 資料庫連接是否正常
2. 環境變數是否正確設定
3. 資料庫結構是否完整
4. 遷移腳本是否成功執行

## ✅ 完成檢查清單

- [ ] 環境變數設定完成
- [ ] 資料庫結構創建完成
- [ ] Prisma 客戶端生成完成
- [ ] 資料遷移執行完成
- [ ] 應用程式配置更新完成
- [ ] 功能測試通過
- [ ] 性能測試通過
- [ ] 文檔更新完成

---

**注意**: 遷移過程中請確保備份重要數據，並在測試環境中先進行完整測試。
