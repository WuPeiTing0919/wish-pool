# IPv6格式IPv4地址顯示功能

## 概述

本專案已實現首頁顯示IPv6格式的IPv4地址功能。當系統檢測到IPv6格式的IPv4地址（如 `::ffff:192.168.1.1`）時，會自動轉換並顯示為標準的IPv4格式，同時提供詳細的IPv6信息。

## 功能特點

### 1. 自動IPv6格式檢測
- 自動檢測IPv6格式的IPv4地址（`::ffff:` 前綴）
- 將IPv6格式轉換為標準IPv4格式顯示
- 保留原始IPv6格式信息供參考

### 2. 雙格式顯示
- **主要顯示**: 標準IPv4格式（如 `192.168.1.1`）
- **次要顯示**: IPv6映射格式（如 `::ffff:192.168.1.1`）
- 支持點擊信息圖標查看詳細信息

### 3. 響應式設計
- **桌面版**: 完整顯示IPv4和IPv6格式
- **手機版**: 簡化顯示，標識IP類型（IPv4/IPv6）

### 4. 詳細信息彈出框
點擊信息圖標可查看：
- IPv4格式地址
- IPv6格式地址
- 原始檢測格式
- 檢測方法
- 所有檢測到的IP列表
- IPv6支援狀態

## 技術實現

### API端點 (`/api/ip`)
```typescript
{
  ip: "192.168.1.1",                    // 標準IPv4格式
  ipv6Info: {
    isIPv6Mapped: true,                 // 是否為IPv6映射
    originalFormat: "::ffff:192.168.1.1", // 原始格式
    ipv6Format: "::ffff:192.168.1.1",   // IPv6格式
    hasIPv6Support: true                // IPv6支援狀態
  },
  debug: {
    ipDetectionMethod: "IPv6-Mapped-IPv4", // 檢測方法
    // ... 其他調試信息
  }
}
```

### 組件功能 (`components/ip-display.tsx`)
- 自動處理IPv6格式轉換
- 提供交互式詳細信息顯示
- 支持移動端和桌面端不同顯示模式

## 使用方式

### 1. 基本使用
```tsx
import IpDisplay from "@/components/ip-display"

// 桌面版完整顯示
<IpDisplay />

// 手機版簡化顯示
<IpDisplay mobileSimplified />
```

### 2. 測試頁面
訪問 `/test-ipv6` 頁面查看完整功能演示：
- IP顯示組件測試
- 原始API數據展示
- 調試信息查看

## 支援的IPv6格式

### 1. IPv6映射IPv4地址
- 格式: `::ffff:192.168.1.1`
- 自動轉換為: `192.168.1.1`
- 顯示類型: IPv6

### 2. IPv6本地回環地址
- 格式: `::1`
- 自動轉換為: `127.0.0.1`
- 顯示類型: IPv4

### 3. 標準IPv4地址
- 格式: `192.168.1.1`
- 保持原格式
- 顯示類型: IPv4

## 配置選項

### 環境變數
```env
# IP白名單功能
ENABLE_IP_WHITELIST=true
ALLOWED_IPS=192.168.1.0/24,10.0.0.0/8
```

### 組件屬性
```tsx
interface IpDisplayProps {
  mobileSimplified?: boolean  // 是否使用手機版簡化顯示
}
```

## 故障排除

### 1. 顯示為127.0.0.1
- 檢查是否在本地開發環境
- 確認網路配置
- 檢查代理伺服器設置

### 2. IPv6格式未正確轉換
- 確認API端點正常運行
- 檢查瀏覽器控制台錯誤
- 驗證網路請求狀態

### 3. 詳細信息彈出框不顯示
- 確認JavaScript已啟用
- 檢查CSS樣式是否正確載入
- 驗證組件狀態管理

## 開發說明

### 1. 本地開發
```bash
npm run dev
# 訪問 http://localhost:3000
# 測試頁面: http://localhost:3000/test-ipv6
```

### 2. 生產部署
```bash
npm run build
npm start
```

### 3. 自定義樣式
組件使用Tailwind CSS，可通過修改類名自定義外觀：
- 背景色: `bg-slate-800/50`
- 邊框: `border-blue-800/30`
- 文字顏色: `text-blue-200`

## 更新日誌

### v1.0.0 (當前版本)
- ✅ 實現IPv6格式IPv4地址自動檢測
- ✅ 添加雙格式顯示功能
- ✅ 實現響應式設計
- ✅ 添加詳細信息彈出框
- ✅ 創建測試頁面
- ✅ 完善API端點支援

## 未來計劃

- [ ] 添加更多IPv6格式支援
- [ ] 實現IP地理位置顯示
- [ ] 添加IP歷史記錄功能
- [ ] 支援自定義主題
- [ ] 添加更多調試工具 