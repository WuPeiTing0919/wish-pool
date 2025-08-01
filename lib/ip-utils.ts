/**
 * IP 白名單檢查工具
 */

// 檢查IP是否在指定範圍內
function isIpInRange(ip: string, range: string): boolean {
  // 處理單一IP
  if (!range.includes('/')) {
    return ip === range;
  }

  // 處理CIDR範圍 (例如: 192.168.1.0/24)
  const [rangeIp, prefixLength] = range.split('/');
  const mask = parseInt(prefixLength);
  
  if (isNaN(mask) || mask < 0 || mask > 32) {
    return false;
  }

  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(rangeIp);
  const maskNum = (0xFFFFFFFF << (32 - mask)) >>> 0;

  return (ipNum & maskNum) === (rangeNum & maskNum);
}

// 將IP地址轉換為數字
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(part => parseInt(part));
  if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
    throw new Error(`Invalid IP address: ${ip}`);
  }
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

// 檢查IP是否在白名單內
export function isIpAllowed(clientIp: string, allowedIps: string): boolean {
  if (!allowedIps || allowedIps.trim() === '') {
    return true; // 如果沒有設置白名單，允許所有IP
  }

  const allowedIpList = allowedIps.split(',').map(ip => ip.trim()).filter(ip => ip);
  
  for (const allowedIp of allowedIpList) {
    try {
      if (isIpInRange(clientIp, allowedIp)) {
        return true;
      }
    } catch (error) {
      console.error(`Invalid IP range: ${allowedIp}`, error);
    }
  }
  
  return false;
}

// 獲取客戶端真實IP
export function getClientIp(req: any): string {
  // 檢查各種可能的IP來源
  const ipSources = [
    req.headers['x-forwarded-for'],
    req.headers['x-real-ip'],
    req.headers['x-client-ip'],
    req.headers['cf-connecting-ip'], // Cloudflare
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.ip
  ];

  for (const ipSource of ipSources) {
    if (ipSource) {
      // 處理多個IP的情況 (例如: "192.168.1.1, 10.0.0.1")
      const firstIp = ipSource.toString().split(',')[0].trim();
      if (firstIp && firstIp !== '::1' && firstIp !== '127.0.0.1') {
        return firstIp;
      }
    }
  }

  return '127.0.0.1'; // 默認本地IP
}

// 驗證IP地址格式
export function isValidIp(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

// 驗證CIDR格式
export function isValidCidr(cidr: string): boolean {
  const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
  return cidrRegex.test(cidr);
} 