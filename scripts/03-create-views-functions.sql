-- 心願星河 - 視圖和函數創建
-- 執行順序：第 3 步
-- 說明：創建便利視圖和業務邏輯函數

-- 開始事務
BEGIN;

-- 1. 創建帶點讚數的困擾案例視圖
CREATE OR REPLACE VIEW wishes_with_likes AS
SELECT 
    w.*,
    COALESCE(like_counts.like_count, 0) as like_count,
    CASE 
        WHEN w.created_at >= NOW() - INTERVAL '24 hours' THEN 'new'
        WHEN like_counts.like_count >= 10 THEN 'popular'
        WHEN w.priority >= 4 THEN 'urgent'
        ELSE 'normal'
    END as badge_type
FROM wishes w
LEFT JOIN (
    SELECT 
        wish_id, 
        COUNT(*) as like_count
    FROM wish_likes 
    GROUP BY wish_id
) like_counts ON w.id = like_counts.wish_id
WHERE w.status = 'active';

-- 2. 創建公開困擾案例視圖
CREATE OR REPLACE VIEW public_wishes AS
SELECT *
FROM wishes_with_likes
WHERE is_public = true
ORDER BY created_at DESC;

-- 3. 創建熱門困擾案例視圖
CREATE OR REPLACE VIEW popular_wishes AS
SELECT *
FROM wishes_with_likes
WHERE is_public = true
AND like_count >= 3
ORDER BY like_count DESC, created_at DESC;

-- 4. 創建統計摘要視圖
CREATE OR REPLACE VIEW wishes_summary AS
SELECT 
    COUNT(*) as total_wishes,
    COUNT(*) FILTER (WHERE is_public = true) as public_wishes,
    COUNT(*) FILTER (WHERE is_public = false) as private_wishes,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as last_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as today,
    AVG(COALESCE(like_counts.like_count, 0))::DECIMAL(10,2) as avg_likes,
    COUNT(DISTINCT user_session) as unique_users
FROM wishes w
LEFT JOIN (
    SELECT wish_id, COUNT(*) as like_count
    FROM wish_likes 
    GROUP BY wish_id
) like_counts ON w.id = like_counts.wish_id
WHERE w.status = 'active';

-- 5. 創建類別統計視圖
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    COALESCE(category, '未分類') as category,
    COUNT(*) as wish_count,
    COUNT(*) FILTER (WHERE is_public = true) as public_count,
    AVG(COALESCE(like_counts.like_count, 0))::DECIMAL(10,2) as avg_likes,
    MAX(created_at) as latest_wish
FROM wishes w
LEFT JOIN (
    SELECT wish_id, COUNT(*) as like_count
    FROM wish_likes 
    GROUP BY wish_id
) like_counts ON w.id = like_counts.wish_id
WHERE w.status = 'active'
GROUP BY category
ORDER BY wish_count DESC;

