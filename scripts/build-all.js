#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const platforms = args.length ? args : ['web', 'electron', 'android'];

const valid = ['web', 'electron', 'android'];
platforms.forEach(p => {
  if (!valid.includes(p)) {
    console.error(`❌ 未知平台: ${p}`);
    process.exit(1);
  }
});

console.log('🚀 开始构建所有平台...');
console.log(`📋 目标平台: ${platforms.join(', ')}`);

// 1. 清理旧构建
console.log('🧹 清理旧构建产物...');
execSync('rm -rf dist release', { stdio: 'ignore' });

// 2. 构建 Vue
console.log('📦 构建 Vue 项目...');
execSync('npm run build', { stdio: 'inherit' });

// 3. 按需构建
if (platforms.includes('electron')) {
  console.log('💻 构建 Electron 桌面端...');
  execSync('npm run electron:build', { stdio: 'inherit' });
}

if (platforms.includes('android')) {
  console.log('📱 构建 Android APK...');
  execSync('npm run android:build', { stdio: 'inherit' });
}

if (platforms.includes('web')) {
  console.log('🌐 Web 构建完成，产物在 dist/ 目录');
}

console.log('✅ 所有构建完成！');
console.log(`📁 产物位置:`);
if (platforms.includes('web')) console.log(`   - Web: dist/`);
if (platforms.includes('electron')) console.log(`   - 桌面端: release/`);
if (platforms.includes('android')) console.log(`   - Android: android/app/build/outputs/apk/release/`);
