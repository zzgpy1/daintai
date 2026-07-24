// scripts/version-bump.cjs
const fs = require('fs');
const path = require('path');

// 读取 package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// 生成版本号: YYYY.MM.DD-HHMMSS
const now = new Date();
const version = 
  now.getFullYear() +
  '.' +
  String(now.getMonth() + 1).padStart(2, '0') +
  '.' +
  String(now.getDate()).padStart(2, '0') +
  '-' +
  String(now.getHours()).padStart(2, '0') +
  String(now.getMinutes()).padStart(2, '0') +
  String(now.getSeconds()).padStart(2, '0');

// 更新版本号
packageJson.version = version;

// 写回 package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ 版本已更新为: ${version}`);
