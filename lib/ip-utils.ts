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
    // 1Panel 和常見代理伺服器轉發的IP (優先級最高)
    req.headers['x-forwarded-for'],
    req.headers['x-real-ip'],
    req.headers['x-client-ip'],
    req.headers['cf-connecting-ip'], // Cloudflare
    req.headers['x-original-forwarded-for'], // 某些代理伺服器
    req.headers['x-cluster-client-ip'], // 集群環境
    
    // 其他代理頭
    req.headers['x-forwarded'], // 舊版代理頭
    req.headers['forwarded-for'],
    req.headers['forwarded'],
    
    // 1Panel 特殊頭部
    req.headers['x-1panel-client-ip'], // 1Panel 可能使用的頭部
    req.headers['x-nginx-proxy-real-ip'], // Nginx 代理
    
    // 直接連接的IP
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.ip,
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
          // 檢查是否為公網IP，排除內部IP和1Panel代理IP
          if (isPublicIp(cleanIp) && !isInternalProxyIp(cleanIp)) {
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

// 檢查是否為內部代理IP (如1Panel、Cloudflare等)
function isInternalProxyIp(ip: string): boolean {
  // 1Panel 和常見代理服務器的內部IP範圍
  const proxyRanges = [
    /^172\.70\./, // Cloudflare 內部IP (包含你遇到的 172.70.214.246)
    /^172\.71\./, // Cloudflare 內部IP
    /^172\.64\./, // Cloudflare 內部IP
    /^172\.65\./, // Cloudflare 內部IP
    /^172\.66\./, // Cloudflare 內部IP
    /^172\.67\./, // Cloudflare 內部IP
    /^172\.68\./, // Cloudflare 內部IP
    /^172\.69\./, // Cloudflare 內部IP
    /^172\.72\./, // Cloudflare 內部IP
    /^172\.73\./, // Cloudflare 內部IP
    /^172\.74\./, // Cloudflare 內部IP
    /^172\.75\./, // Cloudflare 內部IP
    /^172\.76\./, // Cloudflare 內部IP
    /^172\.77\./, // Cloudflare 內部IP
    /^172\.78\./, // Cloudflare 內部IP
    /^172\.79\./, // Cloudflare 內部IP
    /^172\.80\./, // Cloudflare 內部IP
    /^172\.81\./, // Cloudflare 內部IP
    /^172\.82\./, // Cloudflare 內部IP
    /^172\.83\./, // Cloudflare 內部IP
    /^172\.84\./, // Cloudflare 內部IP
    /^172\.85\./, // Cloudflare 內部IP
    /^172\.86\./, // Cloudflare 內部IP
    /^172\.87\./, // Cloudflare 內部IP
    /^172\.88\./, // Cloudflare 內部IP
    /^172\.89\./, // Cloudflare 內部IP
    /^172\.90\./, // Cloudflare 內部IP
    /^172\.91\./, // Cloudflare 內部IP
    /^172\.92\./, // Cloudflare 內部IP
    /^172\.93\./, // Cloudflare 內部IP
    /^172\.94\./, // Cloudflare 內部IP
    /^172\.95\./, // Cloudflare 內部IP
    /^172\.96\./, // Cloudflare 內部IP
    /^172\.97\./, // Cloudflare 內部IP
    /^172\.98\./, // Cloudflare 內部IP
    /^172\.99\./, // Cloudflare 內部IP
    /^172\.100\./, // Cloudflare 內部IP
    /^172\.101\./, // Cloudflare 內部IP
    /^172\.102\./, // Cloudflare 內部IP
    /^172\.103\./, // Cloudflare 內部IP
    /^172\.104\./, // Cloudflare 內部IP
    /^172\.105\./, // Cloudflare 內部IP
    /^172\.106\./, // Cloudflare 內部IP
    /^172\.107\./, // Cloudflare 內部IP
    /^172\.108\./, // Cloudflare 內部IP
    /^172\.109\./, // Cloudflare 內部IP
    /^172\.110\./, // Cloudflare 內部IP
    /^172\.111\./, // Cloudflare 內部IP
    /^172\.112\./, // Cloudflare 內部IP
    /^172\.113\./, // Cloudflare 內部IP
    /^172\.114\./, // Cloudflare 內部IP
    /^172\.115\./, // Cloudflare 內部IP
    /^172\.116\./, // Cloudflare 內部IP
    /^172\.117\./, // Cloudflare 內部IP
    /^172\.118\./, // Cloudflare 內部IP
    /^172\.119\./, // Cloudflare 內部IP
    /^172\.120\./, // Cloudflare 內部IP
    /^172\.121\./, // Cloudflare 內部IP
    /^172\.122\./, // Cloudflare 內部IP
    /^172\.123\./, // Cloudflare 內部IP
    /^172\.124\./, // Cloudflare 內部IP
    /^172\.125\./, // Cloudflare 內部IP
    /^172\.126\./, // Cloudflare 內部IP
    /^172\.127\./, // Cloudflare 內部IP
    /^172\.128\./, // Cloudflare 內部IP
    /^172\.129\./, // Cloudflare 內部IP
    /^172\.130\./, // Cloudflare 內部IP
    /^172\.131\./, // Cloudflare 內部IP
    /^172\.132\./, // Cloudflare 內部IP
    /^172\.133\./, // Cloudflare 內部IP
    /^172\.134\./, // Cloudflare 內部IP
    /^172\.135\./, // Cloudflare 內部IP
    /^172\.136\./, // Cloudflare 內部IP
    /^172\.137\./, // Cloudflare 內部IP
    /^172\.138\./, // Cloudflare 內部IP
    /^172\.139\./, // Cloudflare 內部IP
    /^172\.140\./, // Cloudflare 內部IP
    /^172\.141\./, // Cloudflare 內部IP
    /^172\.142\./, // Cloudflare 內部IP
    /^172\.143\./, // Cloudflare 內部IP
    /^172\.144\./, // Cloudflare 內部IP
    /^172\.145\./, // Cloudflare 內部IP
    /^172\.146\./, // Cloudflare 內部IP
    /^172\.147\./, // Cloudflare 內部IP
    /^172\.148\./, // Cloudflare 內部IP
    /^172\.149\./, // Cloudflare 內部IP
    /^172\.150\./, // Cloudflare 內部IP
    /^172\.151\./, // Cloudflare 內部IP
    /^172\.152\./, // Cloudflare 內部IP
    /^172\.153\./, // Cloudflare 內部IP
    /^172\.154\./, // Cloudflare 內部IP
    /^172\.155\./, // Cloudflare 內部IP
    /^172\.156\./, // Cloudflare 內部IP
    /^172\.157\./, // Cloudflare 內部IP
    /^172\.158\./, // Cloudflare 內部IP
    /^172\.159\./, // Cloudflare 內部IP
    /^172\.160\./, // Cloudflare 內部IP
    /^172\.161\./, // Cloudflare 內部IP
    /^172\.162\./, // Cloudflare 內部IP
    /^172\.163\./, // Cloudflare 內部IP
    /^172\.164\./, // Cloudflare 內部IP
    /^172\.165\./, // Cloudflare 內部IP
    /^172\.166\./, // Cloudflare 內部IP
    /^172\.167\./, // Cloudflare 內部IP
    /^172\.168\./, // Cloudflare 內部IP
    /^172\.169\./, // Cloudflare 內部IP
    /^172\.170\./, // Cloudflare 內部IP
    /^172\.171\./, // Cloudflare 內部IP
    /^172\.172\./, // Cloudflare 內部IP
    /^172\.173\./, // Cloudflare 內部IP
    /^172\.174\./, // Cloudflare 內部IP
    /^172\.175\./, // Cloudflare 內部IP
    /^172\.176\./, // Cloudflare 內部IP
    /^172\.177\./, // Cloudflare 內部IP
    /^172\.178\./, // Cloudflare 內部IP
    /^172\.179\./, // Cloudflare 內部IP
    /^172\.180\./, // Cloudflare 內部IP
    /^172\.181\./, // Cloudflare 內部IP
    /^172\.182\./, // Cloudflare 內部IP
    /^172\.183\./, // Cloudflare 內部IP
    /^172\.184\./, // Cloudflare 內部IP
    /^172\.185\./, // Cloudflare 內部IP
    /^172\.186\./, // Cloudflare 內部IP
    /^172\.187\./, // Cloudflare 內部IP
    /^172\.188\./, // Cloudflare 內部IP
    /^172\.189\./, // Cloudflare 內部IP
    /^172\.190\./, // Cloudflare 內部IP
    /^172\.191\./, // Cloudflare 內部IP
    /^172\.192\./, // Cloudflare 內部IP
    /^172\.193\./, // Cloudflare 內部IP
    /^172\.194\./, // Cloudflare 內部IP
    /^172\.195\./, // Cloudflare 內部IP
    /^172\.196\./, // Cloudflare 內部IP
    /^172\.197\./, // Cloudflare 內部IP
    /^172\.198\./, // Cloudflare 內部IP
    /^172\.199\./, // Cloudflare 內部IP
    /^172\.200\./, // Cloudflare 內部IP
    /^172\.201\./, // Cloudflare 內部IP
    /^172\.202\./, // Cloudflare 內部IP
    /^172\.203\./, // Cloudflare 內部IP
    /^172\.204\./, // Cloudflare 內部IP
    /^172\.205\./, // Cloudflare 內部IP
    /^172\.206\./, // Cloudflare 內部IP
    /^172\.207\./, // Cloudflare 內部IP
    /^172\.208\./, // Cloudflare 內部IP
    /^172\.209\./, // Cloudflare 內部IP
    /^172\.210\./, // Cloudflare 內部IP
    /^172\.211\./, // Cloudflare 內部IP
    /^172\.212\./, // Cloudflare 內部IP
    /^172\.213\./, // Cloudflare 內部IP
    /^172\.214\./, // Cloudflare 內部IP
    /^172\.215\./, // Cloudflare 內部IP
    /^172\.216\./, // Cloudflare 內部IP
    /^172\.217\./, // Cloudflare 內部IP
    /^172\.218\./, // Cloudflare 內部IP
    /^172\.219\./, // Cloudflare 內部IP
    /^172\.220\./, // Cloudflare 內部IP
    /^172\.221\./, // Cloudflare 內部IP
    /^172\.222\./, // Cloudflare 內部IP
    /^172\.223\./, // Cloudflare 內部IP
    /^172\.224\./, // Cloudflare 內部IP
    /^172\.225\./, // Cloudflare 內部IP
    /^172\.226\./, // Cloudflare 內部IP
    /^172\.227\./, // Cloudflare 內部IP
    /^172\.228\./, // Cloudflare 內部IP
    /^172\.229\./, // Cloudflare 內部IP
    /^172\.230\./, // Cloudflare 內部IP
    /^172\.231\./, // Cloudflare 內部IP
    /^172\.232\./, // Cloudflare 內部IP
    /^172\.233\./, // Cloudflare 內部IP
    /^172\.234\./, // Cloudflare 內部IP
    /^172\.235\./, // Cloudflare 內部IP
    /^172\.236\./, // Cloudflare 內部IP
    /^172\.237\./, // Cloudflare 內部IP
    /^172\.238\./, // Cloudflare 內部IP
    /^172\.239\./, // Cloudflare 內部IP
    /^172\.240\./, // Cloudflare 內部IP
    /^172\.241\./, // Cloudflare 內部IP
    /^172\.242\./, // Cloudflare 內部IP
    /^172\.243\./, // Cloudflare 內部IP
    /^172\.244\./, // Cloudflare 內部IP
    /^172\.245\./, // Cloudflare 內部IP
    /^172\.246\./, // Cloudflare 內部IP
    /^172\.247\./, // Cloudflare 內部IP
    /^172\.248\./, // Cloudflare 內部IP
    /^172\.249\./, // Cloudflare 內部IP
    /^172\.250\./, // Cloudflare 內部IP
    /^172\.251\./, // Cloudflare 內部IP
    /^172\.252\./, // Cloudflare 內部IP
    /^172\.253\./, // Cloudflare 內部IP
    /^172\.254\./, // Cloudflare 內部IP
    /^172\.255\./, // Cloudflare 內部IP
  ];
  
  return proxyRanges.some(range => range.test(ip));
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