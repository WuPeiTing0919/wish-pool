#!/usr/bin/env node

/**
 * 心願星河 - 綜合清空腳本
 * 
 * ⚠️ 警告：此腳本將永久刪除所有數據和文件！
 * 
 * 功能：
 * 1. 清空 Supabase Storage 中的所有圖片
 * 2. 清空資料庫中的所有數據
 * 3. 重置自增序列
 * 4. 重新初始化基礎數據
 * 
 * 使用方法：
 * node scripts/clear-all.js
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

/**
 * 清空存儲桶中的所有文件
 */
async function clearStorage() {
  console.log('\n📁 開始清空 Storage...');
  
  const buckets = ['wish-images', 'wish-thumbnails'];
  let allSuccess = true;
  
  for (const bucketName of buckets) {
    try {
      console.log(`\n🗂️ 正在處理存儲桶：${bucketName}`);
      
      // 列出所有文件
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1000 });
      
      if (listError) {
        if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
          console.log(`⚠️ 存儲桶 ${bucketName} 不存在，跳過`);
          continue;
        }
        console.error(`❌ 列出 ${bucketName} 文件時出錯:`, listError.message);
        allSuccess = false;
        continue;
      }
      
      if (!files || files.length === 0) {
        console.log(`✅ ${bucketName} 已經是空的`);
        continue;
      }
      
      // 獲取所有文件路徑
      const allFilePaths = [];
      for (const file of files) {
        if (file.name && file.name !== '.emptyFolderPlaceholder') {
          if (!file.metadata) {
            // 處理目錄
            const { data: subFiles } = await supabase.storage
              .from(bucketName)
              .list(file.name, { limit: 1000 });
            
            if (subFiles) {
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
        continue;
      }
      
      console.log(`🗑️ 刪除 ${allFilePaths.length} 個文件...`);
      
      // 批量刪除
      const batchSize = 50;
      for (let i = 0; i < allFilePaths.length; i += batchSize) {
        const batch = allFilePaths.slice(i, i + batchSize);
        const { error } = await supabase.storage.from(bucketName).remove(batch);
        
        if (error) {
          console.error(`❌ 刪除批次失敗:`, error.message);
          allSuccess = false;
        } else {
          console.log(`✅ 已刪除 ${Math.min(i + batchSize, allFilePaths.length)}/${allFilePaths.length} 個文件`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`❌ 處理 ${bucketName} 時發生錯誤:`, error.message);
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

/**
 * 修復 migration_log 表的約束問題
 */
async function fixMigrationLogConstraint() {
  console.log('\n🔧 修復 migration_log 表約束...');
  
  try {
    // 使用 rpc 調用執行 SQL，修復約束
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE migration_log DROP CONSTRAINT IF EXISTS migration_log_migration_type_check;
        ALTER TABLE migration_log ADD CONSTRAINT migration_log_migration_type_check 
        CHECK (migration_type IN ('wishes', 'likes', 'settings', 'storage_cleanup', 'data_cleanup', 'image_cleanup'));
      `
    });
    
    if (error) {
      console.log('⚠️ 無法通過 RPC 修復約束，嘗試其他方法...');
      // 如果 RPC 方法失敗，我們繼續執行，但會在日誌中使用允許的類型
      return false;
    }
    
    console.log('✅ migration_log 表約束已修復');
    return true;
  } catch (error) {
    console.log('⚠️ 修復約束時發生錯誤，但繼續執行:', error.message);
    return false;
  }
}

/**
 * 清空資料庫數據
 */
async function clearDatabase() {
  console.log('\n🗄️ 開始清空資料庫...');
  
  try {
         // 1. 清空有外鍵關係的表格（按依賴順序）
     const tablesToClear = [
       { name: 'wish_likes', description: '點讚記錄' },
       { name: 'wishes', description: '困擾案例' },
       { name: 'user_settings', description: '用戶設定' },
       { name: 'system_stats', description: '系統統計' },
       { name: 'storage_usage', description: '存儲使用記錄' },
       { name: 'storage_cleanup_log', description: '存儲清理記錄' },
       { name: 'migration_log', description: '遷移記錄' }
     ];
     
     for (const table of tablesToClear) {
       try {
         const { error } = await supabase.from(table.name).delete().neq('id', 0);
         if (error) {
           console.error(`❌ 清空 ${table.name} (${table.description}) 表失敗:`, error.message);
           // 如果不是 migration_log 表，則返回失敗
           if (table.name !== 'migration_log') {
             return false;
           }
           // migration_log 表清空失敗可以忽略，因為我們稍後會重新插入
           console.log(`⚠️ ${table.name} 表清空失敗，將在後續步驟中處理`);
         } else {
           console.log(`✅ 已清空 ${table.name} (${table.description}) 表`);
         }
       } catch (err) {
         console.error(`❌ 處理 ${table.name} 表時發生錯誤:`, err.message);
         if (table.name !== 'migration_log') {
           return false;
         }
       }
     }
    
    // 2. 重新插入初始數據
    console.log('\n🔧 重新插入初始數據...');
    
    // 插入初始存儲統計
    await supabase.from('storage_usage').insert([
      { bucket_name: 'wish-images', total_files: 0, total_size_bytes: 0 },
      { bucket_name: 'wish-thumbnails', total_files: 0, total_size_bytes: 0 }
    ]);
    
    // 插入今日初始統計
    await supabase.from('system_stats').insert([{
      stat_date: new Date().toISOString().split('T')[0],
      total_wishes: 0,
      public_wishes: 0,
      private_wishes: 0,
      total_likes: 0,
      active_users: 0,
      storage_used_mb: 0
    }]);
    
         // 記錄清空操作（最後執行，避免約束衝突）
     try {
       await supabase.from('migration_log').insert([{
         user_session: 'system-admin',
         migration_type: 'data_cleanup',
         target_records: 0,
         success: true,
         error_message: `All data cleared by admin request at ${new Date().toISOString()}`
       }]);
       console.log('✅ 清空操作記錄已插入');
     } catch (logError) {
       console.log('⚠️ 無法插入清空操作記錄，但不影響清空結果:', logError.message);
     }
    
    console.log('✅ 初始數據插入完成');
    return true;
    
  } catch (error) {
    console.error('❌ 清空資料庫時發生錯誤:', error.message);
    return false;
  }
}

/**
 * 驗證清空結果
 */
async function verifyCleanup() {
  console.log('\n🔍 驗證清空結果...');
  
  try {
    // 檢查主要數據表
    const { data: wishes, error: wishesError } = await supabase
      .from('wishes')
      .select('count', { count: 'exact', head: true });
      
    const { data: likes, error: likesError } = await supabase
      .from('wish_likes')
      .select('count', { count: 'exact', head: true });
    
    if (wishesError || likesError) {
      console.error('❌ 驗證時發生錯誤');
      return false;
    }
    
    console.log(`📊 驗證結果：`);
    console.log(`   - wishes 表：${wishes || 0} 條記錄`);
    console.log(`   - wish_likes 表：${likes || 0} 條記錄`);
    
    // 檢查存儲
    const buckets = ['wish-images', 'wish-thumbnails'];
    for (const bucket of buckets) {
      const { data: files } = await supabase.storage.from(bucket).list('', { limit: 1 });
      console.log(`   - ${bucket} 存儲桶：${files ? files.length : 0} 個文件`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 驗證時發生錯誤:', error.message);
    return false;
  }
}

/**
 * 主函數
 */
async function main() {
  console.log('🚀 心願星河 - 綜合數據清空');
  console.log('⚠️ 警告：這將永久刪除所有數據和文件！');
  console.log('\n包含：');
  console.log('- 所有困擾案例和點讚記錄');
  console.log('- 所有用戶設定');
  console.log('- Storage 中的所有圖片文件');
  console.log('- 系統統計和記錄');
  
  // 給用戶考慮時間
  console.log('\n⏰ 10 秒後開始清空... (按 Ctrl+C 取消)');
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`\r倒計時：${i} 秒 `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\n\n開始執行清空操作...\n');
  
  let success = true;
  
  // 0. 修復約束問題
  const constraintFixed = await fixMigrationLogConstraint();
  
  // 1. 清空存儲
  const storageSuccess = await clearStorage();
  if (!storageSuccess) {
    console.log('⚠️ Storage 清空過程中有錯誤，但繼續執行資料庫清空');
  }
  
  // 2. 清空資料庫
  const dbSuccess = await clearDatabase();
  if (!dbSuccess) {
    console.error('❌ 資料庫清空失敗');
    success = false;
  }
  
  // 3. 驗證結果
  if (success) {
    await verifyCleanup();
  }
  
  // 顯示最終結果
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ 所有數據清空完成！');
    console.log('\n📝 建議後續步驟：');
    console.log('1. 重新啟動應用程式');
    console.log('2. 在瀏覽器中清除 localStorage');
    console.log('3. 確認應用程式正常運行');
  } else {
    console.log('❌ 清空過程中有錯誤，請檢查上述訊息');
  }
  
  process.exit(success ? 0 : 1);
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