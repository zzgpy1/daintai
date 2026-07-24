#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 生成版本号：YYYYMMDD-随机数字
function generateVersion() {
  const now = new Date();
  const date = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `${date}-${random}`;
}

// 更新 package.json
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const newVersion = generateVersion();
packageJson.version = newVersion;

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`✅ 版本已更新为: v${newVersion}`);

// 生成 version.txt 供客户端检测
const versionPath = path.join(__dirname, '../public/version.txt');
fs.writeFileSync(versionPath, newVersion);
console.log(`✅ version.txt 已生成: ${newVersion}`);

// 更新 .env 中的构建时间
const envPath = path.join(__dirname, '../.env');
const buildTime = new Date().toISOString();
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}
// 更新或添加 VITE_BUILD_TIME
if (envContent.includes('VITE_BUILD_TIME=')) {
  envContent = envContent.replace(/VITE_BUILD_TIME=.*/, `VITE_BUILD_TIME=${buildTime}`);
} else {
  envContent += `\nVITE_BUILD_TIME=${buildTime}\n`;
}
fs.writeFileSync(envPath, envContent);
console.log(`✅ 构建时间已更新: ${buildTime}`);
