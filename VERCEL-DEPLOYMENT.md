# 心願星河 - Vercel 部署指南

## 📋 部署前检查清单

### 1. 数据库准备
- ✅ Supabase 项目已创建并配置
- ✅ 数据库表格已创建（运行过所有 SQL 脚本）
- ✅ Storage 桶已设置
- ✅ RLS 政策已配置

### 2. 代码准备
- ✅ 代码已推送到 GitHub
- ✅ 项目可以在本地正常运行
- ✅ 构建命令可以成功执行

## 🚀 Vercel 部署步骤

### 第一步：连接 GitHub
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 从 GitHub 选择 `wish-pool` 仓库
4. 点击 "Import"

### 第二步：项目配置
**Framework Preset**: Next.js
**Root Directory**: `./`
**Build Command**: `npm run build`
**Output Directory**: `.next`（默认，无需修改）

### 第三步：环境变量设置 ⚠️ 重要
在 Vercel 项目设置中添加以下环境变量：

#### 必要的环境变量
```env
# Supabase 配置 (必需)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 生产环境 URL (必需修改)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Supabase Service Role Key (可选，用于管理功能)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 🔧 如何获取 Supabase 配置
1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目
3. 进入 Settings → API
4. 复制以下值：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role** → `SUPABASE_SERVICE_ROLE_KEY`

#### 🌐 设置生产环境 URL
部署完成后，Vercel 会给您一个域名，例如：
- 临时域名：`https://wish-pool-abcd1234.vercel.app`
- 自定义域名：`https://your-custom-domain.com`

将这个域名设置为 `NEXT_PUBLIC_APP_URL` 的值。

### 第四步：执行部署
1. 确认所有设置正确
2. 点击 "Deploy"
3. 等待部署完成（通常 2-5 分钟）

## 🎯 部署后配置

### 1. 更新环境变量
部署成功后，获取 Vercel 分配的域名，然后：
1. 进入 Vercel 项目设置
2. 找到 Environment Variables
3. 编辑 `NEXT_PUBLIC_APP_URL`
4. 设置为实际的生产域名
5. 重新部署（可选，如果应用需要这个变量）

### 2. Supabase 域名配置
在 Supabase Dashboard 中：
1. 进入 Authentication → Settings
2. 添加您的 Vercel 域名到 Site URL
3. 添加到 Redirect URLs（如果有登录功能）

## ✅ 部署后验证

### 功能测试
- [ ] 访问主页是否正常加载
- [ ] 提交困扰案例功能
- [ ] 查看公开困扰功能
- [ ] 点赞功能是否正常
- [ ] 图片上传功能
- [ ] 背景音乐控制
- [ ] 响应式设计在不同设备

### 性能检查
- [ ] 页面加载速度
- [ ] 图片显示正常
- [ ] API 调用响应时间
- [ ] SEO 元标签

### 数据库连接测试
```bash
# 可以在本地测试生产环境的连接
NEXT_PUBLIC_SUPABASE_URL=your_production_url \
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key \
npm run dev
```

## 🔧 常见问题解决

### 1. 构建失败
**错误**: `Module not found` 或类型错误
**解决**: 检查所有依赖是否已安装，运行 `npm install`

### 2. Supabase 连接失败
**错误**: 401 Unauthorized 或连接超时
**解决**: 
- 检查环境变量是否正确设置
- 确认 Supabase 项目状态是否正常
- 验证 API 密钥是否有效

### 3. 图片上传失败
**错误**: Storage 相关错误
**解决**:
- 检查 Storage 桶是否已创建
- 确认 RLS 政策是否正确配置
- 验证 CORS 设置

### 4. 环境变量未生效
**错误**: 环境变量读取为 undefined
**解决**:
- 确保变量名以 `NEXT_PUBLIC_` 开头（客户端变量）
- 重新部署项目
- 检查变量值中没有多余的空格或引号

## 📈 生产环境优化

### 1. 自定义域名设置
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 配置 DNS 记录
4. 更新 `NEXT_PUBLIC_APP_URL` 环境变量

### 2. 分析和监控
```env
# 可选：添加分析工具
NEXT_PUBLIC_GOOGLE_ANALYTICS=GA_MEASUREMENT_ID
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

### 3. 安全配置
- 启用 HTTPS（Vercel 自动配置）
- 配置适当的 CORS 政策
- 设置合适的 CSP 标头

## 🚨 重要提醒

1. **环境变量安全**：
   - 不要在客户端代码中暴露 Service Role Key
   - 只有 `NEXT_PUBLIC_` 开头的变量可以在浏览器中访问

2. **数据备份**：
   - 部署前确保 Supabase 数据已备份
   - 保存环境变量配置的副本

3. **测试环境**：
   - 建议先在 Preview 环境测试
   - 确认所有功能正常后再推广到生产环境

## 📞 支持

如果遇到部署问题，请检查：
1. Vercel 部署日志
2. Supabase 项目状态
3. 浏览器控制台错误
4. 网络连接状况

---

**快速部署检查表**：
- [ ] GitHub 代码已推送
- [ ] Supabase 项目已配置
- [ ] 环境变量已设置
- [ ] 部署成功
- [ ] 功能测试通过
- [ ] 域名已配置 