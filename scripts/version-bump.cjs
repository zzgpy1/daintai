#!/usr/bin/env node

/**
 * 版本自动更新脚本
 * 用于 CI/CD 构建时自动生成版本号
 */

const fs = require('fs');
const path = require('path');

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');
const packagePath = path.join(rootDir, 'package.json');

// 检查 package.json 是否存在
if (!fs.existsSync(packagePath)) {
  console.error('❌ package.json 不存在');
  process.exit(1);
}

try {
  // 读取 package.json
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // 生成版本号: YYYY.MM.DD-HHMMSS
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const version = `${year}.${month}.${day}-${hours}${minutes}${seconds}`;
  
  // 更新版本号
  packageJson.version = version;
  
  // 写回 package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`✅ 版本已更新为: ${version}`);
  
  // 可选：写入版本文件供其他脚本使用
  const versionPath = path.join(rootDir, '.version');
  fs.writeFileSync(versionPath, version);
  
  console.log(`✅ 版本文件已写入: .version`);
  
} catch (error) {
  console.error('❌ 版本更新失败:', error.message);
  // 在 CI 环境中，失败时退出 0 以允许构建继续
  if (process.env.CI) {
    console.log('⚠️  CI 环境，版本更新失败但继续构建');
    process.exit(0);
  } else {
    process.exit(1);
  }
}
