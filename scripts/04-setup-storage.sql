-- 心願星河 - 存儲服務設置
-- 執行順序：第 4 步
-- 說明：設置 Supabase Storage 桶和相關政策

-- 注意：此腳本需要在 Supabase Dashboard 的 SQL Editor 中執行
-- 某些 Storage 操作可能需要 service_role 權限

-- 開始事務
BEGIN;

-- 1. 創建主要圖片存儲桶
INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    avif_autodetection
) VALUES (
    'wish-images',
    'wish-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    true
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    avif_autodetection = EXCLUDED.avif_autodetection;

-- 2. 創建縮圖存儲桶
INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    avif_autodetection
) VALUES (
    'wish-thumbnails',
    'wish-thumbnails',
    true,
    1048576, -- 1MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    true
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    avif_autodetection = EXCLUDED.avif_autodetection;

-- 3. 創建存儲使用統計表
CREATE TABLE IF NOT EXISTS storage_usage (
    id BIGSERIAL PRIMARY KEY,
    bucket_name TEXT NOT NULL,
    total_files INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    last_cleanup_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(bucket_name)
);

-- 4. 插入初始存儲統計記錄
INSERT INTO storage_usage (bucket_name, total_files, total_size_bytes)
VALUES 
    ('wish-images', 0, 0),
    ('wish-thumbnails', 0, 0)
ON CONFLICT (bucket_name) DO NOTHING;

-- 5. 創建存儲統計更新函數
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS VOID AS $$
BEGIN
    -- 更新 wish-images 桶統計
    INSERT INTO storage_usage (bucket_name, total_files, total_size_bytes, updated_at)
    SELECT 
        'wish-images',
        COUNT(*),
        COALESCE(SUM(metadata->>'size')::BIGINT, 0),
        NOW()
    FROM storage.objects 
    WHERE bucket_id = 'wish-images'
    ON CONFLICT (bucket_name) 
    DO UPDATE SET
        total_files = EXCLUDED.total_files,
        total_size_bytes = EXCLUDED.total_size_bytes,
        updated_at = EXCLUDED.updated_at;
    
    -- 更新 wish-thumbnails 桶統計
    INSERT INTO storage_usage (bucket_name, total_files, total_size_bytes, updated_at)
    SELECT 
        'wish-thumbnails',
        COUNT(*),
        COALESCE(SUM(metadata->>'size')::BIGINT, 0),
        NOW()
    FROM storage.objects 
    WHERE bucket_id = 'wish-thumbnails'
    ON CONFLICT (bucket_name) 
    DO UPDATE SET
        total_files = EXCLUDED.total_files,
        total_size_bytes = EXCLUDED.total_size_bytes,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- 6. 創建存儲清理記錄表
CREATE TABLE IF NOT EXISTS storage_cleanup_log (
    id BIGSERIAL PRIMARY KEY,
    bucket_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    cleanup_reason TEXT,
    cleanup_status TEXT DEFAULT 'pending' CHECK (cleanup_status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. 創建獲取存儲統計的函數
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- 更新統計數據
    PERFORM update_storage_usage();
    
    SELECT json_build_object(
        'buckets', (
            SELECT json_agg(
                json_build_object(
                    'name', bucket_name,
                    'total_files', total_files,
                    'total_size_mb', ROUND(total_size_bytes / 1024.0 / 1024.0, 2),
                    'last_updated', updated_at
                )
            )
            FROM storage_usage
        ),
        'cleanup_pending', (
            SELECT COUNT(*)
            FROM storage_cleanup_log
            WHERE cleanup_status = 'pending'
        ),
        'total_storage_mb', (
            SELECT ROUND(SUM(total_size_bytes) / 1024.0 / 1024.0, 2)
            FROM storage_usage
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. 創建標記孤立圖片的函數
CREATE OR REPLACE FUNCTION mark_orphaned_images_for_cleanup()
RETURNS INTEGER AS $$
DECLARE
    marked_count INTEGER := 0;
    image_record RECORD;
    referenced_images TEXT[];
BEGIN
    -- 獲取所有被引用的圖片路徑
    SELECT ARRAY_AGG(DISTINCT image_path) INTO referenced_images
    FROM (
        SELECT jsonb_array_elements_text(
            jsonb_path_query_array(images, '$[*].storage_path')
        ) as image_path
        FROM wishes
        WHERE status = 'active'
        AND images IS NOT NULL
        AND jsonb_array_length(images) > 0
    ) referenced;
    
    -- 標記孤立的圖片
    FOR image_record IN
        SELECT name, metadata->>'size' as file_size
        FROM storage.objects
        WHERE bucket_id IN ('wish-images', 'wish-thumbnails')
        AND (referenced_images IS NULL OR name != ALL(referenced_images))
    LOOP
        INSERT INTO storage_cleanup_log (
            bucket_name,
            file_path,
            file_size,
            cleanup_reason,
            cleanup_status
        ) VALUES (
            CASE 
                WHEN image_record.name LIKE '%/thumbnails/%' THEN 'wish-thumbnails'
                ELSE 'wish-images'
            END,
            image_record.name,
            image_record.file_size::BIGINT,
            'Orphaned image - not referenced by any active wish',
            'pending'
        ) ON CONFLICT DO NOTHING;
        
        marked_count := marked_count + 1;
    END LOOP;
    
    -- 記錄清理操作
    INSERT INTO migration_log (
        user_session,
        migration_type,
        target_records,
        success,
        error_message
    ) VALUES (
        'system',
        'storage_cleanup',
        marked_count,
        true,
        'Marked ' || marked_count || ' orphaned images for cleanup'
    );
    
    RETURN marked_count;
END;
$$ LANGUAGE plpgsql;

-- 9. 創建存儲使用量更新觸發器
CREATE OR REPLACE FUNCTION trigger_storage_usage_update()
RETURNS TRIGGER AS $$
BEGIN
    -- 異步更新存儲統計（避免阻塞主要操作）
    PERFORM pg_notify('storage_usage_update', 'update_needed');
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 10. 為 wishes 表添加存儲使用量更新觸發器
DROP TRIGGER IF EXISTS update_storage_on_wish_change ON wishes;
CREATE TRIGGER update_storage_on_wish_change
    AFTER INSERT OR UPDATE OR DELETE ON wishes
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_storage_usage_update();

-- 提交事務
COMMIT;

-- 顯示創建結果
DO $$
DECLARE
    bucket_count INTEGER;
    storage_table_count INTEGER;
BEGIN
    -- 計算存儲桶數量
    SELECT COUNT(*) INTO bucket_count
    FROM storage.buckets 
    WHERE id LIKE 'wish-%';
    
    -- 計算存儲相關表格數量
    SELECT COUNT(*) INTO storage_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%storage%';
    
    RAISE NOTICE '✅ 存儲服務設置完成！';
    RAISE NOTICE '📊 創建統計：';
    RAISE NOTICE '   - 存儲桶：% 個', bucket_count;
    RAISE NOTICE '   - 存儲管理表：% 個', storage_table_count;
    RAISE NOTICE '';
    RAISE NOTICE '🗂️ 存儲桶配置：';
    RAISE NOTICE '   - wish-images（主圖片，5MB限制）';
    RAISE NOTICE '   - wish-thumbnails（縮圖，1MB限制）';
    RAISE NOTICE '';
    RAISE NOTICE '🛠️ 管理功能：';
    RAISE NOTICE '   - 自動統計更新';
    RAISE NOTICE '   - 孤立圖片檢測';
    RAISE NOTICE '   - 清理記錄追蹤';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 下一步：執行 05-setup-rls.sql';
END $$;

-- 重要提醒
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  重要提醒：';
    RAISE NOTICE '   1. 請確認存儲桶已在 Supabase Dashboard 中顯示';
    RAISE NOTICE '   2. 檢查 Storage → Settings 中的政策設置';
    RAISE NOTICE '   3. 測試圖片上傳功能是否正常';
    RAISE NOTICE '   4. 定期執行 mark_orphaned_images_for_cleanup() 清理孤立圖片';
END $$;
