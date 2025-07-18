# 心願星河 - 數據清空指南

⚠️ **重要警告**：以下操作將永久刪除所有數據，請謹慎使用！

## 可用的清空腳本

### 1. 綜合清空腳本（推薦）
```bash
node scripts/clear-all.js
```
**功能**：一次性清空所有數據
- 清空 Supabase Storage 中的所有圖片
- 清空資料庫中的所有表格
- 重置自增序列
- 重新插入初始數據
- 驗證清空結果

### 2. 單獨清空 Storage
```bash
node scripts/clear-storage.js
```
**功能**：僅清空圖片存儲
- 清空 `wish-images` 存儲桶
- 清空 `wish-thumbnails` 存儲桶

### 3. 單獨清空資料庫
在 Supabase Dashboard 的 SQL Editor 中執行：
```sql
-- 執行 scripts/clear-all-data.sql 文件的內容
```

## 使用前準備

### 1. 確認環境變數
確保以下環境變數已正確設置（在 `.env.local` 文件中）：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # 可選，但建議設置
```

### 2. 安裝依賴
```bash
npm install
# 或
pnpm install
```

## 使用步驟

### 方案 A：一鍵清空（推薦）
```bash
# 執行綜合清空腳本
node scripts/clear-all.js

# 腳本會顯示 10 秒倒計時，按 Ctrl+C 可以取消
```

### 方案 B：分步驟清空
```bash
# 1. 先清空 Storage
node scripts/clear-storage.js

# 2. 再清空資料庫（在 Supabase Dashboard 中執行）
# 將 scripts/clear-all-data.sql 的內容貼到 SQL Editor 中執行
```

## 清空後的檢查

### 1. 驗證 Storage
在 Supabase Dashboard → Storage 中檢查：
- `wish-images` 桶應該是空的
- `wish-thumbnails` 桶應該是空的

### 2. 驗證資料庫
在 Supabase Dashboard → Table Editor 中檢查：
- `wishes` 表應該沒有記錄
- `wish_likes` 表應該沒有記錄
- `user_settings` 表應該沒有記錄
- 其他管理表格會有基礎的初始記錄

### 3. 測試應用程式
```bash
# 重新啟動開發服務器
npm run dev
# 或
pnpm dev
```

在瀏覽器中：
1. 清除 localStorage（開發者工具 → Application → Local Storage → Clear All）
2. 重新載入頁面
3. 測試提交新的困擾案例
4. 確認功能正常運行

## 故障排除

### 1. 權限錯誤
```
Error: Insufficient permissions
```
**解決方案**：確保使用 `SUPABASE_SERVICE_ROLE_KEY` 而不是 `ANON_KEY`

### 2. 存儲桶不存在
```
Error: Bucket does not exist
```
**解決方案**：正常現象，腳本會自動跳過不存在的存儲桶

### 3. 網路錯誤
```
Error: fetch failed
```
**解決方案**：檢查網路連接和 Supabase URL 是否正確

### 4. 資料庫連接錯誤
**解決方案**：
1. 檢查 Supabase 專案是否暫停
2. 驗證 URL 和密鑰是否正確
3. 確認專案是否有足夠的配額

## 注意事項

1. **備份重要數據**：在生產環境中執行前，請先備份重要數據
2. **測試環境優先**：建議先在測試環境中驗證腳本功能
3. **瀏覽器清除**：清空數據後記得清除瀏覽器的 localStorage
4. **應用重啟**：清空後建議重新啟動應用程式

## 聯絡支援

如果遇到問題，請檢查：
1. 控制台錯誤訊息
2. Supabase Dashboard 中的 Logs
3. 網路連接狀態
4. 環境變數配置 