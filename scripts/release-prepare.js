#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

let commitInfo = '';
try {
  commitInfo = execSync('git log -1 --pretty=format:"%h - %s"').toString();
} catch (e) {
  commitInfo = 'Latest commit';
}

const releaseNotes = `# 全球电台 v${version}

## 📦 下载说明
请根据您的操作系统选择对应的安装包：

### 🖥️ Windows
- \`global-radio-${version}-win-setup.exe\` - 安装版
- \`global-radio-${version}-win-portable.exe\` - 便携版

### 🍎 macOS
- \`global-radio-${version}-mac.dmg\` - DMG安装包
- \`global-radio-${version}-mac.zip\` - ZIP压缩包

### 🐧 Linux
- \`global-radio-${version}-linux.AppImage\` - AppImage
- \`global-radio-${version}-linux.deb\` - DEB安装包

### 📱 Android
- \`app-release-${version}.apk\` - APK安装包

### 🌐 Web
- Web版本已部署到演示站点

---

## 📝 更新内容
- 基于 commit ${commitInfo}
- 修复已知问题
- 提升应用稳定性

---

感谢使用全球电台！如有问题请反馈至 [Issues](https://github.com/moli-xia/global-radio/issues)
`;

fs.writeFileSync(path.join(__dirname, '../RELEASE_NOTES.md'), releaseNotes, 'utf8');
console.log(`✅ Release notes generated for v${version}`);
