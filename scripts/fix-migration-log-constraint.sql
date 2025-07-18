-- 修復 migration_log 表的約束問題
-- 允許 'storage_cleanup' 和 'data_cleanup' 類型

BEGIN;

-- 移除舊的約束
ALTER TABLE migration_log DROP CONSTRAINT IF EXISTS migration_log_migration_type_check;

-- 添加新的約束，包含所有需要的類型
ALTER TABLE migration_log ADD CONSTRAINT migration_log_migration_type_check 
CHECK (migration_type IN ('wishes', 'likes', 'settings', 'storage_cleanup', 'data_cleanup', 'image_cleanup'));

-- 顯示結果
DO $$
BEGIN
    RAISE NOTICE '✅ migration_log 表約束已更新';
    RAISE NOTICE '📋 允許的 migration_type 值：';
    RAISE NOTICE '   - wishes（困擾案例遷移）';
    RAISE NOTICE '   - likes（點讚記錄遷移）';
    RAISE NOTICE '   - settings（用戶設定遷移）';
    RAISE NOTICE '   - storage_cleanup（存儲清理）';
    RAISE NOTICE '   - data_cleanup（數據清空）';
    RAISE NOTICE '   - image_cleanup（圖片清理）';
END $$;

COMMIT; 