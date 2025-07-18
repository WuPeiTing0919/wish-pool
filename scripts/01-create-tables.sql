-- 心願星河 - 基礎表格創建
-- 執行順序：第 1 步
-- 說明：創建應用程式所需的基礎數據表格

-- 開始事務
BEGIN;

-- 1. 創建 wishes 表格（困擾案例主表）
CREATE TABLE IF NOT EXISTS wishes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  current_pain TEXT NOT NULL CHECK (length(current_pain) >= 1 AND length(current_pain) <= 2000),
  expected_solution TEXT NOT NULL CHECK (length(expected_solution) >= 1 AND length(expected_solution) <= 2000),
  expected_effect TEXT CHECK (length(expected_effect) <= 1000),
  is_public BOOLEAN DEFAULT true NOT NULL,
  email TEXT CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  images JSONB DEFAULT '[]'::jsonb NOT NULL,
  user_session TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  category TEXT CHECK (category IN ('工作效率', '人際關係', '技術問題', '職涯發展', '工作環境', '其他')),
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. 創建 wish_likes 表格（點讚記錄）
CREATE TABLE IF NOT EXISTS wish_likes (
  id BIGSERIAL PRIMARY KEY,
  wish_id BIGINT NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
  user_session TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(wish_id, user_session)
);

-- 3. 創建 user_settings 表格（用戶設定）
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_session TEXT UNIQUE NOT NULL,
  background_music_enabled BOOLEAN DEFAULT false NOT NULL,
  background_music_volume DECIMAL(3,2) DEFAULT 0.30 CHECK (background_music_volume >= 0 AND background_music_volume <= 1),
  background_music_playing BOOLEAN DEFAULT false NOT NULL,
  theme_preference TEXT DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  language_preference TEXT DEFAULT 'zh-TW' CHECK (language_preference IN ('zh-TW', 'en-US')),
  notification_enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. 創建 migration_log 表格（遷移記錄）
CREATE TABLE IF NOT EXISTS migration_log (
  id BIGSERIAL PRIMARY KEY,
  user_session TEXT NOT NULL,
  migration_type TEXT NOT NULL CHECK (migration_type IN ('wishes', 'likes', 'settings')),
  source_data JSONB,
  target_records INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT false NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. 創建 system_stats 表格（系統統計）
CREATE TABLE IF NOT EXISTS system_stats (
  id BIGSERIAL PRIMARY KEY,
  stat_date DATE DEFAULT CURRENT_DATE NOT NULL,
  total_wishes INTEGER DEFAULT 0,
  public_wishes INTEGER DEFAULT 0,
  private_wishes INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(stat_date)
);

-- 提交事務
COMMIT;

-- 添加表格註釋
COMMENT ON TABLE wishes IS '用戶提交的工作困擾案例主表';
COMMENT ON TABLE wish_likes IS '困擾案例的點讚記錄表';
COMMENT ON TABLE user_settings IS '用戶個人設定表（音樂、主題等）';
COMMENT ON TABLE migration_log IS '數據遷移記錄表';
COMMENT ON TABLE system_stats IS '系統統計數據表';

-- 添加欄位註釋
COMMENT ON COLUMN wishes.title IS '困擾案例標題';
COMMENT ON COLUMN wishes.current_pain IS '目前遇到的困擾描述';
COMMENT ON COLUMN wishes.expected_solution IS '期望的解決方案';
COMMENT ON COLUMN wishes.expected_effect IS '預期效果描述';
COMMENT ON COLUMN wishes.is_public IS '是否公開顯示';
COMMENT ON COLUMN wishes.images IS '相關圖片資訊（JSON格式）';
COMMENT ON COLUMN wishes.user_session IS '用戶會話標識';
COMMENT ON COLUMN wishes.category IS '困擾類別';
COMMENT ON COLUMN wishes.priority IS '優先級（1-5，5最高）';

COMMENT ON COLUMN wish_likes.wish_id IS '被點讚的困擾案例ID';
COMMENT ON COLUMN wish_likes.user_session IS '點讚用戶的會話標識';
COMMENT ON COLUMN wish_likes.ip_address IS '點讚用戶的IP地址';

COMMENT ON COLUMN user_settings.background_music_enabled IS '背景音樂是否啟用';
COMMENT ON COLUMN user_settings.background_music_volume IS '背景音樂音量（0-1）';
COMMENT ON COLUMN user_settings.theme_preference IS '主題偏好設定';

-- 顯示創建結果
DO $$
BEGIN
  RAISE NOTICE '✅ 基礎表格創建完成！';
  RAISE NOTICE '📊 創建的表格：';
  RAISE NOTICE '   - wishes（困擾案例）';
  RAISE NOTICE '   - wish_likes（點讚記錄）';
  RAISE NOTICE '   - user_settings（用戶設定）';
  RAISE NOTICE '   - migration_log（遷移記錄）';
  RAISE NOTICE '   - system_stats（系統統計）';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 下一步：執行 02-create-indexes.sql';
END $$;
