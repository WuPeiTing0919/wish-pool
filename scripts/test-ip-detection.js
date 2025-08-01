/**
 * IP 檢測功能測試腳本
 * 用於測試和驗證IP白名單功能
 */

const { getClientIp, isIpAllowed, isValidIp, isValidCidr } = require('../lib/ip-utils.ts');

// 模擬請求對象
function createMockRequest(headers = {}) {
  return {
    headers,
    connection: { remoteAddress: '192.168.1.100' },
    socket: { remoteAddress: '192.168.1.100' },
    ip: '192.168.1.100'
  };
}

// 測試IP檢測功能
function testIpDetection() {
  console.log('🧪 開始測試IP檢測功能...\n');

  // 測試1: 基本IP檢測
  console.log('📋 測試1: 基本IP檢測');
  const basicRequest = createMockRequest({
    'x-forwarded-for': '203.0.113.1, 192.168.1.100'
  });
  const detectedIp = getClientIp(basicRequest);
  console.log(`檢測到的IP: ${detectedIp}`);
  console.log(`預期結果: 203.0.113.1 (公網IP)`);
  console.log(`實際結果: ${detectedIp === '203.0.113.1' ? '✅ 通過' : '❌ 失敗'}\n`);

  // 測試2: Cloudflare代理
  console.log('📋 測試2: Cloudflare代理');
  const cloudflareRequest = createMockRequest({
    'cf-connecting-ip': '203.0.113.2'
  });
  const cfIp = getClientIp(cloudflareRequest);
  console.log(`檢測到的IP: ${cfIp}`);
  console.log(`預期結果: 203.0.113.2`);
  console.log(`實際結果: ${cfIp === '203.0.113.2' ? '✅ 通過' : '❌ 失敗'}\n`);

  // 測試3: 本地開發環境
  console.log('📋 測試3: 本地開發環境');
  const localRequest = createMockRequest({
    'x-forwarded-for': '127.0.0.1'
  });
  const localIp = getClientIp(localRequest);
  console.log(`檢測到的IP: ${localIp}`);
  console.log(`預期結果: 127.0.0.1 (本地回環)`);
  console.log(`實際結果: ${localIp === '127.0.0.1' ? '✅ 通過' : '❌ 失敗'}\n`);

  // 測試4: 多個代理IP
  console.log('📋 測試4: 多個代理IP');
  const multiProxyRequest = createMockRequest({
    'x-forwarded-for': '203.0.113.3, 10.0.0.1, 192.168.1.1'
  });
  const multiIp = getClientIp(multiProxyRequest);
  console.log(`檢測到的IP: ${multiIp}`);
  console.log(`預期結果: 203.0.113.3 (第一個公網IP)`);
  console.log(`實際結果: ${multiIp === '203.0.113.3' ? '✅ 通過' : '❌ 失敗'}\n`);
}

// 測試IP白名單功能
function testIpWhitelist() {
  console.log('🔒 開始測試IP白名單功能...\n');

  const allowedIps = '114.33.18.13,125.229.65.83,192.168.1.0/24';

  // 測試1: 單一IP匹配
  console.log('📋 測試1: 單一IP匹配');
  const testIp1 = '114.33.18.13';
  const result1 = isIpAllowed(testIp1, allowedIps);
  console.log(`測試IP: ${testIp1}`);
  console.log(`預期結果: true (在白名單中)`);
  console.log(`實際結果: ${result1 ? '✅ 通過' : '❌ 失敗'}\n`);

  // 測試2: CIDR範圍匹配
  console.log('📋 測試2: CIDR範圍匹配');
  const testIp2 = '192.168.1.100';
  const result2 = isIpAllowed(testIp2, allowedIps);
  console.log(`測試IP: ${testIp2}`);
  console.log(`預期結果: true (在192.168.1.0/24範圍內)`);
  console.log(`實際結果: ${result2 ? '✅ 通過' : '❌ 失敗'}\n`);

  // 測試3: 不在白名單中的IP
  console.log('📋 測試3: 不在白名單中的IP');
  const testIp3 = '203.0.113.1';
  const result3 = isIpAllowed(testIp3, allowedIps);
  console.log(`測試IP: ${testIp3}`);
  console.log(`預期結果: false (不在白名單中)`);
  console.log(`實際結果: ${!result3 ? '✅ 通過' : '❌ 失敗'}\n`);

  // 測試4: 空白名單
  console.log('📋 測試4: 空白名單');
  const testIp4 = '203.0.113.1';
  const result4 = isIpAllowed(testIp4, '');
  console.log(`測試IP: ${testIp4}`);
  console.log(`預期結果: true (空白名單允許所有IP)`);
  console.log(`實際結果: ${result4 ? '✅ 通過' : '❌ 失敗'}\n`);
}

// 測試IP格式驗證
function testIpValidation() {
  console.log('🔍 開始測試IP格式驗證...\n');

  // 測試有效IP
  console.log('📋 測試有效IP格式');
  const validIps = ['192.168.1.1', '10.0.0.1', '203.0.113.1'];
  validIps.forEach(ip => {
    const isValid = isValidIp(ip);
    console.log(`${ip}: ${isValid ? '✅ 有效' : '❌ 無效'}`);
  });
  console.log('');

  // 測試無效IP
  console.log('📋 測試無效IP格式');
  const invalidIps = ['192.168.1.256', '10.0.0', 'invalid', '192.168.1.1.1'];
  invalidIps.forEach(ip => {
    const isValid = isValidIp(ip);
    console.log(`${ip}: ${!isValid ? '✅ 正確拒絕' : '❌ 錯誤接受'}`);
  });
  console.log('');

  // 測試CIDR格式
  console.log('📋 測試CIDR格式');
  const validCidrs = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12'];
  validCidrs.forEach(cidr => {
    const isValid = isValidCidr(cidr);
    console.log(`${cidr}: ${isValid ? '✅ 有效' : '❌ 無效'}`);
  });
  console.log('');
}

// 主測試函數
function runAllTests() {
  console.log('🚀 IP白名單功能測試套件\n');
  console.log('=' * 50);
  
  try {
    testIpDetection();
    testIpWhitelist();
    testIpValidation();
    
    console.log('🎉 所有測試完成！');
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testIpDetection,
  testIpWhitelist,
  testIpValidation,
  runAllTests
}; 