# GlobalRadio - 全球电台

> 一个基于 Vue 3 + Vite + Capacitor + Electron 的跨平台在线电台应用

## ✨ 功能特点

- 🎵 **电台搜索**：支持全球电台搜索，中文搜索优化
- ▶️ **播放控制**：完整的播放/暂停/音量控制
- ❤️ **收藏与历史**：收藏喜欢的电台，记录收听历史
- 🌙 **暗色主题**：支持亮色/暗色主题切换
- 🌍 **多语言支持**：支持中文、英文、西班牙语、法语、德语、日语、韩语等
- 📱 **跨平台**：Web、Android、iOS、Windows、macOS、Linux
- 🐳 **Docker 部署**：一键 Docker 部署

## 🚀 快速开始

### Docker 部署（推荐）

```bash
docker pull superneed/global-radio:latest
docker run -d --name global-radio --restart unless-stopped -p 8080:80 superneed/global-radio:latest
