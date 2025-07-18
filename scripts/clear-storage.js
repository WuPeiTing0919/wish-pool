#!/usr/bin/env node

/**
 * 心願星河 - 清空 Supabase Storage
 * 
 * ⚠️ 警告：此腳本將永久刪除所有存儲的圖片文件！
 * 
 * 使用方法：
 * 1. 確保已安裝依賴：npm install
 * 2. 設置環境變數或在 .env.local 中配置 Supabase 連接
 * 3. 執行腳本：node scripts/clear-storage.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 載入環境變數
require('dotenv').config({ path: '.env.local' });

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 檢查必要的環境變數
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 錯誤：缺少必要的環境變數');
  console.error('請確保已設置以下環境變數：');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 初始化 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 存儲桶名稱
const BUCKETS = ['wish-images', 'wish-thumbnails'];

/**
 * 清空指定存儲桶中的所有文件
 */
async function clearBucket(bucketName) {
  try {
    console.log(`\n🗂️ 正在處理存儲桶：${bucketName}`);
    
    // 列出所有文件
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (listError) {
      console.error(`❌ 列出 ${bucketName} 文件時出錯:`, listError.message);
      return false;
    }
    
    if (!files || files.length === 0) {
      console.log(`✅ ${bucketName} 已經是空的`);
      return true;
    }
    
    console.log(`📊 找到 ${files.length} 個文件`);
    
    // 獲取所有文件路徑（包括子目錄）
    const allFilePaths = [];
    
    for (const file of files) {
      if (file.name && file.name !== '.emptyFolderPlaceholder') {
        // 如果是目錄，遞歸獲取其中的文件
        if (!file.metadata) {
          const { data: subFiles, error: subListError } = await supabase.storage
            .from(bucketName)
            .list(file.name, { limit: 1000 });
          
          if (!subListError && subFiles) {
            subFiles.forEach(subFile => {
              if (subFile.name && subFile.name !== '.emptyFolderPlaceholder') {
                allFilePaths.push(`${file.name}/${subFile.name}`);
              }
            });
          }
        } else {
          allFilePaths.push(file.name);
        }
      }
    }
    
    if (allFilePaths.length === 0) {
      console.log(`✅ ${bucketName} 中沒有需要刪除的文件`);
      return true;
    }
    
    console.log(`🗑️ 準備刪除 ${allFilePaths.length} 個文件...`);
    
    // 批量刪除文件
    const batchSize = 50; // Supabase 建議的批量操作大小
    let totalDeleted = 0;
    let hasErrors = false;
    
    for (let i = 0; i < allFilePaths.length; i += batchSize) {
      const batch = allFilePaths.slice(i, i + batchSize);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove(batch);
      
      if (error) {
        console.error(`❌ 刪除批次 ${Math.floor(i/batchSize) + 1} 時出錯:`, error.message);
        hasErrors = true;
      } else {
        totalDeleted += batch.length;
        console.log(`✅ 已刪除批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(allFilePaths.length/batchSize)} (${batch.length} 個文件)`);
      }
      
      // 避免請求過於頻繁
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`📊 ${bucketName} 清空完成：刪除了 ${totalDeleted}/${allFilePaths.length} 個文件`);
    return !hasErrors;
    
  } catch (error) {
    console.error(`❌ 清空 ${bucketName} 時發生未預期錯誤:`, error.message);
    return false;
  }
}

/**
 * 驗證存儲桶是否存在
 */
async function verifyBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ 無法獲取存儲桶列表:', error.message);
      return false;
    }
    
    const existingBuckets = buckets.map(bucket => bucket.id);
    const missingBuckets = BUCKETS.filter(bucket => !existingBuckets.includes(bucket));
    
    if (missingBuckets.length > 0) {
      console.warn('⚠️ 以下存儲桶不存在，將跳過:', missingBuckets.join(', '));
      return BUCKETS.filter(bucket => existingBuckets.includes(bucket));
    }
    
    return BUCKETS;
  } catch (error) {
    console.error('❌ 驗證存儲桶時發生錯誤:', error.message);
    return false;
  }
}

/**
 * 主函數
 */
async function main() {
  console.log('🚀 開始清空 Supabase Storage...');
  console.log('⚠️ 警告：這將永久刪除所有存儲的圖片文件！');
  
  // 驗證存儲桶
  const bucketsToProcess = await verifyBuckets();
  if (!bucketsToProcess || bucketsToProcess.length === 0) {
    console.error('❌ 沒有可處理的存儲桶');
    process.exit(1);
  }
  
  console.log(`📋 將處理 ${bucketsToProcess.length} 個存儲桶:`, bucketsToProcess.join(', '));
  
  // 給用戶 5 秒鐘考慮時間
  console.log('\n⏰ 5 秒後開始刪除... (按 Ctrl+C 取消)');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let allSuccess = true;
  
  // 清空每個存儲桶
  for (const bucket of bucketsToProcess) {
    const success = await clearBucket(bucket);
    if (!success) {
      allSuccess = false;
    }
  }
  
  // 顯示最終結果
  console.log('\n' + '='.repeat(50));
  if (allSuccess) {
    console.log('✅ 所有存儲桶清空完成！');
  } else {
    console.log('⚠️ 存儲桶清空完成，但過程中有一些錯誤');
  }
  
  console.log('\n📝 建議後續步驟：');
  console.log('1. 在 Supabase Dashboard 中確認 Storage 已清空');
  console.log('2. 執行 clear-all-data.sql 清空資料庫');
  console.log('3. 重新啟動應用程式');
}

// 錯誤處理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未處理的錯誤:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n❌ 用戶取消操作');
  process.exit(0);
});

// 執行主函數
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 腳本執行失敗:', error);
    process.exit(1);
  });
}

module.exports = { clearBucket, verifyBuckets }; 