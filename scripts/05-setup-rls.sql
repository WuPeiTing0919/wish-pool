-- 心願星河 - Row Level Security (RLS) 政策設置
-- 執行順序：第 5 步（最後一步）
-- 說明：設置完整的安全政策，保護數據安全

-- 開始事務
BEGIN;

-- 1. 啟用所有表格的 RLS
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_cleanup_log ENABLE ROW LEVEL SECURITY;

-- 2. wishes 表格的 RLS 政策

-- 2.1 查看政策：公開的困擾案例所有人都可以查看
DROP POLICY IF EXISTS "Public wishes are viewable by everyone" ON wishes;
CREATE POLICY "Public wishes are viewable by everyone" ON wishes
    FOR SELECT 
    USING (is_public = true AND status = 'active');

-- 2.2 查看政策：用戶可以查看自己的所有困擾案例
DROP POLICY IF EXISTS "Users can view own wishes" ON wishes;
CREATE POLICY "Users can view own wishes" ON wishes
    FOR SELECT 
    USING (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
           user_session = current_setting('app.user_session', true));

-- 2.3 插入政策：所有人都可以提交困擾案例
DROP POLICY IF EXISTS "Anyone can insert wishes" ON wishes;
CREATE POLICY "Anyone can insert wishes" ON wishes
    FOR INSERT 
    WITH CHECK (true);

-- 2.4 更新政策：用戶只能更新自己的困擾案例
DROP POLICY IF EXISTS "Users can update own wishes" ON wishes;
CREATE POLICY "Users can update own wishes" ON wishes
    FOR UPDATE 
    USING (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
           user_session = current_setting('app.user_session', true))
    WITH CHECK (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
                user_session = current_setting('app.user_session', true));

-- 2.5 刪除政策：用戶只能軟刪除自己的困擾案例
DROP POLICY IF EXISTS "Users can delete own wishes" ON wishes;
CREATE POLICY "Users can delete own wishes" ON wishes
    FOR UPDATE 
    USING (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
           user_session = current_setting('app.user_session', true))
    WITH CHECK (status = 'deleted');

-- 3. wish_likes 表格的 RLS 政策

-- 3.1 查看政策：所有人都可以查看點讚記錄（用於統計）
DROP POLICY IF EXISTS "Wish likes are viewable by everyone" ON wish_likes;
CREATE POLICY "Wish likes are viewable by everyone" ON wish_likes
    FOR SELECT 
    USING (true);

-- 3.2 插入政策：所有人都可以點讚
DROP POLICY IF EXISTS "Anyone can insert wish likes" ON wish_likes;
CREATE POLICY "Anyone can insert wish likes" ON wish_likes
    FOR INSERT 
    WITH CHECK (true);

-- 3.3 刪除政策：用戶只能取消自己的點讚
DROP POLICY IF EXISTS "Users can delete own likes" ON wish_likes;
CREATE POLICY "Users can delete own likes" ON wish_likes
    FOR DELETE 
    USING (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
           user_session = current_setting('app.user_session', true));

-- 4. user_settings 表格的 RLS 政策

-- 4.1 查看政策：用戶只能查看自己的設定
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT 
    USING (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
           user_session = current_setting('app.user_session', true));

-- 4.2 插入政策：用戶可以創建自己的設定
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT 
    WITH CHECK (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
                user_session = current_setting('app.user_session', true));

-- 4.3 更新政策：用戶只能更新自己的設定
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE 
    USING (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
           user_session = current_setting('app.user_session', true))
    WITH CHECK (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
                user_session = current_setting('app.user_session', true));

-- 5. migration_log 表格的 RLS 政策

-- 5.1 查看政策：用戶可以查看自己的遷移記錄
DROP POLICY IF EXISTS "Users can view own migration logs" ON migration_log;
CREATE POLICY "Users can view own migration logs" ON migration_log
    FOR SELECT 
    USING (user_session = current_setting('request.jwt.claims', true)::json->>'user_session' OR 
           user_session = current_setting('app.user_session', true) OR
           user_session = 'system');

-- 5.2 插入政策：系統和用戶都可以插入遷移記錄
DROP POLICY IF EXISTS "System and users can insert migration logs" ON migration_log;
CREATE POLICY "System and users can insert migration logs" ON migration_log
    FOR INSERT 
    WITH CHECK (true);

-- 6. system_stats 表格的 RLS 政策

-- 6.1 查看政策：所有人都可以查看系統統計（公開數據）
DROP POLICY IF EXISTS "System stats are viewable by everyone" ON system_stats;
CREATE POLICY "System stats are viewable by everyone" ON system_stats
    FOR SELECT 
    USING (true);

-- 6.2 插入/更新政策：只有系統可以修改統計數據
DROP POLICY IF EXISTS "Only system can modify stats" ON system_stats;
CREATE POLICY "Only system can modify stats" ON system_stats
    FOR ALL 
    USING (current_user = 'postgres' OR current_setting('role', true) = 'service_role');

-- 7. storage_usage 表格的 RLS 政策

-- 7.1 查看政策：所有人都可以查看存儲使用統計
DROP POLICY IF EXISTS "Storage usage is viewable by everyone" ON storage_usage;
CREATE POLICY "Storage usage is viewable by everyone" ON storage_usage
    FOR SELECT 
    USING (true);

-- 7.2 修改政策：只有系統可以修改存儲統計
DROP POLICY IF EXISTS "Only system can modify storage usage" ON storage_usage;
CREATE POLICY "Only system can modify storage usage" ON storage_usage
    FOR ALL 
    USING (current_user = 'postgres' OR current_setting('role', true) = 'service_role');

-- 8. storage_cleanup_log 表格的 RLS 政策

-- 8.1 查看政策：所有人都可以查看清理記錄
DROP POLICY IF EXISTS "Storage cleanup logs are viewable by everyone" ON storage_cleanup_log;
CREATE POLICY "Storage cleanup logs are viewable by everyone" ON storage_cleanup_log
    FOR SELECT 
    USING (true);
