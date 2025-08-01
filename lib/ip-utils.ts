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

// 清理和驗證IP地址
function cleanIpAddress(ip: string): string | null {
  if (!ip) return null;
  
  // 移除空白字符
  ip = ip.trim();
  
  // 處理IPv6格式的IPv4地址 (例如: ::ffff:192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // 處理純IPv6本地回環地址
  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  // 驗證IP格式
  if (!isValidIp(ip)) {
    return null;
  }
  
  return ip;
}

// 獲取客戶端真實IP
export function getClientIp(req: any): string {
  // 按優先順序檢查各種IP來源
  const ipSources = [
    // 代理伺服器轉發的IP
    req.headers['x-forwarded-for'],
    req.headers['x-real-ip'],
    req.headers['x-client-ip'],
    req.headers['cf-connecting-ip'], // Cloudflare
    req.headers['x-forwarded'], // 舊版代理頭
    req.headers['forwarded-for'],
    req.headers['forwarded'],
    
    // 直接連接的IP
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.ip,
    
    // Next.js 特定的IP來源
    req.headers['x-original-forwarded-for'],
    req.headers['x-cluster-client-ip'],
  ];

  // 收集所有找到的IP用於調試
  const foundIps: string[] = [];

  for (const ipSource of ipSources) {
    if (ipSource) {
      // 處理多個IP的情況 (例如: "192.168.1.1, 10.0.0.1, 203.0.113.1")
      const ipList = ipSource.toString().split(',').map(ip => ip.trim());
      
      // 遍歷所有IP，找到第一個有效的公網IP
      for (const ip of ipList) {
        const cleanIp = cleanIpAddress(ip);
        if (cleanIp) {
          foundIps.push(cleanIp);
          // 檢查是否為公網IP
          if (isPublicIp(cleanIp)) {
            return cleanIp;
          }
        }
      }
    }
  }

  // 如果沒有找到有效的公網IP，返回第一個有效的IP
  for (const ipSource of ipSources) {
    if (ipSource) {
      const ipList = ipSource.toString().split(',').map(ip => ip.trim());
      for (const ip of ipList) {
        const cleanIp = cleanIpAddress(ip);
        if (cleanIp) {
          return cleanIp;
        }
      }
    }
  }

  // 在本地開發環境中，嘗試獲取本機IP
  if (process.env.NODE_ENV === 'development') {
    const localIp = getLocalIp();
    if (localIp && localIp !== '127.0.0.1') {
      return localIp;
    }
  }

  // 最後的備用方案
  return '127.0.0.1';
}

// 獲取本機IP地址（僅用於開發環境）
function getLocalIp(): string | null {
  try {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
      for (const networkInterface of interfaces[name]) {
        // 跳過內部（非IPv4）和回環地址
        if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
          return networkInterface.address;
        }
      }
    }
  } catch (error) {
    console.error('Error getting local IP:', error);
  }
  
  return null;
}

// 檢查是否為公網IP
function isPublicIp(ip: string): boolean {
  // 私有IP範圍
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8
    /^169\.254\./,              // 169.254.0.0/16 (Link-local)
    /^0\./,                     // 0.0.0.0/8
    /^224\./,                   // 224.0.0.0/4 (Multicast)
    /^240\./,                   // 240.0.0.0/4 (Reserved)
  ];
  
  return !privateRanges.some(range => range.test(ip));
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

// 獲取IP地理位置信息（可選功能）
export async function getIpLocation(ip: string): Promise<any> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching IP location:', error);
  }
  return null;
}

// 獲取詳細的IP檢測信息（用於調試）
export function getDetailedIpInfo(req: any): {
  detectedIp: string;
  allFoundIps: string[];
  ipSources: Record<string, string | null>;
  isLocalDevelopment: boolean;
  localIp: string | null;
} {
  const ipSources = {
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-real-ip': req.headers['x-real-ip'],
    'x-client-ip': req.headers['x-client-ip'],
    'cf-connecting-ip': req.headers['cf-connecting-ip'],
    'x-forwarded': req.headers['x-forwarded'],
    'forwarded-for': req.headers['forwarded-for'],
    'forwarded': req.headers['forwarded'],
    'x-original-forwarded-for': req.headers['x-original-forwarded-for'],
    'x-cluster-client-ip': req.headers['x-cluster-client-ip'],
    'connection.remoteAddress': req.connection?.remoteAddress,
    'socket.remoteAddress': req.socket?.remoteAddress,
    'req.ip': req.ip,
  };

  const allFoundIps: string[] = [];
  let detectedIp = '127.0.0.1';

  // 收集所有IP
  Object.values(ipSources).forEach(ipSource => {
    if (ipSource) {
      const ipList = ipSource.toString().split(',').map(ip => ip.trim());
      ipList.forEach(ip => {
        const cleanIp = cleanIpAddress(ip);
        if (cleanIp && !allFoundIps.includes(cleanIp)) {
          allFoundIps.push(cleanIp);
        }
      });
    }
  });

  // 如果沒有找到任何IP，檢查是否有IPv6格式的地址
  if (allFoundIps.length === 0) {
    Object.values(ipSources).forEach(ipSource => {
      if (ipSource) {
        const ipList = ipSource.toString().split(',').map(ip => ip.trim());
        ipList.forEach(ip => {
          // 直接處理IPv6格式的IPv4地址
          if (ip.startsWith('::ffff:')) {
            const cleanIp = ip.substring(7);
            if (isValidIp(cleanIp) && !allFoundIps.includes(cleanIp)) {
              allFoundIps.push(cleanIp);
            }
          }
        });
      }
    });
  }

  // 選擇最佳IP
  for (const ip of allFoundIps) {
    if (isPublicIp(ip)) {
      detectedIp = ip;
      break;
    }
  }

  // 如果沒有公網IP，選擇第一個非回環IP
  if (detectedIp === '127.0.0.1') {
    for (const ip of allFoundIps) {
      if (ip !== '127.0.0.1' && ip !== '::1') {
        detectedIp = ip;
        break;
      }
    }
  }

  const isLocalDevelopment = process.env.NODE_ENV === 'development';
  const localIp = isLocalDevelopment ? getLocalIp() : null;

  return {
    detectedIp,
    allFoundIps,
    ipSources,
    isLocalDevelopment,
    localIp
  };
} 