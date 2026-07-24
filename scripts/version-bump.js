#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 生成版本号：YYYY.MM.DD-HHMMSS
function generateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}.${month}.${day}-${hours}${minutes}${seconds}`;
}

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

// 生成 build.json 记录构建信息
const buildInfo = {
  version: newVersion,
  buildTime: new Date().toISOString(),
  buildNumber: process.env.GITHUB_RUN_NUMBER || 'local'
};
fs.writeFileSync(
  path.join(__dirname, '../public/build.json'),
  JSON.stringify(buildInfo, null, 2)
);
console.log(`✅ 构建信息已生成: ${buildInfo.buildTime}`);
