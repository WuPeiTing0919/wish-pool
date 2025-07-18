-- 心願星河 - 清空所有數據
-- ⚠️ 警告：此腳本將永久刪除所有數據，請謹慎使用！
-- 建議：在生產環境執行前請備份重要數據

-- 開始事務
BEGIN;

-- 0. 修復 migration_log 表約束問題
DO $$
BEGIN
    -- 移除舊的約束
    ALTER TABLE migration_log DROP CONSTRAINT IF EXISTS migration_log_migration_type_check;
    
    -- 添加新的約束，包含所有需要的類型
    ALTER TABLE migration_log ADD CONSTRAINT migration_log_migration_type_check 
    CHECK (migration_type IN ('wishes', 'likes', 'settings', 'storage_cleanup', 'data_cleanup', 'image_cleanup'));
    
    RAISE NOTICE '🔧 migration_log 表約束已修復';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ 修復約束時發生錯誤，但繼續執行: %', SQLERRM;
END $$;

-- 顯示警告訊息
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🚨 準備清空所有數據...';
    RAISE NOTICE '⚠️  這將永久刪除：';
    RAISE NOTICE '   - 所有困擾案例 (wishes)';
    RAISE NOTICE '   - 所有點讚記錄 (wish_likes)';
    RAISE NOTICE '   - 所有用戶設定 (user_settings)';
    RAISE NOTICE '   - 遷移記錄 (migration_log)';
    RAISE NOTICE '   - 系統統計 (system_stats)';
    RAISE NOTICE '   - 存儲使用記錄 (storage_usage)';
    RAISE NOTICE '   - 存儲清理記錄 (storage_cleanup_log)';
    RAISE NOTICE '';
END $$;

-- 1. 清空所有數據表（按依賴關係順序）
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- 清空有外鍵關係的表格
    DELETE FROM wish_likes;
    GET DIAGNOSTICS table_count = ROW_COUNT;
    RAISE NOTICE '🗑️ 已清空 wish_likes 表，刪除 % 條記錄', table_count;
    
    DELETE FROM wishes;
    GET DIAGNOSTICS table_count = ROW_COUNT;
    RAISE NOTICE '🗑️ 已清空 wishes 表，刪除 % 條記錄', table_count;
    
    DELETE FROM user_settings;
    GET DIAGNOSTICS table_count = ROW_COUNT;
    RAISE NOTICE '🗑️ 已清空 user_settings 表，刪除 % 條記錄', table_count;
    
    DELETE FROM migration_log;
    GET DIAGNOSTICS table_count = ROW_COUNT;
    RAISE NOTICE '🗑️ 已清空 migration_log 表，刪除 % 條記錄', table_count;
    
    DELETE FROM system_stats;
    GET DIAGNOSTICS table_count = ROW_COUNT;
    RAISE NOTICE '🗑️ 已清空 system_stats 表，刪除 % 條記錄', table_count;
    
    DELETE FROM storage_usage;
    GET DIAGNOSTICS table_count = ROW_COUNT;
    RAISE NOTICE '🗑️ 已清空 storage_usage 表，刪除 % 條記錄', table_count;
    
    DELETE FROM storage_cleanup_log;
    GET DIAGNOSTICS table_count = ROW_COUNT;
    RAISE NOTICE '🗑️ 已清空 storage_cleanup_log 表，刪除 % 條記錄', table_count;
END $$;

-- 2. 重置自增序列
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 重置自增序列...';
    
    -- 重置所有表格的序列
    ALTER SEQUENCE wishes_id_seq RESTART WITH 1;
    ALTER SEQUENCE wish_likes_id_seq RESTART WITH 1;
    ALTER SEQUENCE user_settings_id_seq RESTART WITH 1;
    ALTER SEQUENCE migration_log_id_seq RESTART WITH 1;
    ALTER SEQUENCE system_stats_id_seq RESTART WITH 1;
    ALTER SEQUENCE storage_usage_id_seq RESTART WITH 1;
    ALTER SEQUENCE storage_cleanup_log_id_seq RESTART WITH 1;
    
    RAISE NOTICE '✅ 所有序列已重置為 1';
END $$;

-- 3. 重新插入初始統計記錄
INSERT INTO storage_usage (bucket_name, total_files, total_size_bytes)
VALUES 
    ('wish-images', 0, 0),
    ('wish-thumbnails', 0, 0);

INSERT INTO system_stats (stat_date, total_wishes, public_wishes, private_wishes, total_likes, active_users, storage_used_mb)
VALUES (CURRENT_DATE, 0, 0, 0, 0, 0, 0);

-- 4. 記錄清空操作
INSERT INTO migration_log (
    user_session,
    migration_type,
    target_records,
    success,
    error_message
) VALUES (
    'system-admin',
    'data_cleanup',
    0,
    true,
    'All data cleared by admin request at ' || NOW()
);

-- 提交事務
COMMIT;

-- 顯示完成訊息
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ 資料庫清空完成！';
    RAISE NOTICE '📊 重置統計：';
    RAISE NOTICE '   - 所有表格已清空';
    RAISE NOTICE '   - 自增序列已重置';
    RAISE NOTICE '   - 初始統計記錄已重新建立';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  注意：';
    RAISE NOTICE '   - Storage 中的檔案需要手動清空';
    RAISE NOTICE '   - 可以使用 clear-storage.js 腳本清空圖片';
    RAISE NOTICE '';
END $$; 