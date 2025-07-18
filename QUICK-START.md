# 🚀 心願星河 - 快速開始指南

## 📥 下載和設置

### 1. 下載專案
- 點擊 v0 右上角的 **"Download Code"** 按鈕
- 選擇下載方式並解壓縮

### 2. 安裝依賴
\`\`\`bash
cd wish-pool
chmod +x setup-supabase.sh
./setup-supabase.sh
\`\`\`

### 3. 創建 Supabase 項目
1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊 "New Project"
3. 填寫項目資訊並等待創建完成

### 4. 配置環境變數
編輯 `.env.local` 檔案：
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 5. 執行 SQL 腳本
在 Supabase Dashboard 的 SQL Editor 中，按順序執行：
1. `scripts/01-create-tables.sql`
2. `scripts/02-create-indexes.sql`
3. `scripts/03-create-views-functions.sql`
4. `scripts/04-setup-storage.sql`
5. `scripts/05-setup-rls.sql`

### 6. 測試連接
\`\`\`bash
npm run test-supabase
\`\`\`

### 7. 啟動應用
\`\`\`bash
npm run dev
\`\`\`

## 🎯 重要提醒

- ✅ 必須在本地環境執行，不能在 v0 中完成
- ✅ 需要有 Supabase 帳號
- ✅ 按順序執行 SQL 腳本很重要
- ✅ 測試連接成功後再進行數據遷移

## 📞 需要幫助？

參考完整文檔：`SUPABASE-COMPLETE-SETUP.md`