-- 6. 創建獲取統計數據的函數
CREATE OR REPLACE FUNCTION get_wishes_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'summary', (SELECT row_to_json(wishes_summary.*) FROM wishes_summary),
        'categories', (
            SELECT json_agg(row_to_json(category_stats.*))
            FROM category_stats
        ),
        'recent_activity', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', created_at),
                    'count', count(*)
                )
            )
            FROM wishes
            WHERE created_at >= NOW() - INTERVAL '30 days'
            AND status = 'active'
            GROUP BY date_trunc('day', created_at)
            ORDER BY date_trunc('day', created_at) DESC
            LIMIT 30
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. 創建搜索困擾案例的函數
CREATE OR REPLACE FUNCTION search_wishes(
    search_query TEXT,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id BIGINT,
    title TEXT,
    current_pain TEXT,
    expected_solution TEXT,
    like_count BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.title,
        w.current_pain,
        w.expected_solution,
        COALESCE(like_counts.like_count, 0) as like_count,
        w.created_at,
        ts_rank(
            to_tsvector('chinese', w.title || ' ' || w.current_pain || ' ' || w.expected_solution),
            plainto_tsquery('chinese', search_query)
        ) as relevance
    FROM wishes w
    LEFT JOIN (
        SELECT wish_id, COUNT(*) as like_count
        FROM wish_likes 
        GROUP BY wish_id
    ) like_counts ON w.id = like_counts.wish_id
    WHERE w.status = 'active'
    AND w.is_public = true
    AND (
        to_tsvector('chinese', w.title || ' ' || w.current_pain || ' ' || w.expected_solution) 
        @@ plainto_tsquery('chinese', search_query)
    )
    ORDER BY relevance DESC, like_count DESC, w.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 8. 創建獲取用戶統計的函數
CREATE OR REPLACE FUNCTION get_user_stats(session_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_wishes', (
            SELECT COUNT(*) 
            FROM wishes 
            WHERE user_session = session_id AND status = 'active'
        ),
        'total_likes_received', (
            SELECT COALESCE(SUM(like_counts.like_count), 0)
            FROM wishes w
            LEFT JOIN (
                SELECT wish_id, COUNT(*) as like_count
                FROM wish_likes 
                GROUP BY wish_id
            ) like_counts ON w.id = like_counts.wish_id
            WHERE w.user_session = session_id AND w.status = 'active'
        ),
        'total_likes_given', (
            SELECT COUNT(*) 
            FROM wish_likes 
            WHERE user_session = session_id
        ),
        'recent_wishes', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'created_at', created_at,
                    'like_count', COALESCE(like_counts.like_count, 0)
                )
            )
            FROM wishes w
            LEFT JOIN (
                SELECT wish_id, COUNT(*) as like_count
                FROM wish_likes 
                GROUP BY wish_id
            ) like_counts ON w.id = like_counts.wish_id
            WHERE w.user_session = session_id 
            AND w.status = 'active'
            ORDER BY w.created_at DESC
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 9. 創建清理孤立圖片的函數
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    image_record RECORD;
BEGIN
    -- 記錄清理開始
    INSERT INTO migration_log (
        user_session,
        migration_type,
        success,
        error_message
    ) VALUES (
        'system',
        'image_cleanup',
        false,
        'Starting orphaned image cleanup'
    );
    
    -- 這裡只是標記，實際的 Storage 清理需要在應用層面處理
    -- 因為 SQL 無法直接操作 Supabase Storage
    
    -- 找出需要清理的圖片記錄
    FOR image_record IN
        SELECT DISTINCT jsonb_array_elements(images)->>'storage_path' as image_path
        FROM wishes 
        WHERE status = 'deleted'
        AND images IS NOT NULL
        AND jsonb_array_length(images) > 0
    LOOP
        -- 標記為需要清理
        INSERT INTO migration_log (
            user_session,
            migration_type,
            source_data,
            success,
            error_message
        ) VALUES (
            'system',
            'image_cleanup',
            json_build_object('image_path', image_record.image_path),
            false,
            'Image marked for cleanup: ' || image_record.image_path
        );
        
        deleted_count := deleted_count + 1;
    END LOOP;
    
    -- 記錄清理完成
    INSERT INTO migration_log (
        user_session,
        migration_type,
        target_records,
        success,
        error_message
    ) VALUES (
        'system',
        'image_cleanup',
        deleted_count,
        true,
        'Orphaned image cleanup completed. Marked ' || deleted_count || ' images for cleanup.'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. 創建性能檢查函數
CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'table_sizes', (
            SELECT json_object_agg(
                table_name,
                pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
            )
            FROM (
                SELECT 'wishes' as table_name
                UNION SELECT 'wish_likes'
                UNION SELECT 'user_settings'
                UNION SELECT 'migration_log'
                UNION SELECT 'system_stats'
            ) tables
        ),
        'index_usage', (
            SELECT json_object_agg(
                indexname,
                json_build_object(
                    'size', pg_size_pretty(pg_relation_size(indexname::regclass)),
                    'scans', idx_scan,
                    'tuples_read', idx_tup_read,
                    'tuples_fetched', idx_tup_fetch
                )
            )
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            AND indexname LIKE 'idx_%'
        ),
        'query_performance', (
            SELECT json_build_object(
                'avg_query_time', COALESCE(AVG(mean_exec_time), 0),
                'total_queries', COALESCE(SUM(calls), 0),
                'slowest_queries', (
                    SELECT json_agg(
                        json_build_object(
                            'query', LEFT(query, 100) || '...',
                            'avg_time', mean_exec_time,
                            'calls', calls
                        )
                    )
                    FROM pg_stat_statements
                    WHERE query LIKE '%wishes%'
                    ORDER BY mean_exec_time DESC
                    LIMIT 5
                )
            )
            FROM pg_stat_statements
            WHERE query LIKE '%wishes%'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 提交事務
COMMIT;

-- 顯示創建結果
DO $$
DECLARE
    view_count INTEGER;
    function_count INTEGER;
BEGIN
    -- 計算視圖數量
    SELECT COUNT(*) INTO view_count
    FROM pg_views 
    WHERE schemaname = 'public';
    
    -- 計算函數數量
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname LIKE '%wish%' OR p.proname LIKE 'get_%' OR p.proname LIKE 'cleanup_%';
    
    RAISE NOTICE '✅ 視圖和函數創建完成！';
    RAISE NOTICE '📊 創建統計：';
    RAISE NOTICE '   - 便利視圖：% 個', view_count;
    RAISE NOTICE '   - 業務函數：% 個', function_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 主要功能：';
    RAISE NOTICE '   - wishes_with_likes（帶點讚數的困擾案例）';
    RAISE NOTICE '   - public_wishes（公開困擾案例）';
    RAISE NOTICE '   - popular_wishes（熱門困擾案例）';
    RAISE NOTICE '   - search_wishes()（全文搜索）';
    RAISE NOTICE '   - get_wishes_stats()（統計數據）';
    RAISE NOTICE '   - cleanup_orphaned_images()（圖片清理）';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 下一步：執行 04-setup-storage.sql';
END $$;
