/**
 * IP 檢測功能測試腳本
 * 用於測試和驗證IP白名單功能
 */

const { getClientIp, getDetailedIpInfo, cleanIpAddress } = require('../lib/ip-utils.ts');

// 模擬請求對象
const mockRequest = {
  headers: {
    'x-forwarded-for': '::ffff:127.0.0.1, 192.168.1.100',
    'x-real-ip': '::ffff:127.0.0.1',
    'x-client-ip': '::1',
    'connection': {
      'remoteAddress': '::ffff:127.0.0.1'
    },
    'socket': {
      'remoteAddress': '::1'
    }
  },
  ip: '::ffff:127.0.0.1'
};

console.log('=== IP 檢測測試 ===');

// 測試 cleanIpAddress 函數
console.log('\n1. 測試 cleanIpAddress 函數:');
console.log('::ffff:127.0.0.1 ->', cleanIpAddress('::ffff:127.0.0.1'));
console.log('::1 ->', cleanIpAddress('::1'));
console.log('127.0.0.1 ->', cleanIpAddress('127.0.0.1'));
console.log('192.168.1.1 ->', cleanIpAddress('192.168.1.1'));

// 測試詳細IP信息
console.log('\n2. 測試詳細IP信息:');
const detailedInfo = getDetailedIpInfo(mockRequest);
console.log('檢測到的IP:', detailedInfo.detectedIp);
console.log('所有找到的IP:', detailedInfo.allFoundIps);
console.log('IP來源:', detailedInfo.ipSources);

// 測試客戶端IP獲取
console.log('\n3. 測試客戶端IP獲取:');
const clientIp = getClientIp(mockRequest);
console.log('最終檢測到的IP:', clientIp);

console.log('\n=== 測試完成 ==='); 