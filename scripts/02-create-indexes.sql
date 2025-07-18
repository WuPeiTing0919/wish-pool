-- 心願星河 - 索引和觸發器創建
-- 執行順序：第 2 步
-- 說明：創建性能優化索引和自動更新觸發器

-- 開始事務
BEGIN;

-- 1. wishes 表格索引
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_is_public ON wishes(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_wishes_category ON wishes(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_priority ON wishes(priority DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_user_session ON wishes(user_session);
CREATE INDEX IF NOT EXISTS idx_wishes_email ON wishes(email) WHERE email IS NOT NULL;

-- 全文搜索索引 (使用 simple 配置以支持多语言)
CREATE INDEX IF NOT EXISTS idx_wishes_search ON wishes USING gin(
  to_tsvector('simple', title || ' ' || current_pain || ' ' || expected_solution)
);

-- 2. wish_likes 表格索引
CREATE INDEX IF NOT EXISTS idx_wish_likes_wish_id ON wish_likes(wish_id);
CREATE INDEX IF NOT EXISTS idx_wish_likes_user_session ON wish_likes(user_session);
CREATE INDEX IF NOT EXISTS idx_wish_likes_created_at ON wish_likes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wish_likes_ip_address ON wish_likes(ip_address);

-- 3. user_settings 表格索引
CREATE INDEX IF NOT EXISTS idx_user_settings_session ON user_settings(user_session);
CREATE INDEX IF NOT EXISTS idx_user_settings_updated_at ON user_settings(updated_at DESC);

-- 4. migration_log 表格索引
CREATE INDEX IF NOT EXISTS idx_migration_log_user_session ON migration_log(user_session);
CREATE INDEX IF NOT EXISTS idx_migration_log_type ON migration_log(migration_type);
CREATE INDEX IF NOT EXISTS idx_migration_log_success ON migration_log(success);
CREATE INDEX IF NOT EXISTS idx_migration_log_created_at ON migration_log(created_at DESC);

-- 5. system_stats 表格索引
CREATE INDEX IF NOT EXISTS idx_system_stats_date ON system_stats(stat_date DESC);

-- 6. 創建更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 為需要的表格添加更新時間觸發器
DROP TRIGGER IF EXISTS update_wishes_updated_at ON wishes;
CREATE TRIGGER update_wishes_updated_at 
    BEFORE UPDATE ON wishes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 創建統計更新觸發器函數
CREATE OR REPLACE FUNCTION update_system_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_stats (
        stat_date,
        total_wishes,
        public_wishes,
        private_wishes,
        total_likes,
        active_users
    )
    SELECT 
        CURRENT_DATE,
        COUNT(*) as total_wishes,
        COUNT(*) FILTER (WHERE is_public = true) as public_wishes,
        COUNT(*) FILTER (WHERE is_public = false) as private_wishes,
        (SELECT COUNT(*) FROM wish_likes) as total_likes,
        COUNT(DISTINCT user_session) as active_users
    FROM wishes
    WHERE status = 'active'
    ON CONFLICT (stat_date) 
    DO UPDATE SET
        total_wishes = EXCLUDED.total_wishes,
        public_wishes = EXCLUDED.public_wishes,
        private_wishes = EXCLUDED.private_wishes,
        total_likes = EXCLUDED.total_likes,
        active_users = EXCLUDED.active_users;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 9. 為 wishes 和 wish_likes 添加統計更新觸發器
DROP TRIGGER IF EXISTS update_stats_on_wish_change ON wishes;
CREATE TRIGGER update_stats_on_wish_change
    AFTER INSERT OR UPDATE OR DELETE ON wishes
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_system_stats();

DROP TRIGGER IF EXISTS update_stats_on_like_change ON wish_likes;
CREATE TRIGGER update_stats_on_like_change
    AFTER INSERT OR DELETE ON wish_likes
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_system_stats();

-- 10. 創建圖片清理觸發器函數
CREATE OR REPLACE FUNCTION cleanup_wish_images()
RETURNS TRIGGER AS $$
BEGIN
    -- 當 wish 被刪除時，記錄需要清理的圖片
    IF TG_OP = 'DELETE' THEN
        INSERT INTO migration_log (
            user_session,
            migration_type,
            source_data,
            success,
            error_message
        ) VALUES (
            OLD.user_session,
            'image_cleanup',
            OLD.images,
            false,
            'Images marked for cleanup'
        );
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. 為 wishes 添加圖片清理觸發器
DROP TRIGGER IF EXISTS cleanup_images_on_wish_delete ON wishes;
CREATE TRIGGER cleanup_images_on_wish_delete
    AFTER DELETE ON wishes
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_wish_images();

-- 提交事務
COMMIT;

-- 顯示創建結果
DO $$
DECLARE
    index_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- 計算索引數量
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- 計算觸發器數量
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger 
    WHERE tgname LIKE '%wish%' OR tgname LIKE '%update%';
    
    RAISE NOTICE '✅ 索引和觸發器創建完成！';
    RAISE NOTICE '📊 創建統計：';
    RAISE NOTICE '   - 性能索引：% 個', index_count;
    RAISE NOTICE '   - 自動觸發器：% 個', trigger_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 性能優化功能：';
    RAISE NOTICE '   - 快速查詢索引';
    RAISE NOTICE '   - 全文搜索支援';
    RAISE NOTICE '   - 自動統計更新';
    RAISE NOTICE '   - 圖片清理追蹤';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 下一步：執行 03-create-views-functions.sql';
END $$;
