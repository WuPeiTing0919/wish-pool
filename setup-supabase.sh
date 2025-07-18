#!/bin/bash

# 心願星河 - Supabase 快速設置腳本
# 使用方法: chmod +x setup-supabase.sh && ./setup-supabase.sh

echo "🚀 心願星河 - Supabase 整合設置開始..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 請先安裝 Node.js"
    exit 1
fi

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 請先安裝 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安裝"

# 安裝依賴
echo "📦 安裝專案依賴..."
npm install

# 安裝 Supabase 客戶端
echo "📦 安裝 Supabase 客戶端..."
npm install @supabase/supabase-js

# 檢查環境變數檔案
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        echo "📝 複製環境變數範本..."
        cp .env.local.example .env.local
        echo "⚠️  請編輯 .env.local 檔案，填入你的 Supabase 配置"
    else
        echo "📝 創建環境變數檔案..."
        cat > .env.local << EOF
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 可選：Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF
        echo "⚠️  請編輯 .env.local 檔案，填入你的 Supabase 配置"
    fi
else
    echo "✅ .env.local 檔案已存在"
fi

# 檢查 SQL 腳本
echo "🗄️ 檢查 SQL 腳本..."
sql_files=(
    "scripts/01-create-tables.sql"
    "scripts/02-create-indexes.sql"
    "scripts/03-create-views-functions.sql"
    "scripts/04-setup-storage.sql"
    "scripts/05-setup-rls.sql"
)

missing_files=()
for file in "${sql_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ 所有 SQL 腳本檔案都存在"
else
    echo "❌ 缺少以下 SQL 腳本檔案："
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
fi

echo ""
echo "🎉 設置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 前往 https://supabase.com/dashboard 創建新項目"
echo "2. 編輯 .env.local 檔案，填入 Supabase 配置"
echo "3. 在 Supabase SQL Editor 中按順序執行 SQL 腳本："
for i in "${!sql_files[@]}"; do
    echo "   $((i+1)). ${sql_files[$i]}"
done
echo "4. 執行 npm run dev 測試本地環境"
echo "5. 部署到 Vercel: npx vercel --prod"
echo ""
echo "📖 詳細說明請參考 SUPABASE-COMPLETE-SETUP.md"
