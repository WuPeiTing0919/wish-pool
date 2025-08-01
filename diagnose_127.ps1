# 診斷 127.0.0.1 問題的腳本
# 檢查應用程式綁定和網路配置

Write-Host "=== 127.0.0.1 問題診斷工具 ===" -ForegroundColor Green
Write-Host ""

# 1. 檢查當前運行的服務
Write-Host "1. 檢查當前運行的服務:" -ForegroundColor Yellow
$services = Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name, DisplayName
Write-Host "   運行中的服務數量: $($services.Count)" -ForegroundColor Cyan

# 2. 檢查監聽的端口
Write-Host ""
Write-Host "2. 檢查監聽的端口:" -ForegroundColor Yellow
$listening = netstat -an | Select-String "LISTENING"
if ($listening) {
    Write-Host "   發現監聽端口:" -ForegroundColor Cyan
    $listening | ForEach-Object {
        Write-Host "   $_" -ForegroundColor White
    }
} else {
    Write-Host "   沒有發現監聽端口" -ForegroundColor Red
}

# 3. 檢查常見的Web服務
Write-Host ""
Write-Host "3. 檢查常見的Web服務:" -ForegroundColor Yellow

# 檢查 IIS
$iis = Get-Service -Name "W3SVC" -ErrorAction SilentlyContinue
if ($iis) {
    Write-Host "   IIS 狀態: $($iis.Status)" -ForegroundColor Cyan
} else {
    Write-Host "   IIS: 未安裝或未運行" -ForegroundColor Gray
}

# 檢查 Apache
$apache = Get-Process -Name "httpd" -ErrorAction SilentlyContinue
if ($apache) {
    Write-Host "   Apache: 正在運行" -ForegroundColor Cyan
} else {
    Write-Host "   Apache: 未運行" -ForegroundColor Gray
}

# 檢查 Node.js
$node = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "   Node.js: 正在運行 (PID: $($node.Id))" -ForegroundColor Cyan
} else {
    Write-Host "   Node.js: 未運行" -ForegroundColor Gray
}

# 檢查 Python
$python = Get-Process -Name "python*" -ErrorAction SilentlyContinue
if ($python) {
    Write-Host "   Python: 正在運行 (PID: $($python.Id))" -ForegroundColor Cyan
} else {
    Write-Host "   Python: 未運行" -ForegroundColor Gray
}

# 4. 檢查網路配置
Write-Host ""
Write-Host "4. 網路配置檢查:" -ForegroundColor Yellow
$interfaces = Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4" -and $_.IPAddress -notlike "127.*"} | Select-Object IPAddress, InterfaceAlias
Write-Host "   可用網路介面:" -ForegroundColor Cyan
foreach ($if in $interfaces) {
    Write-Host "   $($if.IPAddress) - $($if.InterfaceAlias)" -ForegroundColor White
}

# 5. 檢查防火牆設定
Write-Host ""
Write-Host "5. 防火牆檢查:" -ForegroundColor Yellow
$firewall = Get-NetFirewallProfile | Select-Object Name, Enabled
foreach ($profile in $firewall) {
    $status = if ($profile.Enabled) { "啟用" } else { "停用" }
    Write-Host "   $($profile.Name): $status" -ForegroundColor Cyan
}

# 6. 常見解決方案
Write-Host ""
Write-Host "=== 常見解決方案 ===" -ForegroundColor Green

Write-Host ""
Write-Host "如果您的應用程式顯示 127.0.0.1，請嘗試以下解決方案:" -ForegroundColor Yellow

Write-Host ""
Write-Host "1. 檢查應用程式配置文件:" -ForegroundColor Cyan
Write-Host "   - 確保綁定到 0.0.0.0 而不是 127.0.0.1" -ForegroundColor White
Write-Host "   - 檢查 host 設定" -ForegroundColor White

Write-Host ""
Write-Host "2. 常見的配置修改:" -ForegroundColor Cyan
Write-Host "   Node.js: app.listen(3000, '0.0.0.0')" -ForegroundColor White
Write-Host "   Python Flask: app.run(host='0.0.0.0')" -ForegroundColor White
Write-Host "   Apache: Listen 0.0.0.0:80" -ForegroundColor White
Write-Host "   Nginx: listen 80;" -ForegroundColor White

Write-Host ""
Write-Host "3. 檢查應用程式是否正在運行:" -ForegroundColor Cyan
Write-Host "   - 確認應用程式進程存在" -ForegroundColor White
Write-Host "   - 檢查錯誤日誌" -ForegroundColor White
Write-Host "   - 確認端口沒有被其他程式佔用" -ForegroundColor White

Write-Host ""
Write-Host "4. 網路測試:" -ForegroundColor Cyan
Write-Host "   - 測試本地連接: telnet 127.0.0.1 [port]" -ForegroundColor White
Write-Host "   - 測試外部連接: telnet [your-ip] [port]" -ForegroundColor White

Write-Host ""
Write-Host "請告訴我您使用的是哪種應用程式，我可以提供更具體的解決方案。" -ForegroundColor Green 