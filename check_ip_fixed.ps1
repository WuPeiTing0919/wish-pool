# IP地址檢查和設定腳本 - 修正版
# 檢查當前IP地址並與允許清單比較

Write-Host "=== IP地址檢查工具 ===" -ForegroundColor Green
Write-Host ""

# 獲取本地IP地址
Write-Host "本地網路IP地址:" -ForegroundColor Yellow
$localIPs = Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4" -and $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"} | Select-Object IPAddress, InterfaceAlias
foreach ($ip in $localIPs) {
    Write-Host "  $($ip.IPAddress) - $($ip.InterfaceAlias)" -ForegroundColor Cyan
}

Write-Host ""

# 獲取外部IP地址 - 修正版
Write-Host "外部IP地址:" -ForegroundColor Yellow
try {
    $externalIP = (Invoke-WebRequest -Uri "https://ifconfig.me/ip" -UseBasicParsing).Content.Trim()
    Write-Host "  $externalIP" -ForegroundColor Cyan
} catch {
    Write-Host "  無法獲取外部IP地址" -ForegroundColor Red
    $externalIP = "未知"
}

Write-Host ""

# 允許的IP清單
$allowedIPs = @(
    "114.33.18.13",  # 岡山 Hinet
    "125.229.65.83", # 汐止
    "60.248.164.91", # 汐止
    "220.132.236.89", # 新竹
    "211.72.69.222", # 新竹
    "219.87.170.253", # 璟茂
    "125.228.50.228"  # 璟茂
)

Write-Host "允許的IP清單:" -ForegroundColor Yellow
foreach ($ip in $allowedIPs) {
    Write-Host "  $ip" -ForegroundColor White
}

Write-Host ""

# 檢查當前IP是否在允許清單中
if ($externalIP -ne "未知" -and $allowedIPs -contains $externalIP) {
    Write-Host "✅ 當前IP ($externalIP) 在允許清單中" -ForegroundColor Green
} elseif ($externalIP -ne "未知") {
    Write-Host "❌ 當前IP ($externalIP) 不在允許清單中" -ForegroundColor Red
    Write-Host "請聯繫管理員將 $externalIP 加入允許清單" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ 無法確定當前IP地址" -ForegroundColor Yellow
}

Write-Host ""

# 檢查網路連接
Write-Host "網路連接測試:" -ForegroundColor Yellow
$testIPs = @("8.8.8.8", "1.1.1.1", "114.33.18.13")
foreach ($testIP in $testIPs) {
    try {
        $ping = Test-Connection -ComputerName $testIP -Count 1 -Quiet
        if ($ping) {
            Write-Host "  ✅ $testIP - 連接正常" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $testIP - 連接失敗" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $testIP - 連接失敗" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 故障排除建議 ===" -ForegroundColor Green
Write-Host "1. 如果顯示127.0.0.1，請檢查應用程式綁定設定" -ForegroundColor White
Write-Host "2. 確保網路連接正常" -ForegroundColor White
Write-Host "3. 檢查防火牆設定" -ForegroundColor White
Write-Host "4. 確認VPN連接狀態" -ForegroundColor White
Write-Host "5. 檢查DNS設定" -ForegroundColor White 