#!/bin/bash

echo "🚀 GlobalRadio 构建脚本"
echo "========================"

# 清理
echo "📦 清理旧构建..."
rm -rf dist dist-electron

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建Web
echo "🔨 构建Web版本..."
npm run build

# 构建Electron
echo "🔨 构建Electron版本..."
npm run electron:build:win

# 构建Android
echo "🔨 构建Android版本..."
npm run build:android

echo "✅ 构建完成！"
echo "📁 Web: ./dist"
echo "📁 Electron: ./dist-electron"
echo "📁 Android: ./android/app/build/outputs/apk/release/"
