# 🚀 心願星河 - Supabase 完整建置指南

## 📋 目錄
- [前置準備](#前置準備)
- [Supabase 項目設置](#supabase-項目設置)
- [本地環境配置](#本地環境配置)
- [數據庫建置](#數據庫建置)
- [存儲服務設置](#存儲服務設置)
- [安全政策配置](#安全政策配置)
- [測試驗證](#測試驗證)
- [數據遷移](#數據遷移)
- [部署準備](#部署準備)
- [故障排除](#故障排除)

---

## 🎯 前置準備

### 系統需求
- Node.js 18+ 
- npm 或 yarn
- 現代瀏覽器
- Supabase 帳號

### 預估時間
- 初次設置：30-45 分鐘
- 數據遷移：5-10 分鐘
- 測試驗證：10-15 分鐘

---

## 🏗️ Supabase 項目設置

### 1. 創建新項目
1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊 **"New Project"**
3. 填寫項目資訊：
   \`\`\`
   Name: wish-pool-production
   Organization: [選擇你的組織]
   Database Password: [設置強密碼，請記住！]
   Region: [選擇最近的區域，建議 ap-southeast-1]
   \`\`\`
4. 點擊 **"Create new project"**
5. 等待 2-3 分鐘完成初始化

### 2. 獲取項目配置
項目創建完成後：
1. 進入項目 Dashboard
2. 左側選單 → **Settings** → **API**
3. 複製以下資訊：
   \`\`\`
   Project URL: https://[your-project-id].supabase.co
   anon public key: eyJ... (很長的字串)
   service_role key: eyJ... (僅在需要管理員功能時使用)
   \`\`\`

---

## ⚙️ 本地環境配置

### 1. 安裝依賴
\`\`\`bash
# 安裝 Supabase 客戶端
npm install @supabase/supabase-js

# 如果需要圖片處理功能
npm install sharp
\`\`\`

### 2. 環境變數設置
1. 複製環境變數範本：
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. 編輯 `.env.local`：
   \`\`\`env
   # Supabase 配置
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # 可選：管理員功能（謹慎使用）
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # 應用配置
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   \`\`\`

### 3. 驗證連接
\`\`\`bash
# 啟動開發服務器
npm run dev

# 檢查控制台是否有 Supabase 連接錯誤
\`\`\`

---

## 🗄️ 數據庫建置

### 執行順序很重要！請按照以下順序執行 SQL 腳本：

### 步驟 1: 創建基礎表格
1. 進入 Supabase Dashboard
2. 左側選單 → **SQL Editor**
3. 點擊 **"New Query"**
4. 複製並執行 `scripts/01-create-tables.sql`
5. 確認執行成功（無錯誤訊息）

### 步驟 2: 創建索引和觸發器
1. 新建查詢
2. 複製並執行 `scripts/02-create-indexes.sql`
3. 確認所有索引創建成功

### 步驟 3: 創建視圖和函數
1. 新建查詢
2. 複製並執行 `scripts/03-create-views-functions.sql`
3. 確認視圖和函數創建成功

### 步驟 4: 設置存儲服務
1. 新建查詢
2. 複製並執行 `scripts/04-setup-storage.sql`
3. 檢查 Storage → Buckets 是否出現新的桶

### 步驟 5: 配置安全政策
1. 新建查詢
2. 複製並執行 `scripts/05-setup-rls.sql`
3. 確認 RLS 政策設置完成

---

## 📁 存儲服務設置

### 存儲桶說明
- **wish-images**: 主要圖片存儲（5MB 限制）
- **wish-thumbnails**: 縮圖存儲（1MB 限制）

### 支援格式
- JPEG, JPG, PNG, WebP, GIF
- 自動壓縮和優化
- CDN 加速分發

### 存儲政策
- 公開讀取：所有人可查看圖片
- 限制上傳：防止濫用
- 自動清理：定期清理孤立圖片

---

## 🔒 安全政策配置

### Row Level Security (RLS)
所有表格都啟用了 RLS，確保數據安全：

#### wishes 表格
- ✅ 公開困擾案例：所有人可查看
- ✅ 私密困擾案例：僅統計使用
- ✅ 插入權限：所有人可提交

#### wish_likes 表格
- ✅ 查看權限：用於統計顯示
- ✅ 插入權限：所有人可點讚
- ✅ 防重複：同一用戶不可重複點讚

#### user_settings 表格
- ✅ 個人設定：用戶只能管理自己的設定
- ✅ 會話隔離：基於 session ID 區分用戶

---

## 🧪 測試驗證

### 1. 數據庫連接測試
\`\`\`sql
-- 在 SQL Editor 中執行
SELECT 'Database connection successful!' as status;
\`\`\`

### 2. 表格結構驗證
\`\`\`sql
-- 檢查所有表格是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
\`\`\`

### 3. 存儲服務測試
1. 進入 Storage → wish-images
2. 嘗試上傳一張測試圖片
3. 確認可以正常預覽

### 4. 功能測試清單
- [ ] 提交新的困擾案例
- [ ] 上傳圖片附件
- [ ] 點讚功能
- [ ] 查看統計數據
- [ ] 背景音樂設定保存
- [ ] 響應式設計正常

---

## 🔄 數據遷移

### 自動遷移流程
1. 啟動應用程式
2. 如果檢測到本地數據，會自動顯示遷移對話框
3. 點擊 **"開始遷移"** 
4. 等待遷移完成
5. 驗證數據完整性

### 手動遷移（如需要）
\`\`\`javascript
// 在瀏覽器控制台執行
console.log('Local wishes:', JSON.parse(localStorage.getItem('wishes') || '[]'));
console.log('Local likes:', JSON.parse(localStorage.getItem('wishLikes') || '{}'));
\`\`\`

### 遷移後清理
\`\`\`javascript
// 確認遷移成功後，清理本地數據
localStorage.removeItem('wishes');
localStorage.removeItem('wishLikes');
localStorage.removeItem('userLikedWishes');
\`\`\`

---

## 🚀 部署準備

### 1. 環境變數設置
在部署平台（Vercel/Netlify）設置：
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
\`\`\`

### 2. 生產環境優化
\`\`\`sql
-- 執行生產環境優化
SELECT optimize_database_performance();
\`\`\`

### 3. 備份設置
1. 進入 Supabase Dashboard
2. Settings → Database → Backups
3. 確認自動備份已啟用

---

## 🔧 故障排除

### 常見問題

#### 1. 連接失敗
**症狀**: `Failed to connect to Supabase`
**解決方案**:
- 檢查環境變數是否正確
- 確認 Supabase 項目狀態正常
- 檢查網路連接

#### 2. RLS 政策錯誤
**症狀**: `Row Level Security policy violation`
**解決方案**:
\`\`\`sql
-- 檢查 RLS 政策
SELECT * FROM pg_policies WHERE tablename = 'wishes';
\`\`\`

#### 3. 存儲上傳失敗
**症狀**: 圖片上傳失敗
**解決方案**:
- 檢查檔案大小（<5MB）
- 確認檔案格式支援
- 檢查存儲桶政策

#### 4. 性能問題
**症狀**: 查詢速度慢
**解決方案**:
\`\`\`sql
-- 檢查索引使用情況
EXPLAIN ANALYZE SELECT * FROM wishes_with_likes LIMIT 10;
\`\`\`

### 日誌檢查
1. Supabase Dashboard → Logs
2. 查看 Database、API、Storage 日誌
3. 過濾錯誤和警告訊息

### 性能監控
\`\`\`sql
-- 檢查數據庫性能
SELECT * FROM get_performance_stats();
\`\`\`

---

## 📊 維護建議

### 定期維護任務

#### 每週
- [ ] 檢查錯誤日誌
- [ ] 監控存儲使用量
- [ ] 清理孤立圖片

#### 每月
- [ ] 分析查詢性能
- [ ] 檢查備份完整性
- [ ] 更新統計數據

#### 每季
- [ ] 檢查安全政策
- [ ] 優化數據庫索引
- [ ] 評估擴展需求

### 清理腳本
\`\`\`sql
-- 清理 30 天前的孤立圖片
SELECT cleanup_orphaned_images();

-- 更新統計數據
REFRESH MATERIALIZED VIEW wishes_stats_cache;
\`\`\`

---

## 🎉 完成檢查清單

設置完成後，請確認以下項目：

### 基礎設置
- [ ] Supabase 項目創建成功
- [ ] 環境變數配置正確
- [ ] 所有 SQL 腳本執行成功
- [ ] 存儲桶創建完成

### 功能測試
- [ ] 可以提交新困擾案例
- [ ] 圖片上傳功能正常
- [ ] 點讚功能運作正常
- [ ] 統計數據顯示正確
- [ ] 用戶設定保存成功

### 安全檢查
- [ ] RLS 政策生效
- [ ] 無法訪問他人私密數據
- [ ] 存儲權限設置正確

### 性能驗證
- [ ] 頁面載入速度正常
- [ ] 圖片載入速度快
- [ ] 查詢響應時間合理

---

## 📞 支援資源

- **Supabase 官方文檔**: https://supabase.com/docs
- **Next.js 整合指南**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **故障排除指南**: https://supabase.com/docs/guides/platform/troubleshooting

---

**🌟 恭喜！你的心願星河已經成功整合 Supabase！**

現在你可以享受雲端數據存儲、圖片管理、實時同步等強大功能。如果遇到任何問題，請參考故障排除章節或聯繫技術支援。
\`\`\`
