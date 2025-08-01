/**
 * IP 白名單更新腳本
 * 用於快速更新環境變數中的IP白名單
 */

const fs = require('fs');
const path = require('path');

// 新的IP地址
const NEW_IP = '218.161.107.138';

// 現有的IP列表
const EXISTING_IPS = [
  '114.33.18.13',
  '125.229.65.83',
  '60.248.164.91',
  '220.132.236.89',
  '211.72.69.222',
  '219.87.170.253',
  '125.228.50.228'
];

// 更新後的完整IP列表
const UPDATED_IPS = [...EXISTING_IPS, NEW_IP];

function updateEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    let envContent = '';
    
    // 如果 .env.local 存在，讀取內容
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // 更新或添加 ALLOWED_IPS
    const allowedIpsLine = `ALLOWED_IPS=${UPDATED_IPS.join(',')}`;
    
    if (envContent.includes('ALLOWED_IPS=')) {
      // 替換現有的 ALLOWED_IPS 行
      envContent = envContent.replace(
        /ALLOWED_IPS=.*/g,
        allowedIpsLine
      );
    } else {
      // 添加新的 ALLOWED_IPS 行
      envContent += `\n# IP 白名單配置\n${allowedIpsLine}\n`;
    }
    
    // 確保 ENABLE_IP_WHITELIST 設置為 true
    if (!envContent.includes('ENABLE_IP_WHITELIST=')) {
      envContent += 'ENABLE_IP_WHITELIST=true\n';
    } else {
      envContent = envContent.replace(
        /ENABLE_IP_WHITELIST=.*/g,
        'ENABLE_IP_WHITELIST=true'
      );
    }
    
    // 寫入文件
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ 成功更新 .env.local 文件');
    console.log(`📝 新增的IP: ${NEW_IP}`);
    console.log(`📋 完整的IP列表: ${UPDATED_IPS.join(', ')}`);
    
  } catch (error) {
    console.error('❌ 更新 .env.local 文件時發生錯誤:', error);
  }
}

function showInstructions() {
  console.log('\n📋 手動配置說明:');
  console.log('如果自動更新失敗，請手動在 .env.local 文件中設置:');
  console.log('\n```env');
  console.log('ENABLE_IP_WHITELIST=true');
  console.log(`ALLOWED_IPS=${UPDATED_IPS.join(',')}`);
  console.log('```');
  console.log('\n🔄 更新後請重新啟動開發服務器:');
  console.log('npm run dev');
}

function main() {
  console.log('🚀 IP 白名單更新工具');
  console.log('=' * 40);
  
  updateEnvFile();
  showInstructions();
  
  console.log('\n✅ 更新完成！你的IP 218.161.107.138 現在應該可以正常訪問了。');
}

if (require.main === module) {
  main();
}

module.exports = {
  updateEnvFile,
  UPDATED_IPS,
  NEW_IP
}; 